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
      relations: ["items", "items.product", "items.product.images"],
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
          product: {
            id: it.product.id,
            name: it.product.name,
            price: it.product.price,
            images: it.product.images?.map((img) => ({
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

  async getAllOrdersForAdmin({
    page = 1,
    pageSize = 10,
    search,
    deliveryMethod,
    status,
    sortBy = "date",
    sortOrder = "DESC",
  }: {
    page?: number;
    pageSize?: number;
    search?: string;
    deliveryMethod?: "delivery" | "pickup";
    status?: "new" | "processing" | "completed" | "cancelled";
    sortBy?: "date" | "totalAmount" | "orderStatus" | "deliveryMethod";
    sortOrder?: "ASC" | "DESC";
  }) {
    const qb = this.orderRepo
      .createQueryBuilder("order")
      .leftJoinAndSelect("order.user", "user")
      .leftJoinAndSelect("order.items", "items")
      .leftJoinAndSelect("items.product", "product");

    if (search) {
      qb.andWhere(
        new Brackets((qb2) => {
          qb2
            .where("user.fullName ILIKE :search", { search: `%${search}%` })
            .orWhere("user.email ILIKE :search", { search: `%${search}%` })
            .orWhere("product.name ILIKE :search", { search: `%${search}%` });
        })
      );
    }

    if (deliveryMethod) {
      qb.andWhere("order.deliveryMethod = :deliveryMethod", { deliveryMethod });
    }

    if (status) {
      qb.andWhere("order.orderStatus = :status", { status });
    }

    const sortMap = {
      date: "order.createdAt",
      totalAmount: "order.totalAmount",
      orderStatus: "order.orderStatus",
      deliveryMethod: "order.deliveryMethod",
    };

    if (sortBy && sortMap[sortBy]) {
      qb.orderBy(sortMap[sortBy], sortOrder);
    } else {
      qb.orderBy("order.createdAt", "DESC"); // default
    }

    qb.skip((page - 1) * pageSize).take(pageSize);

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
