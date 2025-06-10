import { mailTransport } from "../../config/mail/mail.config";

export class MailService {
  async sendVerificationEmail(email: string, token: string) {
    const url = `http://localhost:3000/api/auth/verify-email?token=${token}`;

    await mailTransport.sendMail({
      from: `Avisekh Bag Pashal <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Verify your email",
      html: `

                <p>Click the link below to verify your email address:</p>
                <a href="${url}">Verify Email</a>
                <p>If you did not create an account, please ignore this email.</p>
            `,
    });
  }
}
