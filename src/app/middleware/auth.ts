import type { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";

import { jwtUtils } from "../utils/jwt.js";
import { AppError } from "../utils/AppError.js";
import config from "../config/index.js";
import { UserRole } from "../../generated/prisma/enums.js";

export const auth = (...roles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const authorization = req.headers.authorization;

      if (!authorization) {
        throw new AppError(
          httpStatus.UNAUTHORIZED,
          "You are not authorized",
        );
      }

      const token = authorization.startsWith("Bearer ")
        ? authorization.split(" ")[1]
        : null;

      if (!token) {
        throw new AppError(
          httpStatus.UNAUTHORIZED,
          "Invalid authorization format",
        );
      }

      const result = jwtUtils.verifyToken(
        token,
        config.jwt_access_secret,
      );

      if (!result.success) {
        throw new AppError(
          httpStatus.UNAUTHORIZED,
          "Invalid or expired token",
        );
      }

      const user = result.data as {
        userId: string;
        email: string;
        role: UserRole;
      };

      if (roles.length > 0 && !roles.includes(user.role)) {
        throw new AppError(
          httpStatus.FORBIDDEN,
          "You do not have permission to access this resource",
        );
      }

      req.user = user;

      next();
    } catch (error) {
      next(error);
    }
  };
};