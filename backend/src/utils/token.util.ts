import jwt from "jsonwebtoken";

export class Tokens {
  signAccessToken = (payload: object) => {
    return jwt.sign(payload, process.env.JWT_ACCESS_SECRET!, {
      expiresIn: Number(process.env.JWT_ACCESS_EXPIRES_IN),
    });
  };

  signRefreshToken = (payload: object) => {
    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, {
      expiresIn: Number(process.env.JWT_REFRESH_EXPIRES_IN),
    });
  };

  verifyAccessToken = (token: string) => {
    return jwt.verify(token, process.env.JWT_ACCESS_SECRET!);
  };

  verifyRefreshToken = (token: string) => {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET!);
  };
}
