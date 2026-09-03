import type { NextFunction, Request, Response } from "express";
import type z from "zod";
import httpStatus from "http-status";

import { catchAsync } from "../utils/catchAsync.js";
import { AppError } from "../utils/AppError.js";

export const validateRequest = (zodSchema: z.ZodObject) => {
  return catchAsync((req: Request, res: Response, next: NextFunction) => {
    const payload = req.body ?? {};

	// console.log(payload,"Payload..")

    const result = zodSchema.safeParse(payload);

    if (!result.success) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        result.error.issues[0].message,
      );
    }

    req.body = result.data;

    next();
  });
};