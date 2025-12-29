import AppDataSource from "../../config/data-source/data-source";
import { BagEntity } from "../../entities/bag/bag.entity";
import { OrderEntity } from "../../entities/order/orders.entity";
import { UserEntity } from "../../entities/user/userInfo/user.userInfo.entity";
import { Between, MoreThan } from "typeorm";

export interface DashboardAnalyticsResponse {
  revenue: RevenueMetrics;
  users: UserMetrics;
  orders: OrderMetrics;
  recentOrders: RecentOrder[];
  topProducts: TopProduct[];
  salesChart: SalesChartData[];
  orderStatusBreakdown: OrderStatusBreakdown[];
}

export interface RevenueMetrics {
  total: number;
  previousMonth: number;
  percentageChange: number;
  currency: string;
  averageOrderValue: number;
}

export interface UserMetrics {
  total: number;
  active: number;
  newThisMonth: number;
  percentageChange: number;
  bannedUsers: number;
}

export interface OrderMetrics {
  total: number;
  pending: number;
  completed: number;
  cancelled: number;
  percentageChange: number;
  conversionRate: number;
}

export interface RecentOrder {
  id: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  status: string;
  createdAt: Date;
  itemCount: number;
}

export interface TopProduct {
  id: string;
  name: string;
  category: string;
  soldCount: number;
  revenue: number;
  image: string;
}

export interface SalesChartData {
  date: string;
  revenue: number;
  orders: number;
}

export interface OrderStatusBreakdown {
  status: string;
  count: number;
  percentage: number;
}

export interface AnalyticsQueryParams {
  startDate?: string;
  endDate?: string;
  period?: "week" | "month" | "quarter" | "year";
}

export class AnalyticsService {
  private orderRepo = AppDataSource.getRepository(OrderEntity);
  private userRepo = AppDataSource.getRepository(UserEntity);
  private productRepo = AppDataSource.getRepository(BagEntity);

  async getDashboardAnalytics(
    startDate?: Date,
    endDate?: Date
  ): Promise<DashboardAnalyticsResponse> {
    const now = new Date();
    const start = startDate || new Date(now.getFullYear(), now.getMonth(), 1);
    const end = endDate || now;

    // Previous period for comparison
    const periodLength = end.getTime() - start.getTime();
    const previousStart = new Date(start.getTime() - periodLength);
    const previousEnd = start;

    // Fetch all data in parallel
    const [
      revenue,
      users,
      orders,
      recentOrders,
      topProducts,
      salesChart,
      orderStatusBreakdown,
    ] = await Promise.all([
      this.getRevenueMetrics(start, end, previousStart, previousEnd),
      this.getUserMetrics(start, end, previousStart, previousEnd),
      this.getOrderMetrics(start, end, previousStart, previousEnd),
      this.getRecentOrders(10),
      this.getTopProducts(start, end, 5),
      this.getSalesChartData(start, end),
      this.getOrderStatusBreakdown(start, end),
    ]);

    return {
      revenue,
      users,
      orders,
      recentOrders,
      topProducts,
      salesChart,
      orderStatusBreakdown,
    };
  }

  private async getRevenueMetrics(
    start: Date,
    end: Date,
    previousStart: Date,
    previousEnd: Date
  ): Promise<RevenueMetrics> {
    // Current period revenue
    const currentOrders = await this.orderRepo.find({
      where: {
        createdAt: Between(start, end),
        status: "paid",
      },
    });

    const total = currentOrders.reduce((sum, order) => sum + order.amount, 0);
    const orderCount = currentOrders.length;

    // Previous period revenue
    const previousOrders = await this.orderRepo.find({
      where: {
        createdAt: Between(previousStart, previousEnd),
        status: "paid",
      },
    });

    const previousMonth = previousOrders.reduce(
      (sum, order) => sum + order.amount,
      0
    );

    const percentageChange =
      previousMonth > 0
        ? ((total - previousMonth) / previousMonth) * 100
        : total > 0
        ? 100
        : 0;

    const averageOrderValue = orderCount > 0 ? total / orderCount : 0;

    return {
      total,
      previousMonth,
      percentageChange: Math.round(percentageChange * 10) / 10,
      currency: "NPR",
      averageOrderValue: Math.round(averageOrderValue),
    };
  }

