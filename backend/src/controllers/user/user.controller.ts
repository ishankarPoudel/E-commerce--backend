import {
  Controller,
  Get,
  Path,
  Request,
  Route,
  SuccessResponse,
  Tags,
} from "tsoa";
import { UserService } from "../../services/user/user.service";
import { AuthenticatedRequest } from "../../middlewares/auth.middleware";
import { ApiError } from "../../utils/apiError";

@Route("/user")
@Tags("User")
export class UserController extends Controller {
  @Get("/me")
  @SuccessResponse("200", "User retrieved successfully")
  async getUserById(@Request() req: AuthenticatedRequest) {
    const userId = req?.user?.id;
    if (!userId) throw new ApiError(401, "Unauthorized access");
    const user = await new UserService().getUserById(userId as string);
    return {
      success: true,
      message: "User retrieved successfully",
      data: user,
    };
  }
}
