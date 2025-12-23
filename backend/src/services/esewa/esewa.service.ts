import crypto from "crypto";
import AppDataSource from "../../config/data-source/data-source";
import { CartEntity } from "../../entities/cart/cart.entity";
import { OrderEntity } from "../../entities/order/orders.entity";
import { ApiError } from "../../utils/apiError";
import { CartService } from "../cart/cart.services";
import axios from "axios";
import { ref } from "process";
import { MailService } from "../mail/mail.service";

export class EsewaService {
  private orderRepo = AppDataSource.getRepository(OrderEntity);
  private cartService = new CartService();

  /**
   * Generate eSewa HMAC SHA256 signature
   */

  private generateSignature(
    totalAmount: number,
    transactionUuid: string,
    productCode: string
  ) {
    const message = `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${productCode}`;
    return crypto
      .createHmac("sha256", process.env.ESEWA_SECRET_KEY!)
      .update(message)
      .digest("base64");
  }

  async initiateEsewaPayment(
    userId: string,
    deliveryMethod: "delivery" | "pickup" = "delivery",
    shippingAddress?: string
  ) {
    const cartExists = await this.cartService.getCartByUserId(userId);
    if (!cartExists) {
      throw new ApiError(400, "Cart is empty. Cannot initiate payment.");
    }
    if (!cartExists || cartExists.cart.cartItems.length === 0) {
      throw new ApiError(400, "Cart is empty. Cannot initiate payment.");
    }
    const amount = cartExists.cart.cartItems.reduce((sum, ci) => {
      if (!ci.product) return sum;
      return sum + Math.round(Number(ci.product.price) * 100) * ci.quantity;
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
        image: ci.product?.images?.[0]?.image || null,
      })),
    });
    await this.orderRepo.save(order);

    // Esewa payload, if not beiing used , 0 must be sent for these charges
    const taxAmount = 0;
    const serviceCharge = 0;
    const deliveryCharge = 0;

    const totalAmount = amount + taxAmount + serviceCharge + deliveryCharge;

    const signedFields = "total_amount,transaction_uuid,product_code";
    const signature = this.generateSignature(
      totalAmount,
      esewaTransactionUuid,
      process.env.ESEWA_PRODUCT_CODE!
    );
    const formUrl = process.env.ESEWA_PAYMENT_URL!;

    // form to be submitted by frontend , form is hidden and auto submitted
    return {
      formUrl: process.env.ESEWA_FORM_URL!,
      params: {
        amount: amount,
        tax_amount: taxAmount || 0,
        total_amount: totalAmount || 0,
        transaction_uuid: esewaTransactionUuid,
        product_code: process.env.ESEWA_PRODUCT_CODE!,
        product_service_charge: 0,
        product_delivery_charge: 0,
        success_url: process.env.ESEWA_SUCCESS_URL!,
        failure_url: process.env.ESEWA_FAILURE_URL!,
        signed_field_names: "total_amount,transaction_uuid,product_code",
        signature,
      },
    };
  }

  async verifyEsewaPayment(
    esewaTransactionUuid: string,
    retries = 3,
    delayMs = 2000
  ) {
    const order = await this.orderRepo.findOne({
      where: { esewaTransactionUuid },
      relations: ["user"],
    });
    if (!order) throw new ApiError(404, "Order not found for this transaction");

    const verifyUrl = `${process.env.ESEWA_VERIFY_URL}?product_code=${process.env.ESEWA_PRODUCT_CODE}&total_amount=${order.amount}&transaction_uuid=${order.esewaTransactionUuid}`;

    let emailSent = false;
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await axios.get(verifyUrl);
        const { status, ref_id } = response.data;
        const oldEsewaStatus = order.esewaStatus;

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

        if (
          order.esewaStatus === "COMPLETE" &&
          oldEsewaStatus !== "COMPLETE" &&
          !emailSent
        ) {
          try {
            await new MailService().sendOrderConfirmationEmail(
              order.user.email,
              order
            );
            emailSent = true;
          } catch (emailError) {
            console.error(
              `Failed to send order confirmation email:`,
              emailError
            );
          }
        }
        const shouldRetry = status === "PENDING" && attempt < retries;

        if (shouldRetry) {
          await new Promise((res) => setTimeout(res, delayMs)); // wait before retry
          continue;
        }

        return {
          status: order.status,
          ref_id: order.esewaRefId,
          esewaStatus: order.esewaStatus,
          shouldRetry: false,
          orderId: order.id,
        };
      } catch (err) {
        if (attempt === retries)
          throw new ApiError(500, "Failed to verify eSewa payment");
        await new Promise((res) => setTimeout(res, delayMs));
      }
    }
  }
}
