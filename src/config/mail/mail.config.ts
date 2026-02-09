import nodemailer from "nodemailer";

export const mailTransport = nodemailer.createTransport({
  service: "gmail",
  // host: "smtp.gmail.com",
  // port: 587,
  secure: false, // true for 465, false for other ports
  requireTLS: false, // true if you want to use TLS
  auth: {
    user: process.env.GMAIL_USER || "shankarpoudel499@gmail.com",
    pass: process.env.GMAIL_PASS || "lfxw munn symz nzpd",
  },
});
