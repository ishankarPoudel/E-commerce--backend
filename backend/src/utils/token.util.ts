import jwt, { SignOptions, VerifyOptions } from "jsonwebtoken";

export class Tokens {
  signAccessToken = (payload: object) => {
    const secret = process.env.JWT_ACCESS_SECRET;
    const options: SignOptions = {
      expiresIn: (process.env.JWT_ACCESS_EXPIRES_IN || "15s") as any, // Changed from 15s to 15m
    };

    return jwt.sign(payload, secret as string, options);
  };

  signRefreshToken = (payload: object) => {
    const secret = process.env.JWT_REFRESH_SECRET;

    const options: SignOptions = {
      expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || "7d") as any,
    };

    return jwt.sign(payload, secret as string, options);
  };

  verifyAccessToken = (token: string) => {
    const secret = process.env.JWT_ACCESS_SECRET;
    return jwt.verify(token, secret as string);
  };

  verifyRefreshToken = (token: string) => {
    const secret = process.env.JWT_REFRESH_SECRET;
    return jwt.verify(token, secret as string);
  };
}
