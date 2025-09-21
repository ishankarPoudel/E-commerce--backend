import { AppDataSource } from "../../config/data-source/data-source";
import { stripe } from "../../config/stripe/stripe.config";
import { CartEntity } from "../../entities/cart/cart.entity";
import { OrderEntity } from "../../entities/order/orders.entity";
import { ApiError } from "../../utils/apiError";

export class CheckOutService {
  async createPaymentIntent(userId: string) {
    return AppDataSource.transaction(async (transcationEntityManager) => {
      const cartRepo = transcationEntityManager.getRepository(CartEntity);
      const orderRepo = transcationEntityManager.getRepository(OrderEntity);

      const cart = await cartRepo.findOne({
        where: {
          user: { id: userId },
        },
        relations: ["cartItems", "cartItems.bag"],
      });

      if (!cart || !cart.cartItems?.length) {
        throw new ApiError(400, "Cart is empty");
      }

      //computing total amount
      const amount = cart.cartItems.reduce((sum, ci) => {
        if (!ci.bag) return sum;
        return sum + Math.round(Number(ci.bag.price) * 100) * ci.quantity;
      }, 0);
      if (amount <= 0) throw new ApiError(400, "Invalid cart amount");

      //now creating order default pending state
      const order = orderRepo.create({
        user: { id: userId },
        status: "pending",
        amount,
        currency: "CAD",
        itemsSnapShot: cart.cartItems.map((item) => {
          return {
            cartItemId: item.id,
            bagId: item.bag?.id,
            name: item.bag?.name,
            price: item.bag?.price,
            quantity: item.quantity,
          };
        }),
      });
      await orderRepo.save(order);

      //creating the paymentIntent

      const paymentIntent = await stripe.paymentIntents.create(
        {
          amount,
          currency: "CAD",
          receipt_email: cart?.user?.email || undefined,
          metadata: {
            orderId: order.id,
            userId: userId,
          },
        },
        {
          idempotencyKey: `order-${order.id}`,
        }
      );
      order.stripePaymentIntentId = paymentIntent.id;
      await orderRepo.save(order);
      return {
        orderId: order.id,
        clientSecret: paymentIntent.client_secret,
      };
    });
  }
}
