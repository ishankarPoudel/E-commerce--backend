import {
  Body,
  Controller,
  Get,
  Middlewares,
  Patch,
  Path,
  Put,
  Query,
  Request,
  Route,
  SuccessResponse,
  Tags,
} from "tsoa";
import { UserService } from "../../services/user/user.service";
import {
  AuthenticatedRequest,
  authenticateToken,
} from "../../middlewares/auth.middleware";
import { ApiError } from "../../utils/apiError";

@Route("/user")
@Tags("User")
export class UserController extends Controller {
  @Get("/me")
  @Middlewares(authenticateToken)
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

  @Patch("/update-me")
  @SuccessResponse("200", "User updated successfully")
  async updateUserById(
    @Request() req: AuthenticatedRequest,
    @Body() body: any
  ) {
    const userId = req?.user?.id;
    const updatedUser = await new UserService().updateUserById(
      userId as string,
      body
    );
    return {
      success: true,
      message: "User updated successfully",
      data: updatedUser,
    };
  }

  @SuccessResponse("200", "Users retrieved successfully")
  @Get("/all-users")
  async getAllUsers(
    @Request() req: AuthenticatedRequest,
    @Query() page?: number,
    @Query() pageSize?: number,
    @Query() search?: string,
    @Query() sortBy?: "name" | "joinedAt",
    @Query() order?: "asc" | "desc"
  ) {
    const users = await new UserService().getAllUsers(
      page,
      pageSize,
      search,
      sortBy,
      order
    );
    return {
      success: true,
      message: "Users retrieved successfully",
      data: users,
    };
  }
}
