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

  async sendLoginDetectedEmail(email: string, deviceInfo: any) {
    try {
      await mailTransport.sendMail({
        from: `Avisekh Bag Pashal <${process.env.GMAIL_USER}>`,
        to: email,
        subject: "🔐 New Login Detected on Your Account",
        html: `
    <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 30px;">
      <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);">
        <h2 style="color: #333;">New Login Detected</h2>
        <p style="font-size: 16px; color: #555;">Hi there,</p>
        <p style="font-size: 16px; color: #555;">
          We noticed a new sign-in to your account with the following device information:
        </p>

        <div style="background-color: #f4f4f4; padding: 15px; border-radius: 6px; margin: 20px 0; font-size: 15px; color: #333;">
          <strong>Device:</strong> ${deviceInfo.device || "Unknown"}<br/>
          <strong>Operating System:</strong> ${deviceInfo.os || "Unknown"}<br/>
          <strong>Browser:</strong> ${deviceInfo.browser || "Unknown"}<br/>
          <strong>Location:</strong> ${
            deviceInfo.location
              ? `${deviceInfo.location.city}, ${deviceInfo.location.region}, ${deviceInfo.location.country}`
              : "Unknown"
          }<br/>

          <strong>Date:</strong> ${new Date().toLocaleString()}
        </div>

        <p style="font-size: 16px; color: #555;">
          If this was <strong>you</strong>, no action is needed.
        </p>
        <p style="font-size: 16px; color: #d9534f;">
          If this <strong>wasn't you</strong>, we recommend updating your password immediately and reviewing your account activity.
        </p>

        <div style="margin-top: 30px;">
          <a href="${
            process.env.CLIENT_URL
          }/account/security" style="padding: 12px 20px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 5px; font-size: 16px;">
            Secure My Account
          </a>
        </div>

        <p style="font-size: 13px; color: #aaa; margin-top: 40px;">
          This message was sent from Avisekh Bag Pashal security system. Do not reply to this email as it is not monitored and replies will not be answered or read.
        </p>
      </div>
    </div>
  `,
      });
    } catch (err) {
      console.error("Error sending email:", err);
    }
  }
}