  private async getUserMetrics(
    start: Date,
    end: Date,
    previousStart: Date,
    previousEnd: Date
  ): Promise<UserMetrics> {
    const [total, newThisMonth, previousMonthUsers, bannedUsers] =
      await Promise.all([
        this.userRepo.count(),
        this.userRepo.count({
          where: {
            createdAt: Between(start, end),
          },
        }),
        this.userRepo.count({
          where: {
            createdAt: Between(previousStart, previousEnd),
          },
        }),
        this.userRepo.count({
          where: {
            isBanned: true,
          },
        }),
      ]);

    // Active users (logged in within last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const active = await this.userRepo.count({
      where: {
        updatedAt: MoreThan(thirtyDaysAgo),
      },
    });

    const percentageChange =
      previousMonthUsers > 0
        ? ((newThisMonth - previousMonthUsers) / previousMonthUsers) * 100
        : newThisMonth > 0
        ? 100
        : 0;

    return {
      total,
      active,
      newThisMonth,
      percentageChange: Math.round(percentageChange * 10) / 10,
      bannedUsers,
    };
  }

  private async getOrderMetrics(
    start: Date,
    end: Date,
    previousStart: Date,
    previousEnd: Date
  ): Promise<OrderMetrics> {
    const [currentOrders, previousOrders] = await Promise.all([
      this.orderRepo.find({
        where: {
          createdAt: Between(start, end),
        },
      }),
      this.orderRepo.find({
        where: {
          createdAt: Between(previousStart, previousEnd),
        },
      }),
    ]);

    const total = currentOrders.length;
    const pending = currentOrders.filter((o) => o.status === "pending").length;
    const completed = currentOrders.filter((o) => o.status === "paid").length;
    const cancelled = currentOrders.filter(
      (o) => o.status === "refunded"
    ).length;

    const percentageChange =
      previousOrders.length > 0
        ? ((total - previousOrders.length) / previousOrders.length) * 100
        : total > 0
        ? 100
        : 0;

    const conversionRate = total > 0 ? (completed / total) * 100 : 0;

    return {
      total,
      pending,
      completed,
      cancelled,
      percentageChange: Math.round(percentageChange * 10) / 10,
      conversionRate: Math.round(conversionRate * 10) / 10,
    };
  }

  private async getRecentOrders(limit: number): Promise<RecentOrder[]> {
    const orders = await this.orderRepo.find({
      relations: ["user"],
      order: {
        createdAt: "DESC",
      },
      take: limit,
    });

    return orders.map((order) => ({
      id: order.id,
      customerName: order.user?.fullName || "Guest",
      customerEmail: order.user?.email || "N/A",
      amount: order.amount,
      status: order.orderStatus,
      createdAt: order.createdAt,
      itemCount: Array.isArray(order.itemsSnapShot)
        ? order.itemsSnapShot.length
        : 0,
    }));
  }

  private async getTopProducts(
    start: Date,
    end: Date,
    limit: number
  ): Promise<TopProduct[]> {
    const orders = await this.orderRepo.find({
      where: {
        createdAt: Between(start, end),
        status: "paid",
      },
    });

    // Count product sales from order snapshots
    const productSales = new Map<
      string,
      { name: string; count: number; revenue: number; image: string }
    >();

    orders.forEach((order) => {
      if (Array.isArray(order.itemsSnapShot)) {
        order.itemsSnapShot.forEach((item: any) => {
          const existing = productSales.get(item.bagId) || {
            name: item.name,
            count: 0,
            revenue: 0,
            image: item.image,
          };
          existing.count += item.quantity;
          existing.revenue += item.price * item.quantity;
          productSales.set(item.bagId, existing);
        });
      }
    });

    // Sort by count and take top products
    const topProducts = Array.from(productSales.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, limit)
      .map(([id, data]) => ({
        id,
        name: data.name,
        category: "Bag", // You can enhance this with actual category
        soldCount: data.count,
        revenue: data.revenue,
        image: data.image,
      }));

    return topProducts;
  }

  private async getSalesChartData(
    start: Date,
    end: Date
  ): Promise<SalesChartData[]> {
    const orders = await this.orderRepo.find({
      where: {
        createdAt: Between(start, end),
        status: "paid",
      },
      order: {
        createdAt: "ASC",
      },
    });

    // Group by date
    const salesByDate = new Map<string, { revenue: number; orders: number }>();

    orders.forEach((order) => {
      const date = order.createdAt.toISOString().split("T")[0];
      const existing = salesByDate.get(date) || { revenue: 0, orders: 0 };
      existing.revenue += order.amount;
      existing.orders += 1;
      salesByDate.set(date, existing);
    });

    return Array.from(salesByDate.entries()).map(([date, data]) => ({
      date,
      revenue: data.revenue,
      orders: data.orders,
    }));
  }

  private async getOrderStatusBreakdown(
    start: Date,
    end: Date
  ): Promise<OrderStatusBreakdown[]> {
    const orders = await this.orderRepo.find({
      where: {
        createdAt: Between(start, end),
      },
    });

    const total = orders.length;
    const statusCounts = new Map<string, number>();

    orders.forEach((order) => {
      const status = order.orderStatus;
      statusCounts.set(status, (statusCounts.get(status) || 0) + 1);
    });

    return Array.from(statusCounts.entries()).map(([status, count]) => ({
      status,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100 * 10) / 10 : 0,
    }));
  }
}
