import { Brackets } from "typeorm";
import AppDataSource from "../../config/data-source/data-source";
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
      relations: ["items", "items.bag", "items.bag.images"],
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
            images: it.bag.images?.map((img) => ({
              id: img.id,
              url: img.image,
            })),
          },
        })),
      };
    });

    return { orders: sanitizedOrders };
  }

  //admin: get all orders , server side pagination

  async getAllOrdersForAdmin(
    page: number = 1,
    pageSize: number = 10,
    search?: string,
    sortBy: "date" | "totalAmount" | "orderStatus" | "deliveryMethod" = "date"
  ) {
    const qb = this.orderRepo
      .createQueryBuilder("order")
      .leftJoinAndSelect("order.user", "user")
      .leftJoinAndSelect("order.items", "items")
      .leftJoinAndSelect("items.bag", "bag");

    if (search) {
      qb.andWhere(
        new Brackets((qb2) => {
          qb2
            .where("user.fullName ILIKE :search", { search: `%${search}%` })
            .orWhere("user.email ILIKE :search", { search: `%${search}%` })
            .orWhere("bag.name ILIKE :search", { search: `%${search}%` });
        })
      );
    }
    // Sorting logic
    const sortMap: Record<string, string> = {
      date: "order.createdAt",
      totalAmount: "order.totalAmount",
      orderStatus: "order.orderStatus",
      deliveryMethod: "order.deliveryMethod",
    };

    qb.orderBy(sortMap[sortBy], "DESC");

    // Pagination
    if (page) {
      qb.skip((page - 1) * pageSize).take(pageSize);
    }

    const [orders, total] = await qb.getManyAndCount();

    return {
      data: orders,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }
}
