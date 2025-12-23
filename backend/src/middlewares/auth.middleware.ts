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
        forceLogout: true,
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
      forceLogout: true,
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
        message: "Forbidden: Insufficient permissions",
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

  console.log(`\n🔍 [REVALIDATE] Checking user: ${req.user!.id}`); // ← Add this

  const user = await userRepo.findOne({
    where: { id: req.user!.id },
    select: ["id", "email", "isBanned", "tokenVersion"], // ← Add email to see
  });

  console.log("[REVALIDATE] User data:", {
    userId: req.user!.id, // ← Add this
    email: user?.email, // ← Add this
    found: !!user,
    isBanned: user?.isBanned,
    dbTokenVersion: user?.tokenVersion,
    requestTokenVersion: req.user!.tokenVersion,
  });

  if (!user) {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    return res.status(401).json({
      success: false,
      message: "User not found",
      forceLogout: true,
      errorType: "user_not_found",
    });
  }

  if (user.isBanned) {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    return res.status(403).json({
      success: false,
      message: "Your account has been banned by an administrator",
      forceLogout: true,
      errorType: "account_banned",
    });
  }

  // ✅ Check token version mismatch
  if (user.tokenVersion !== req.user!.tokenVersion) {
    console.log(`❌ [REVALIDATE] TOKEN VERSION MISMATCH!`);
    console.log(`   DB has: ${user.tokenVersion}`);
    console.log(`   Token has: ${req.user!.tokenVersion}`);

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    return res.status(401).json({
      success: false,
      message: "Your session has been revoked by an administrator",
      forceLogout: true,
      errorType: "session_revoked",
    });
  }

  console.log("✅ [REVALIDATE] User revalidated successfully");
  next();
};
