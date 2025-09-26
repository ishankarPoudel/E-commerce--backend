import { Body, Controller, Get, Post, Request, Route, Tags } from "tsoa";
import { AuthenticatedRequest } from "../../middlewares/auth.middleware";
import { ApiError } from "../../utils/apiError";
import { OrderService } from "../../services/order/order.service";

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
  async getOrderById(
    @Request() req: AuthenticatedRequest,
    @Body() order: { orderId?: string }
  ) {
    const userId = this.getUserIdFromRequest(req);
    const orderService = await new OrderService().getOrderById(
      userId,
      order?.orderId as string
    );
    return {
      success: true,
      message: "Order retrieved successfully",
      data: orderService,
    };
  }

  @Get("/get-all-orders")
  async getAllOrders(@Request() req: AuthenticatedRequest) {
    const userId = this.getUserIdFromRequest(req);
    const orders = await new OrderService().getAllOrders(userId);
    return {
      success: true,
      message: "Orders retrieved successfully",
      data: orders,
    };
  }
}
