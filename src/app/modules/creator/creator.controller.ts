
import type { Request, Response } from "express";
import httpStatus from "http-status";

import { catchAsync } from "../../utils/catchAsync.js";
import { creatorService } from "./creator.service.js";

const getDashboardStatistics = catchAsync(
  async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(httpStatus.UNAUTHORIZED).json({
        success: false,
        message: "Authentication required",
      });
    }

    const data = await creatorService.getDashboardStatistics(
      req.user.userId,
    );

    return res.status(httpStatus.OK).json({
      success: true,
      message: "Creator dashboard statistics retrieved successfully",
      data,
    });
  },
);

export const creatorController = {
  getDashboardStatistics,
};

