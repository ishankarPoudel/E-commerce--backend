import {
  Body,
  Controller,
  Get,
  Middlewares,
  Post,
  Query,
  Request,
  Route,
  Tags,
} from "tsoa";
import {
  AuthenticatedRequest,
  authenticateToken,
  authorizeRoles,
} from "../../middlewares/auth.middleware";
import { ApiError } from "../../utils/apiError";
import { OrderService } from "../../services/order/order.service";
import { UserRole } from "../../entities/user/userInfo/user.userInfo.entity";

@Route("/order")
@Tags("Order")
export class OrderController extends Controller {
  private getUserIdFromRequest(req: AuthenticatedRequest): string {
    const userId = req.user?.id;
    if (!userId) {
      throw new ApiError(404, "Unauthorized to access");
    }
    return userId;
  }
  @Post("/get-order-by-id")
  @Middlewares(authenticateToken, authorizeRoles(UserRole.USER, UserRole.ADMIN))
  async getOrderById(
    @Request() req: AuthenticatedRequest,
    @Body() order: { orderId?: string },
  ) {
    const userId = this.getUserIdFromRequest(req);
    const orderService = await new OrderService().getOrderById(
      userId,
      order?.orderId as string,
    );
    return {
      success: true,
      message: "Order retrieved successfully",
      data: orderService,
    };
  }

  @Get("/get-all-orders") // get all orders of logged in user
  @Middlewares(authenticateToken, authorizeRoles(UserRole.USER, UserRole.ADMIN))
  async getAllOrders(@Request() req: AuthenticatedRequest) {
    const userId = this.getUserIdFromRequest(req);
    const orders = await new OrderService().getAllOrders(userId);
    return {
      success: true,
      message: "Orders retrieved successfully",
      data: orders,
    };
  }

  //admin: get all orders with server side pagination
  @Get("/admin/get-all-orders")
  @Middlewares(authenticateToken, authorizeRoles(UserRole.ADMIN))
  async getAllOrdersForAdmin(
    @Request() req: AuthenticatedRequest,
    @Query() page?: number,
    @Query() pageSize?: number,
    @Query() search?: string,
    @Query() sortBy?: "date" | "totalAmount" | "orderStatus" | "deliveryMethod",
    @Query() deliveryMethod?: "delivery" | "pickup",
    @Query() status?: "new" | "processing" | "completed" | "cancelled",
    @Query() sortOrder?: "ASC" | "DESC",
  ) {
    const orders = await new OrderService().getAllOrdersForAdmin({
      page,
      pageSize,
      search,
      sortBy,
      deliveryMethod,
      status,
      sortOrder,
    });
    return {
      success: true,
      message: "Orders retrieved successfully",
      data: orders,
    };
  }

  //admin: get order details by orderID
  @Get("/admin/get-order-details/:orderId")
  @Middlewares(authenticateToken, authorizeRoles(UserRole.ADMIN))
  async getOrderDetailsByOrderIdForAdmin(@Query() orderId: string) {
    const order = await new OrderService().getOrderDetailsByOrderIdForAdmin(
      orderId,
    );
    return {
      success: true,
      message: "Order details retrieved successfully",
      data: order,
    };
  }

  //admin: update oerder status
  @Post("/admin/update-order-status")
  @Middlewares(authenticateToken, authorizeRoles(UserRole.ADMIN))
  async updateOrderStatus(
    @Body()
    body: {
      orderId: string;
      status: "new" | "processing" | "completed" | "cancelled";
    },
  ) {
    const order = await new OrderService().updateOrderStatusForAdmin(
      body.orderId,
      body.status,
    );
    return {
      success: true,
      message: "Order status updated successfully",
      data: order,
    };
  }

  //admin: get all orders of a specific user
  @Get("/admin/get-user-orders/:userId")
  @Middlewares(authenticateToken, authorizeRoles(UserRole.ADMIN))
  async getAllOrdersOfUserForAdmin(@Query() userId: string) {
    const orders = await new OrderService().getAllOrdersForUserAdmin(userId);
    return {
      success: true,
      message: "User orders retrieved successfully",
      data: orders,
    };
  }
}
