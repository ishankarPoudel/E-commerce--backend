export const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || "12");
export const OTP_EXPIRY_MINUTES = parseInt(process.env.OTP_EXPIRY_MINUTES || "15");
export const UNVERIFIED_USER_RETENTION_HOURS = parseInt(
  process.env.UNVERIFIED_USER_RETENTION_HOURS || "24"
);
