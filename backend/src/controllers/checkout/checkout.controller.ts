import {
  Body,
  Controller,
  Middlewares,
  Post,
  Request,
  Route,
  Tags,
} from "tsoa";
import { AuthenticatedRequest } from "../../middlewares/auth.middleware";
import { ApiError } from "../../utils/apiError";
import { CheckOutService } from "../../services/stripe/checkout.service";

@Route("checkout")
@Tags("Checkout")
export class CheckOutController extends Controller {
  @Post("/create-payment-intent")
  async createPaymentIntent(
    @Request() req: AuthenticatedRequest,
    @Body()
    body: { deliveryMethod?: "delivery" | "pickup"; shippingAddress?: string }
  ) {
    const userId = req.user?.id;
    if (!userId) throw new ApiError(401, "Unauthorized");

    if (body.deliveryMethod === "delivery" && !body.shippingAddress) {
      throw new ApiError(
        400,
        "Shipping address is required for delivery method"
      );
    }
    const checkoutIntent = await new CheckOutService().createPaymentIntent(
      userId,
      body.deliveryMethod,
      body.shippingAddress
    );
    return {
      success: true,
      message: "Payment intent created successfully",
      data: checkoutIntent,
    };
  }
}
