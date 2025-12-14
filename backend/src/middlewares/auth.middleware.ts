import { Request, Response, NextFunction } from "express";
import { Tokens } from "../utils/token.util";
import { ApiError } from "../utils/apiError";
import AppDataSource from "../config/data-source/data-source";
import {
  UserEntity,
  UserRole,
} from "../entities/user/userInfo/user.userInfo.entity";

export interface AuthUser {
  id: string;
  role: UserRole;
  tokenVersion: number;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const accessToken = req.cookies?.accessToken;
    console.log("Access Token from cookie:", accessToken);

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: "Access token missing",
      });
    }

    const payload = new Tokens().verifyAccessToken(accessToken) as any;

    req.user = {
      id: payload.userId,
      role: payload.role,
      tokenVersion: payload.tokenVersion,
    };

    next();
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired access token",
    });
  }
};

export const authorizeRoles = (...allowedRoles: UserRole[]) => {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }

    next();
  };
};

export const revalidateUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const userRepo = AppDataSource.getRepository(UserEntity);

  const user = await userRepo.findOne({
    where: { id: req.user!.id },
  });

  if (!user) {
    return res.status(401).json({ message: "User not found" });
  }

  if (user.isBanned) {
    return res.status(403).json({ message: "Account banned" });
  }

  if (user.tokenVersion !== req.user!.tokenVersion) {
    return res.status(401).json({
      message: "Session revoked",
      forceLogout: true,
    });
  }

  next();
};
