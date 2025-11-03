function getPositiveInteger(key: string, defaultValue: number): number {
  const value = parseInt(process.env[key] || String(defaultValue));
  if (isNaN(value) || value <= 0) {
    throw new Error(
      `Invalid configuration: ${key} must be a positive integer. Got: ${process.env[key]}`
    );
  }
  return value;
}

export const BCRYPT_ROUNDS = getPositiveInteger("BCRYPT_ROUNDS", 12);
export const OTP_EXPIRY_MINUTES = getPositiveInteger("OTP_EXPIRY_MINUTES", 15);
export const UNVERIFIED_USER_RETENTION_HOURS = getPositiveInteger(
  "UNVERIFIED_USER_RETENTION_HOURS",
  24
);
