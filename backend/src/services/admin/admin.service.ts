import AppDataSource from "../../config/data-source/data-source";
import { UserEntity } from "../../entities/user/userInfo/user.userInfo.entity";
import { ApiError } from "../../utils/apiError";
import { MailService } from "../mail/mail.service";

export class AdminService {
  private userRepo = AppDataSource.getRepository(UserEntity);

  async revokeUserSession(userId: string) {
    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user) throw new ApiError(404, "User not found");
    user.tokenVersion += 1;
    user.refreshToken = "";
    await this.userRepo.save(user);
  }

  async banUser(userId: string) {
    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user) throw new ApiError(404, "User not found");
    if (user.isBanned) throw new ApiError(400, "User is already banned");
    user.isBanned = true;
    user.tokenVersion += 1;
    user.refreshToken = "";
    await this.userRepo.save(user);
    await new MailService().sendAccoutBanNotificationEmail(user.email);
  }

  async unbanUser(userId: string) {
    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user) throw new ApiError(404, "User not found");
    if (!user.isBanned) throw new ApiError(400, "User is not banned");
    user.isBanned = false;
    user.tokenVersion += 1;
    user.refreshToken = "";
    await this.userRepo.save(user);
    await new MailService().sendAccountUnbanNotificationEmail(user.email);
  }
}
