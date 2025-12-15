import AppDataSource from "../../config/data-source/data-source";
import {
  UserEntity,
  UserRole,
} from "../../entities/user/userInfo/user.userInfo.entity";
import { ApiError } from "../../utils/apiError";
import { MailService } from "../mail/mail.service";
import bcrypt from "bcrypt";

export class AdminService {
  private userRepo = AppDataSource.getRepository(UserEntity);

  // create admin account being used only via secure CLI or internal endpoints
  async createAdminAccount(data: {
    email: string;
    password: string;
    fullName: string;
  }) {
    const existingAdmin = await this.userRepo.findOne({
      where: { email: data.email },
    });
    if (existingAdmin) throw new ApiError(400, "Admin account already exists");
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const adminUser = this.userRepo.create({
      email: data.email,
      fullName: data.fullName,
      password: hashedPassword,
      role: UserRole.ADMIN,
      isEmailVerified: true,
      isOauth: false,
      provider: "local",
    });
    await this.userRepo.save(adminUser);
    return {
      email: adminUser.email,
      fullName: adminUser.fullName,
      role: adminUser.role,
    };
  }

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
