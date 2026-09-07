import type { NextFunction, Request, Response } from "express";
import type z from "zod";
import httpStatus from "http-status";

import { catchAsync } from "../utils/catchAsync.js";
import { AppError } from "../utils/AppError.js";

export const validateRequest = (
  zodSchema: z.ZodObject,
  source: "body" | "query" | "params" = "body",
) => {
  return catchAsync(
    (req: Request, res: Response, next: NextFunction) => {
      const payload = req[source] ?? {};

      const result = zodSchema.safeParse(payload);

      if (!result.success) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          result.error.issues[0].message,
        );
      }

      if (source === "body") {
        req.body = result.data;
      } else if (source === "query") {
        Object.assign(req.query, result.data);
      } else if (source === "params") {
        Object.assign(req.params, result.data);
      }

      next();
    },
  );
};