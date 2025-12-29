import { Controller, Get, Middlewares, Query, Route, Tags } from "tsoa";
import { AnalyticsService } from "../../services/analytics/analytics.service";
import {
  authenticateToken,
  authorizeRoles,
  revalidateUser,
} from "../../middlewares/auth.middleware";
import { UserRole } from "../../entities/user/userInfo/user.userInfo.entity";

@Route("auth/admin/analytics")
@Tags("Analytics")
@Middlewares([
  authenticateToken,
  revalidateUser,
  authorizeRoles(UserRole.ADMIN),
])
export class AnalyticsController extends Controller {
  private analyticsService = new AnalyticsService();

  @Get("/dashboard")
  async getDashboardAnalytics(
    @Query() startDate?: string,
    @Query() endDate?: string,
    @Query() period?: "week" | "month" | "quarter" | "year"
  ) {
    try {
      let parsedStartDate: Date | undefined;
      let parsedEndDate: Date | undefined;

      if (startDate) {
        parsedStartDate = new Date(startDate);
      }
      if (endDate) {
        parsedEndDate = new Date(endDate);
      }

      // Handle period-based queries
      if (period) {
        const now = new Date();
        parsedEndDate = now;

        switch (period) {
          case "week":
            parsedStartDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case "month":
            parsedStartDate = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
          case "quarter":
            const quarter = Math.floor(now.getMonth() / 3);
            parsedStartDate = new Date(now.getFullYear(), quarter * 3, 1);
            break;
          case "year":
            parsedStartDate = new Date(now.getFullYear(), 0, 1);
            break;
        }
      }

      const data = await this.analyticsService.getDashboardAnalytics(
        parsedStartDate,
        parsedEndDate
      );

      this.setStatus(200);
      return {
        success: true,
        data,
      };
    } catch (error: any) {
      this.setStatus(error.statusCode || 500);
      return {
        success: false,
        message: error.message,
      };
    }
  }
}
