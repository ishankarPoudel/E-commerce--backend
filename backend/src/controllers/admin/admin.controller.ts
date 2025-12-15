import {
  Body,
  Controller,
  Middlewares,
  Post,
  Request,
  Route,
  Tags,
} from "tsoa";
import {
  AuthenticatedRequest,
  authenticateToken,
  authorizeRoles,
  revalidateUser,
} from "../../middlewares/auth.middleware";
import { AdminService } from "../../services/admin/admin.service";
import { ApiError } from "../../utils/apiError";
import { UserRole } from "../../entities/user/userInfo/user.userInfo.entity";

@Route("auth/admin")
@Tags("Admin")
@Middlewares(authenticateToken, revalidateUser, authorizeRoles(UserRole.ADMIN))
export class AdminController extends Controller {
  @Post("/admin-login")
  async adminLogin(@Body() body: { email: string; password: string }) {
    const adminService = await new AdminService().adminLogin(body);
    return {
      success: true,
      message: "Admin logged in successfully",
      data: adminService,
    };
  }

  @Post("/revoke-session")
  async revokeUserSession(
    @Request() req: AuthenticatedRequest,
    @Body() body: { userId: string }
  ) {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized");
    }

    await new AdminService().revokeUserSession(body.userId);
    return {
      success: true,
      message: "User session revoked successfully",
      forceLogout: true,
    };
  }

  @Post("/ban-user")
  @Middlewares(
    authenticateToken,
    revalidateUser,
    authorizeRoles(UserRole.ADMIN)
  )
  async banUser(@Body() body: { userId: string }) {
    const adminService = await new AdminService().banUser(body.userId);
    return {
      success: true,
      message: "User banned successfully",
      forceLogout: true,
    };
  }

  @Post("/unban-user")
  @Middlewares(
    authenticateToken,
    revalidateUser,
    authorizeRoles(UserRole.ADMIN)
  )
  async unbanUser(@Body() body: { userId: string }) {
    const adminService = await new AdminService().unbanUser(body.userId);
    return {
      success: true,
      message: "User unbanned successfully",
      forceLogout: false,
    };
  }
}
