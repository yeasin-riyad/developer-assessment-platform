
import type { Request, Response } from "express";
import httpStatus from "http-status";

import { catchAsync } from "../../utils/catchAsync.js";
import { AppError } from "../../utils/AppError.js";
import { settingsService } from "./settings.service.js";
import {
  changePasswordSchema,
  updateProfileSchema,
} from "./settings.validation.js";

const getUserId = (req: Request): string => {
  // Uses the same req.user.id convention as your
  // existing protected controllers.
  const userId = req.user?.userId;

  if (!userId) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      "Authentication required",
    );
  }

  return userId;
};

const getMySettings = catchAsync(
  async (req: Request, res: Response) => {
    const data = await settingsService.getMySettings(
      getUserId(req),
    );

    res.status(httpStatus.OK).json({
      success: true,
      statusCode: httpStatus.OK,
      message: "Settings retrieved successfully",
      data,
    });
  },
);

const updateMyProfile = catchAsync(
  async (req: Request, res: Response) => {
    const parsed = updateProfileSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        parsed.error.issues[0]?.message ??
          "Invalid profile information",
      );
    }

    const data = await settingsService.updateMyProfile(
      getUserId(req),
      parsed.data,
    );

    res.status(httpStatus.OK).json({
      success: true,
      statusCode: httpStatus.OK,
      message: "Profile updated successfully",
      data,
    });
  },
);

const changeMyPassword = catchAsync(
  async (req: Request, res: Response) => {
    const parsed = changePasswordSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        parsed.error.issues[0]?.message ??
          "Invalid password information",
      );
    }

    const data = await settingsService.changeMyPassword(
      getUserId(req),
      parsed.data,
    );

    res.status(httpStatus.OK).json({
      success: true,
      statusCode: httpStatus.OK,
      message: data.message,
      data: null,
    });
  },
);

export const settingsController = {
  getMySettings,
  updateMyProfile,
  changeMyPassword,
};