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
  authorizeRoles,
} from "../../middlewares/auth.middleware";
import { ApiError } from "../../utils/apiError";
import {
  UserEntity,
  UserRole,
} from "../../entities/user/userInfo/user.userInfo.entity";
import AppDataSource from "../../config/data-source/data-source";

@Route("/user")
@Tags("User")
export class UserController extends Controller {
  @Get("/me")
  @Middlewares(authenticateToken)
  @SuccessResponse("200", "User retrieved successfully")
  async getCurrentUser(@Request() req: AuthenticatedRequest) {
    if (!req.user) {
      this.setStatus(401);
      return {
        success: false,
        message: "Unauthorized",
      };
    }
    const userRepo = AppDataSource.getRepository(UserEntity);
    const user = await userRepo.findOne({
      where: { id: req.user.id },
      select: ["id", "fullName", "email", "role", "tokenVersion"], // ✅ Only select needed fields
    });
    if (!user) {
      this.setStatus(404);
      return {
        success: false,
        message: "User not found",
      };
    }
    return {
      success: true,
      data: {
        userId: user.id,
        role: user.role,
        fullName: user.fullName,
        email: user.email,
        tokenVersion: user.tokenVersion,
      },
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
