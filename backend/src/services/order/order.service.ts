import { AppDataSource } from "../../config/data-source/data-source";
import { OrderEntity } from "../../entities/order/orders.entity";
import { ApiError } from "../../utils/apiError";

export class OrderService {
  private orderRepo = AppDataSource.getRepository(OrderEntity);
  // get orders by orderId
  async getOrderById(userId: string, orderId: string) {
    const order = await this.orderRepo.findOne({
      where: { id: orderId, user: { id: userId } },
      relations: ["items", "items.bag", "items.bag.bagImages"],
    });
    if (!order) {
      throw new ApiError(400, "Order not found");
    }
    return order;
  }

  // get all orders of logged in user
  async getAllOrders(userId: string) {
    const orders = await this.orderRepo.find({
      where: { user: { id: userId } },
      relations: ["items", "items.bag", "items.bag.bagImages"],
      order: { createdAt: "DESC" },
    });

    if (!orders.length) {
      return { orders: [] };
    }
    const sanitizedOrders = orders.map((order) => {
      const { stripeChargeId, stripePaymentIntentId, items, ...rest } = order;

      return {
        ...rest,
        items: items?.map((it) => ({
          id: it.id,
          quantity: it.quantity,
          unitPrice: it.unitPrice,
          bag: {
            id: it.bag.id,
            name: it.bag.name,
            price: it.bag.price,
            images: it.bag.bagImages?.map((img) => ({
              id: img.id,
              url: img.image,
            })),
          },
        })),
      };
    });

    return { orders: sanitizedOrders };
  }
}
