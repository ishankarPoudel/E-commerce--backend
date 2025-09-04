import { AppDataSource } from "../../config/data-source/data-source";
import { OrderEntity } from "../../entities/order/orders.entity";
import { ApiError } from "../../utils/apiError";

export class OrderService {
  private orderRepo = AppDataSource.getRepository(OrderEntity);
  // get orders by orderId
  async getOrderById(userId: string, orderId: string) {
    const order = await this.orderRepo.findOne({
      where: { id: orderId, user: { id: userId } },
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
      relations: ["bags", "items.bag"],
      order: { createdAt: "DESC" },
    });
    if (orders.length === 0) {
      throw new ApiError(400, "No orders found");
    }
    return orders;
  }
}
