import crypto from "crypto";
import AppDataSource from "../../config/data-source/data-source";
import { OrderEntity } from "../../entities/order/orders.entity";
import { ApiError } from "../../utils/apiError";
import { CartService } from "../cart/cart.services";
import axios from "axios";

import { MailService } from "../mail/mail.service";

export class EsewaService {
  private orderRepo = AppDataSource.getRepository(OrderEntity);
  private cartService = new CartService();

  private generateSignature(payload: {
    total_amount: string;
    transaction_uuid: string;
    product_code: string;
  }) {
    const signedFieldNames = "total_amount,transaction_uuid,product_code";

    const message = signedFieldNames
      .split(",")
      .map((key) => `${key}=${payload[key as keyof typeof payload]}`)
      .join(",");

    return crypto
      .createHmac("sha256", process.env.ESEWA_SECRET_KEY!)
      .update(message)
      .digest("base64");
  }

  async initiateEsewaPayment(
    userId: string,
    deliveryMethod: "delivery" | "pickup" = "delivery",
    shippingAddress?: string,
  ) {
    const cartExists = await this.cartService.getCartByUserId(userId);
    if (!cartExists || cartExists.cart.cartItems.length === 0) {
      throw new ApiError(400, "Cart is empty. Cannot initiate payment.");
    }

    const amount = cartExists.cart.cartItems.reduce((sum, ci) => {
      if (!ci.product) return sum;
      return sum + Math.round(Number(ci.product.price)) * ci.quantity;
    }, 0);

    if (amount <= 0) throw new ApiError(400, "Invalid cart amount");

    const esewaTransactionUuid = `esewa-${Date.now()}-${crypto
      .randomBytes(6)
      .toString("hex")}`;

    const order = this.orderRepo.create({
      user: { id: userId } as any,
      amount,
      currency: "NPR",
      status: "pending",
      orderStatus: "new",
      paymentProvider: "esewa",
      esewaTransactionUuid,
      deliveryMethod,
      shippingAddress,
      itemsSnapShot: cartExists.cart.cartItems.map((ci) => ({
        bagId: ci.product?.id,
        name: ci.product?.name,
        price: ci.product?.price,
        quantity: ci.quantity,
        color: ci.color,
        size: ci.size,
        images:
          ci.product?.images?.map((img) => ({
            id: img.id,
            url: img.url,
            publicId: img.publicId,
            altText: img.altText,
            format: img.format,
            width: img.width,
            height: img.height,
          })) || [],
      })),
    });

    await this.orderRepo.save(order);

    // Charges (must be included in total_amount)
    const taxAmount = 0;
    const serviceCharge = 5;
    const deliveryCharge = 0;

    const totalAmount = amount + taxAmount + serviceCharge + deliveryCharge;

    // payload MUST be strings
    const payload = {
      total_amount: String(totalAmount),
      transaction_uuid: esewaTransactionUuid,
      product_code: process.env.ESEWA_PRODUCT_CODE!,
    };

    const signedFieldNames = "total_amount,transaction_uuid,product_code";
    const signature = this.generateSignature(payload);

    return {
      formUrl: process.env.ESEWA_FORM_URL!,
      params: {
        amount: String(amount),
        tax_amount: String(taxAmount),
        total_amount: payload.total_amount,
        transaction_uuid: payload.transaction_uuid,
        product_code: payload.product_code,
        product_service_charge: String(serviceCharge),
        product_delivery_charge: String(deliveryCharge),
        success_url: process.env.ESEWA_SUCCESS_URL!,
        failure_url: process.env.ESEWA_FAILURE_URL!,
        signed_field_names: signedFieldNames,
        signature,
      },
    };
  }

  async verifyEsewaPayment(esewaTransactionUuid: string) {
    const order = await this.orderRepo.findOne({
      where: { esewaTransactionUuid },
      relations: ["user"],
    });

    if (!order) throw new ApiError(404, "Order not found for this transaction");

    // If order is already complete, return immediately
    if (order.esewaStatus === "COMPLETE") {
      return {
        status: order.status,
        ref_id: order.esewaRefId,
        esewaStatus: order.esewaStatus,
        orderId: order.id,
      };
    }

    const serviceCharge = 5;
    const totalAmount = order.amount + serviceCharge;
    const verifyUrl = `${process.env.ESEWA_VERIFY_URL}?product_code=${process.env.ESEWA_PRODUCT_CODE}&total_amount=${totalAmount}&transaction_uuid=${order.esewaTransactionUuid}`;

    try {
      const response = await axios.get(verifyUrl);
      const { status, ref_id } = response.data;

      // Capture old status BEFORE any changes
      const oldEsewaStatus = order.esewaStatus as string | undefined;

      switch (status) {
        case "COMPLETE":
          order.status = "paid";
          order.orderStatus = "processing";
          order.esewaStatus = "COMPLETE";
          order.esewaRefId = ref_id;
          break;
        case "PENDING":
          order.status = "pending";
          order.orderStatus = "new";
          order.esewaStatus = "PENDING";
          break;
        case "FULL_REFUND":
        case "PARTIAL_REFUND":
          order.status = "refunded";
          order.orderStatus = "cancelled";
          order.esewaStatus = status;
          order.esewaRefId = ref_id;
          break;
        case "CANCELED":
        case "NOT_FOUND":
        case "AMBIGUOUS":
          order.status = "failed";
          order.orderStatus = "cancelled";
          order.esewaStatus = status;
          order.esewaRefId = ref_id;
          break;
        default:
          order.status = "failed";
          order.orderStatus = "cancelled";
          order.esewaStatus = status;
          order.esewaRefId = ref_id;
      }
      await this.orderRepo.save(order);

      // Send email ONLY if status just changed to COMPLETE
      if (status === "COMPLETE" && oldEsewaStatus !== "COMPLETE") {
        try {
          await new MailService().sendOrderConfirmationEmail(
            order.user.email,
            order,
          );
        } catch (emailError) {
          console.error("Failed to send email:", emailError);
        }
      }
      return {
        status: order.status,
        ref_id: order.esewaRefId,
        esewaStatus: order.esewaStatus,
        orderId: order.id,
      };
    } catch (err) {
      console.error("Error verifying eSewa payment:", err);
      throw new ApiError(
        500,
        "Failed to verify eSewa payment. Please try again.",
      );
    }
  }
}
