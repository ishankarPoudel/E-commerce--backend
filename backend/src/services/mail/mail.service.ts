import { mailTransport } from "../../config/mail/mail.config";

export class MailService {
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

  async sendPasswordResetEmail(email: string, token: string) {
    try {
      await mailTransport.sendMail({
        from: `Avisekh Bag Pashal <${process.env.GMAIL_USER}>`,
        to: email,
        subject: "Password Reset Link",
        html: `
          <p>Click the link below to reset your password:</p>
          <a href="${process.env.FRONTEND_BASE_URL}/auth/recover-password/${token}">Reset Password</a>
        `,
      });
    } catch (err) {
      console.error("Error sending email:", err);
    }
  }
}
