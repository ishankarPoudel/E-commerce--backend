import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/apiError";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(" Error here:", {
    message: err.message,
    status: err.statusCode,
    forceLogout: err.forceLogout,
    errorType: err.errorType,
    stack: err.stack,
  });

  // Default error values
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // Pass forceLogout and errorType to response
  const responseBody: any = {
    success: false,
    message,
  };

  // Add forceLogout flag if present
  if (err.forceLogout === true) {
    responseBody.forceLogout = true;
  }

  // Add errorType if present
  if (err.errorType) {
    responseBody.errorType = err.errorType;
  }

  // Add stack trace in development
  if (process.env.NODE_ENV === "development") {
    responseBody.stack = err.stack;
  }

  res.status(statusCode).json(responseBody);
};
