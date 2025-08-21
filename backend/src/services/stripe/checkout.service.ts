import { AppDataSource } from "../../config/data-source/data-source";
import { CartEntity } from "../../entities/cart/cart.entity";
import { OrderEntity } from "../../entities/order/orders.entity";

export class CheckOutService {
  private cartRepo = AppDataSource.getRepository(CartEntity);
  private orderRepo = AppDataSource.getRepository(OrderEntity);

  async createPaymentIntent(userId: string) {
    return AppDataSource.transaction(async (transcationEntityManager) => {
      const cartRepo = transcationEntityManager.getRepository(CartEntity);
      const orderRepo = transcationEntityManager.getRepository(OrderEntity);
    });
  }
}
