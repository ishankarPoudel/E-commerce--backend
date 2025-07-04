import { MoreThan } from "typeorm";
import { mailTransport } from "../../config/mail/mail.config";
import { AppDataSource } from "../../config/data-source/data-source";
import { UserEntity } from "../../entities/user/user.entity";
import { ApiError } from "../../utils/apiError";
import { AuthService } from "../auth/auth.service";

export class MailService {
  private UserRepo = AppDataSource.getRepository(UserEntity);
  async sendVerificationEmail(email: string, token: string) {
    try {
      await mailTransport.sendMail({
        from: `Avisekh Bag Pashal <${process.env.GMAIL_USER}>`,
        to: email,
        subject: "OPT to activate your account",
        html: `
        <p>Enter the OTP shown below to register your account with Avisekh Bag Pashal</p>
        <b>${token}</b>
        <p>If you did not create an account, please ignore this email.</p>
        `,
      });
    } catch (err) {
      console.error("Error sending email:", err);
    }
  }

  async verifyOtp(otp: string, email?: string) {
    const user = await this.UserRepo.findOne({
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
    await this.UserRepo.save(user);

    const { accessToken, refreshToken } =
      await new AuthService().generateTokens(user);

    return { user, accessToken, refreshToken };
  }
}
