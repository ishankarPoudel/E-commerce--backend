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
        subject: "Reset Your Password",
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #ffffff;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p style="font-size: 16px; color: #555;">
          Hi there,
        </p>
        <p style="font-size: 16px; color: #555;">
          We received a request to reset your password. Click the button below to choose a new one:
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${
            process.env.FRONTEND_BASE_URL
          }/auth/recover-password/${token}" style="background-color: #007BFF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-size: 16px;">
            Reset Password
          </a>
        </div>
        <p style="font-size: 14px; color: #999;">
          If you didn't request this, you can safely ignore this email.
        </p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="font-size: 12px; color: #bbb; text-align: center;">
          &copy; ${new Date().getFullYear()} Avisekh Bag Pashal. All rights reserved.
        </p>
      </div>
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

  async sendPasswordChangeConfirmationEmail(email: string) {
    try {
      await mailTransport.sendMail({
        from: `Avisekh Bag Pashal <${process.env.GMAIL_USER}>`,
        to: email,
        subject: "Your Password Has Been Changed",
        html: ` <p style="font-size: 16px; color: #555;">Hi there,</p>
        <p style="font-size: 16px; color: #555;">
        This is a confirmation that your password has been successfully changed. If you did not make this change, please contact our support team immediately.
        </p>
        <p style="font-size: 16px; color: #555;">
        Thank you for being a valued member of Avisekh Bag Pashal!
        </p>
        <p style="font-size: 16px; color: #555;">Best regards,<br/>The Avisekh Bag Pashal Team</p>
        `,
      });
    } catch (err) {
      console.error("Error sending email:", err);
    }
  }

  async sendOrderConfirmationEmail(email: string, order: any) {
    try {
      type OrderItem = { name: string; price: number; quantity: number };
      const items: OrderItem[] =
        order.itemsSnapshot || order.itemsSnapShot || [];

      const currency = order.currency || "USD";
      const deliveryMethod = order.deliveryMethod || "delivery";
      const status = order.status || "pending";

      // Generate item rows
      const rows = items
        .map((it) => {
          const lineTotal = (it.price || 0) * (it.quantity || 0);
          return `
          <tr>
            <td style="padding:8px;font-size:14px;color:#555;">${it.name}</td>
            <td align="center" style="padding:8px;font-size:14px;color:#555;">
              ${it.quantity}
            </td>
            <td align="right" style="padding:8px;font-size:14px;color:#555;">
              ${lineTotal.toFixed(2)} ${currency.toUpperCase()}
            </td>
          </tr>
        `;
        })
        .join("");

      // Status color indicator
      const statusColor =
        status === "paid"
          ? "#27ae60"
          : status === "pending"
          ? "#f39c12"
          : "#e74c3c";

      const isPickup = deliveryMethod === "pickup";
      const deliveryTitle = isPickup ? "🏪 Store Pickup" : "🚚 Home Delivery";
      const deliveryMessage = isPickup
        ? `
        <p style="font-size: 14px; color: #555; text-align: center; margin: 8px 0;">
          Your order will be ready for <strong>pickup at our store</strong>.
          Please pay at the counter when you collect your order.
        </p>
      `
        : `
        <p style="font-size: 14px; color: #555; text-align: center; margin: 8px 0;">
          Your order will be <strong>delivered to your address</strong> soon.
          We'll notify you once it's on the way!
        </p>
      `;

      // Optional payment note
      const paymentNote = isPickup
        ? `<p style="font-size: 13px; color: #888; text-align: center; margin-top: 8px;">💵 Payment to be made in-store upon pickup.</p>`
        : `<p style="font-size: 13px; color: #888; text-align: center; margin-top: 8px;">💳 Payment completed online.</p>`;

      const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #eaeaea; border-radius: 10px; background-color: #ffffff;">
        <h2 style="color: #2c3e50; text-align: center; margin-bottom: 12px;">
          👜 Order Confirmation
        </h2>
        <p style="color: #555; text-align: center; font-size: 15px; margin-top: 0;">
          Thank you for your purchase! Your order has been received.
        </p>

        ${deliveryMessage}

        <div style="margin-top: 24px;">
          <h3 style="color: #2c3e50; margin-bottom: 8px;">Order Details</h3>
          <p style="font-size: 14px; color: #555; margin: 4px 0;">Order ID: <strong>#${
            order.id
          }</strong></p>
          <p style="font-size: 14px; color: #555; margin: 4px 0;">
            Status:
            <strong style="color: ${statusColor};">${status}</strong>
          </p>
          <p style="font-size: 14px; color: #555; margin: 4px 0;">
            Delivery Method: <strong>${deliveryTitle}</strong>
          </p>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
          <thead>
            <tr>
              <th align="left" style="border-bottom: 1px solid #ddd; padding: 8px; font-size: 14px; color: #333;">Item</th>
              <th align="center" style="border-bottom: 1px solid #ddd; padding: 8px; font-size: 14px; color: #333;">Qty</th>
              <th align="right" style="border-bottom: 1px solid #ddd; padding: 8px; font-size: 14px; color: #333;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${
              rows ||
              `<tr><td colspan="3" style="padding:8px;color:#999;font-size:14px;">No items to display</td></tr>`
            }
          </tbody>
        </table>

        <div style="margin-top: 16px; border-top: 1px solid #ddd; padding-top: 12px;">
          <p style="font-size: 15px; color: #333; margin: 4px 0; text-align: right;">
            <strong>Total:</strong>
            <span style="color: #27ae60; font-size: 16px;">
              ${order.amount || 0} ${currency.toUpperCase()}
            </span>
          </p>
        </div>

        ${paymentNote}

        <div style="margin-top: 32px; text-align: center; color: #888; font-size: 13px;">
          <p style="margin: 4px 0;">Thank you for shopping with <strong>Avisekh Bag Pashal</strong> 👜</p>
          <p style="margin: 4px 0;">We truly appreciate your trust and support.</p>
        </div>
      </div>
    `;

      await mailTransport.sendMail({
        from: `Avisekh Bag Pashal <${process.env.GMAIL_USER}>`,
        to: email,
        subject: isPickup
          ? "Order Confirmation - Ready for Store Pickup!"
          : "Order Confirmation - Thank You for Your Purchase!",
        html,
      });
    } catch (err) {
      console.error("Error sending email:", err);
    }
  }
}
