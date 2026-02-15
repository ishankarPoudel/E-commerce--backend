import AppDataSource from "../../config/data-source/data-source";
import {
  UserEntity,
  UserRole,
} from "../../entities/user/userInfo/user.userInfo.entity";
import { ApiError } from "../../utils/apiError";
import { MailService } from "../mail/mail.service";
import bcrypt from "bcrypt";
import { TokensService } from "../tokens/tokens.service";

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
      tokenVersion: 0,
    });
    await this.userRepo.save(adminUser);

    return {
      email: adminUser.email,
      fullName: adminUser.fullName,
      role: adminUser.role,
    };
  }

  async adminLogin(data: { email: string; password: string }) {
    const adminUser = await this.userRepo.findOne({
      where: { email: data.email, role: UserRole.ADMIN },
    });
    if (!adminUser) throw new ApiError(404, "Admin account not found");
    if (adminUser.isBanned) {
      throw new ApiError(403, "Admin account is banned");
    }
    const isPasswordValid = await bcrypt.compare(
      data.password,
      adminUser.password
    );
    if (!isPasswordValid)
      throw new ApiError(401, "Invalid email or password for admin");

    console.log(`✅ [ADMIN] Admin logged in:`, {
      email: adminUser.email,
      tokenVersion: adminUser.tokenVersion,
    });

    return new TokensService().generateTokens(adminUser);
  }

  async revokeUserSession(userId: string) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      select: ["id", "email", "tokenVersion", "refreshToken"],
    });

    if (!user) throw new ApiError(404, "User not found");

    const oldTokenVersion = user.tokenVersion;
    const newTokenVersion = oldTokenVersion + 1;

    // Execute the update
    const result = await this.userRepo
      .createQueryBuilder()
      .update(UserEntity)
      .set({
        tokenVersion: newTokenVersion,
        refreshToken: "",
      })
      .where("id = :id", { id: userId })
      .execute();

    console.log(`📊 [ADMIN] UPDATE RESULT:`, result);

    // Verify the update worked
    const updatedUser = await this.userRepo.findOne({
      where: { id: userId },
      select: ["id", "email", "tokenVersion"],
    });

    if (updatedUser?.tokenVersion !== newTokenVersion) {
      throw new ApiError(
        500,
        "Failed to revoke session - database update failed"
      );
    }
  }

  async banUser(userId: string) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      select: ["id", "email", "isBanned", "tokenVersion"],
    });

    if (!user) throw new ApiError(404, "User not found");
    if (user.isBanned) throw new ApiError(400, "User is already banned");

    const oldTokenVersion = user.tokenVersion;
    const newTokenVersion = oldTokenVersion + 1;

    const result = await this.userRepo
      .createQueryBuilder()
      .update(UserEntity)
      .set({
        isBanned: true,
        tokenVersion: newTokenVersion,
        refreshToken: "",
      })
      .where("id = :id", { id: userId })
      .execute();

    // Verify
    const updatedUser = await this.userRepo.findOne({
      where: { id: userId },
      select: ["id", "email", "isBanned", "tokenVersion"],
    });

    await new MailService().sendAccoutBanNotificationEmail(user.email);
  }

  async unbanUser(userId: string) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      select: ["id", "email", "isBanned", "tokenVersion"],
    });

    if (!user) throw new ApiError(404, "User not found");
    if (!user.isBanned) throw new ApiError(400, "User is not banned");

    const oldTokenVersion = user.tokenVersion;
    const newTokenVersion = oldTokenVersion + 1;

    const result = await this.userRepo
      .createQueryBuilder()
      .update(UserEntity)
      .set({
        isBanned: false,
        tokenVersion: newTokenVersion,
        refreshToken: "",
      })
      .where("id = :id", { id: userId })
      .execute();

    console.log(`📊 [ADMIN] UPDATE RESULT:`, result);

    // Verify
    const updatedUser = await this.userRepo.findOne({
      where: { id: userId },
      select: ["id", "email", "isBanned", "tokenVersion"],
    });

    await new MailService().sendAccountUnbanNotificationEmail(user.email);
  }
}
