import { AuthenticatedRequest, authenticateToken } from "./auth.middleware";
import { Request, Response, NextFunction } from "express";

//list of rouutes to exclude from authenciation
const excludedRoutes: { path: string; method: string }[] = [
  { path: "/auth/login", method: "POST" },
  { path: "/auth/logout", method: "POST" },
  { path: "/auth/admin/admin-login", method: "POST" },
  { path: "/auth/register", method: "POST" },
  { path: "/auth/verify-otp", method: "POST" },
  { path: "/auth/resend-otp", method: "POST" },
  { path: "/auth/reset-password", method: "POST" },
  { path: "/auth/recover-password", method: "POST" },
  { path: "/auth/refresh-token", method: "POST" },
  { path: "/auth/google", method: "GET" },
  { path: "/auth/google/callback", method: "GET" },
  { path: "/docs", method: "GET" },
  { path: "/docs/swagger.json", method: "GET" },
  { path: "/openapi.json", method: "GET" },
];

export const authMiddlewareWithExclusions = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const isExcluded = excludedRoutes.some(
    (route) =>
      req.path === route.path &&
      req.method.toLowerCase() === route.method.toLowerCase()
  );

  if (isExcluded) {
    return next();
  }
  return authenticateToken(req, res, next);
};
