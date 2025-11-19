import { Body, Controller, Post, Request, Route, Tags } from "tsoa";
import { AuthenticatedRequest } from "../../middlewares/auth.middleware";
import { AdminService } from "../../services/admin/admin.service";
import { ApiError } from "../../utils/apiError";

@Route("auth/admin")
@Tags("Admin")
export class AdminController extends Controller {
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
  async banUser(@Body() body: { userId: string }) {
    const adminService = await new AdminService().banUser(body.userId);
    return {
      success: true,
      message: "User banned successfully",
      forceLogout: true,
    };
  }

  @Post("/unban-user")
  async unbanUser(@Body() body: { userId: string }) {
    const adminService = await new AdminService().unbanUser(body.userId);
    return {
      success: true,
      message: "User unbanned successfully",
      forceLogout: false,
    };
  }
}
