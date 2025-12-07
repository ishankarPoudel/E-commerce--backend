import AppDataSource from "../../config/data-source/data-source";
import { stripe } from "../../config/stripe/stripe.config";
import { CartEntity } from "../../entities/cart/cart.entity";
import { OrderEntity } from "../../entities/order/orders.entity";
import { ApiError } from "../../utils/apiError";
import { MailService } from "../mail/mail.service";

export class CheckOutService {
  async createPaymentIntent(
    userId: string,
    deliveryMethod: "delivery" | "pickup" = "delivery",
    shippingAddress?: string
  ) {
    const mailer = new MailService();

    const result = await AppDataSource.transaction(async (tx) => {
      const cartRepo = tx.getRepository(CartEntity);
      const orderRepo = tx.getRepository(OrderEntity);

      const cart = await cartRepo.findOne({
        where: { user: { id: userId } },
        relations: [
          "cartItems",
          "cartItems.product",
          "cartItems.product.images",
          "user",
        ],
      });
      if (!cart || !cart.cartItems?.length)
        throw new ApiError(400, "Cart is empty");

      const amount = cart.cartItems.reduce((sum, ci) => {
        if (!ci.product) return sum;
        return sum + Math.round(Number(ci.product.price) * 100) * ci.quantity;
      }, 0);
      if (amount <= 0) throw new ApiError(400, "Invalid cart amount");

      const order = orderRepo.create({
        user: { id: userId } as any,
        status: "pending",
        amount,
        currency: "USD",
        deliveryMethod,
        shippingAddress,
        itemsSnapShot: cart.cartItems.map((ci) => ({
          bagId: ci.product?.id,
          name: ci.product?.name,
          price: ci.product?.price,
          quantity: ci.quantity,
          image: ci.product?.images?.[0]?.image || null,
        })),
      });
      await orderRepo.save(order);

      // for pickup orders,as no payemnt is needed
      if (deliveryMethod === "pickup") {
        return {
          mode: "pickup" as const,
          order,
          email: cart.user?.email,
        };
      }

      // delivery -> create PI
      const paymentIntent = await stripe.paymentIntents.create(
        {
          amount,
          currency: "usd",
          metadata: {
            orderId: order.id,
            userId,
            deliveryMethod,
          },
          automatic_payment_methods: { enabled: true },
          receipt_email: cart.user?.email || undefined,
        },
        { idempotencyKey: `order-${order.id}` }
      );

      order.stripePaymentIntentId = paymentIntent.id;
      await orderRepo.save(order);

      return {
        mode: "delivery" as const,
        order,
        clientSecret: paymentIntent.client_secret,
        email: cart.user?.email,
      };
    });

    // Send email AFTER commit
    if (result.mode === "pickup" && result.email) {
      await mailer.sendOrderConfirmationEmail(result.email, {
        id: result.order.id,
        status: result.order.status,
        amount: (result.order.amount / 100).toFixed(2),
        currency: result.order.currency,
        deliveryMethod: result.order.deliveryMethod,
        itemsSnapShot: result.order.itemsSnapShot,
      });
      return {
        orderId: result.order.id,
        deliveryMethod: result.order.deliveryMethod,
        message: "Pickup order created. Pay in-store.",
      };
    }

    return {
      orderId: result.order.id,
      clientSecret: result.clientSecret,
      deliveryMethod: result.order.deliveryMethod,
    };
  }
}
