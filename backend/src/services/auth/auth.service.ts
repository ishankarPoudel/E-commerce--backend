import AppDataSource from "../../config/data-source/data-source";
import { UserEntity } from "../../entities/user/userInfo/user.userInfo.entity";
import { ApiError } from "../../utils/apiError";
import { GenerateRandomToken } from "../../utils/emailToken/randomToken";
import { Tokens } from "../../utils/token.util";
import { MailService } from "../mail/mail.service";
import { RegisterUserDto } from "./../../validators/registerUser.validator";
import bcrypt from "bcrypt";
import { MoreThan } from "typeorm";
import { LoginValidator } from "./../../validators/auth/login.validator";
import { DeviceInfoEntity } from "../../entities/user/deviceInfo/user.deveiceInfo.entity";

export class AuthService {
  private userRepo = AppDataSource.getRepository(UserEntity);

  async registerUser(user: RegisterUserDto) {
    let existingUser = await this.userRepo.findOne({
      where: {
        email: user.email,
      },
    });
    // If user is already fully registered
    if (existingUser && existingUser.isEmailVerified) {
      throw new ApiError(
        400,
        `Account already exists, please login via ${existingUser.provider} `
      );
    }

    if (!existingUser) {
      existingUser = this.userRepo.create({
        email: user.email,
        fullName: user.fullName,
        password: await bcrypt.hash(user.password, 10),
        isOauth: false,
        provider: "local",
        isEmailVerified: false,
      });
    } else {
      // Only update if not already set
      if (!existingUser.fullName) existingUser.fullName = user.fullName;
      if (!existingUser.password)
        existingUser.password = await bcrypt.hash(user.password, 10);
    }

    const otp = new GenerateRandomToken().mailToken();
    existingUser.emailVerificationToken = otp;
    existingUser.emailVerificationTokenExpiresAt = new Date(
      Date.now() + 15 * 60 * 1000
    ); // 15 minutes from now

    await this.userRepo.save(existingUser);

    await new MailService().sendVerificationEmail(existingUser.email, otp);

    return existingUser;
  }

  async verifyOtp({ email, otp }: { email: string; otp: string }) {
    const user = await this.userRepo.findOne({
      where: {
        emailVerificationToken: otp,
        email: email,
        emailVerificationTokenExpiresAt: MoreThan(new Date()),
      },
    });
    if (
      !user ||
      user.emailVerificationToken !== otp ||
      !user.emailVerificationTokenExpiresAt ||
      user.emailVerificationTokenExpiresAt < new Date()
    ) {
      throw new ApiError(400, "Invalid or expired OTP");
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = "";
    user.emailVerificationTokenExpiresAt = null;
    await this.userRepo.save(user);

    const { accessToken, refreshToken } =
      await new AuthService().generateTokens(user);

    return { user, accessToken, refreshToken };
  }

  async resendOtp(email: string) {
    const user = await this.userRepo.findOneBy({ email });
    if (!user) throw new ApiError(404, "User not found");
    if (user.isEmailVerified) {
      throw new ApiError(400, "Email already verified");
    }
    const otp = new GenerateRandomToken().mailToken();
    user.emailVerificationToken = otp;
    user.emailVerificationTokenExpiresAt = new Date(
      Date.now() + 15 * 60 * 1000
    ); // 15 minutes from now
    await this.userRepo.save(user);
    await new MailService().sendVerificationEmail(user.email, otp);
  }

  // this is the local login method  **NOT OAUTH**
  // it will be used for login with email and password
  async loginUser(credentials: LoginValidator) {
    const user = await this.userRepo.findOne({
      where: {
        email: credentials.email,
      },
    });
    if (!user) throw new ApiError(404, "User not found!");

    if (user.isOauth) {
      throw new ApiError(
        400,
        `This account was created using ${user.provider}. Please log in with that method.`
      );
    }
    if (!user.isEmailVerified) {
      throw new ApiError(
        403,
        "Email not verified. Please verify your email first."
      );
    }
    const isPasswordValid = await bcrypt.compare(
      credentials.password,
      user.password
    );
    if (!isPasswordValid) throw new ApiError(401, "Invalid credentials");
    const deviceInfo = AppDataSource.getRepository(DeviceInfoEntity);

    let device: DeviceInfoEntity;
    if (user.deviceInfo) {
      // Update existing device info
      device = user.deviceInfo;
      device.os = credentials.os;
      device.browser = credentials.browser;
      device.device = credentials.device;
      device.location = credentials.location;
    } else {
      // Create new device info
      device = deviceInfo.create({
        os: credentials.os,
        browser: credentials.browser,
        device: credentials.device,
        location: credentials.location,
      });
    }
    const location =
      typeof credentials.location === "string"
        ? JSON.parse(credentials.location)
        : credentials.location;

    await deviceInfo.save(device);

    user.deviceInfo = device;
    await this.userRepo.save(user);

    await new MailService().sendLoginDetectedEmail(user.email, {
      os: credentials.os,
      browser: credentials.browser,
      device: credentials.device,
      location: location,
    });

    return this.generateTokens(user);
  }

  async resetPassword(email: string) {
    const userExists = await this.userRepo.findOneBy({ email });
    if (!userExists) throw new ApiError(404, "User not found");
    if (userExists.isOauth) {
      throw new ApiError(
        400,
        `This account was created using ${userExists.provider}. Please log in with that method. You cannot reset the password here.`
      );
    }

    const resetToken = new Tokens().signAccessToken({ userId: userExists.id });

    await new MailService().sendPasswordResetEmail(email, resetToken);
    return {
      email,
      resetToken,
    };
  }

  async recoverPassword(newPassword: string, resetToken: string) {
    const payload = new Tokens().verifyAccessToken(resetToken) as any;
    const user = await this.userRepo.findOneBy({ id: payload.userId });
    if (!user || !payload)
      throw new ApiError(401, "Invalid or expired reset token");

    user.password = await bcrypt.hash(newPassword, 10);
    await this.userRepo.save(user);

    await new MailService().sendPasswordChangeConfirmationEmail(user.email);
    return { email: user.email };
  }

  async generateTokens(user: UserEntity) {
    const payload = { userId: user.id, tokenVersion: user.tokenVersion };
    const accessToken = new Tokens().signAccessToken(payload);
    const refreshToken = new Tokens().signRefreshToken(payload);

    //stored hashed refresh token in DB
    user.refreshToken = await bcrypt.hash(refreshToken, 10);
    await this.userRepo.save(user);

    return { accessToken, refreshToken };
  }

  async logoutUser(userId: string) {
    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user) throw new ApiError(404, "User not found");
    user.refreshToken = "";
    await this.userRepo.save(user);
    return;
  }

  async revokeUserSession(userId: string) {
    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user) throw new ApiError(404, "User not found");
    user.tokenVersion += 1;
    user.refreshToken = "";
    await this.userRepo.save(user);
  }
}
