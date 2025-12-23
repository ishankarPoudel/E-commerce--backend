import {
  Body,
  Controller,
  Middlewares,
  Post,
  Route,
  Tags,
  Request,
} from "tsoa";
import { EsewaService } from "../../services/esewa/esewa.service";
import {
  AuthenticatedRequest,
  authenticateToken,
  authorizeRoles,
} from "../../middlewares/auth.middleware";
import { UserRole } from "../../entities/user/userInfo/user.userInfo.entity";
import { ApiError } from "../../utils/apiError";
import { OrderService } from "../../services/order/order.service";

@Route("payment/esewa")
@Tags("eSewa Payment")
export class EsewaController extends Controller {
  private esewaService = new EsewaService();

  @Post("/initiate")
  @Middlewares(authenticateToken, authorizeRoles(UserRole.ADMIN, UserRole.USER))
  async initiateEsewaPayment(
    @Request() req: AuthenticatedRequest,
    @Body()
    body: {
      deliveryMethod?: "delivery" | "pickup";
      shippingAddress?: string;
    }
  ) {
    const { deliveryMethod, shippingAddress } = body;

    if (!req.user) {
      this.setStatus(401);
      return {
        message: "Unauthorized",
      };
    }
    const paymentInitiation = await this.esewaService.initiateEsewaPayment(
      req.user.id,
      deliveryMethod,
      shippingAddress
    );
    return {
      message: "eSewa payment initiated successfully",
      data: paymentInitiation,
    };
  }

  @Post("/payment-verify")
  @Middlewares(authenticateToken, authorizeRoles(UserRole.ADMIN, UserRole.USER))
  async verifyEsewaPayment(
    @Body() body: { esewaTransactionUuid: string },
    @Request() request: AuthenticatedRequest
  ) {
    const { esewaTransactionUuid } = body;

    console.log(
      "Verifying eSewa payment for transaction UUID:",
      esewaTransactionUuid
    );

    const verificationResult = await this.esewaService.verifyEsewaPayment(
      esewaTransactionUuid
    );
    return {
      message: "eSewa payment verification completed",
      data: verificationResult,
    };
  }
}
