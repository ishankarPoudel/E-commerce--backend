import { mailTransport } from "../../config/mail/mail.config";
import { AppDataSource } from "../../data-source";
import { UserEntity } from "../../entities/user/user.entity";
import { ApiError } from "../../utils/apiError";

export class MailService {
  private UserRepo = AppDataSource.getRepository(UserEntity);
  async sendVerificationEmail(email: string, token: string) {
    const existingUser = await this.UserRepo.findOneBy({ email });
    if (existingUser) {
      throw new ApiError(400, "User with this email already exists");
    }

    const user = this.UserRepo.create({
      email,
      emailVerificationToken: token,
      emailVerificationTokenExpiresAt: new Date(
        Date.now() + 1 * 60 * 60 * 1000
      ), // Token valid for 1 hours
    });
    await this.UserRepo.save(user);
    console.log("sending email to", email);

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

  async verifyOtp(email: string, otp: string) {
    const user = await this.UserRepo.findOneBy({ email });
    if (
      !user ||
      user.emailVerificationToken !== otp ||
      !user.emailVerificationTokenExpiresAt ||
      user.emailVerificationTokenExpiresAt < new Date()
    ) {
      throw new ApiError(400, "Invalid or expired OTP");
    }

    user.emailVerificationToken = "";
    user.emailVerificationTokenExpiresAt = null;
    await this.UserRepo.save(user);

    return user;
  }
}
