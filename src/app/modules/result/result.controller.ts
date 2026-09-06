import type { Request, Response } from "express";
import httpStatus from "http-status";

import { catchAsync } from "../../utils/catchAsync.js";
import { resultService } from "./result.service.js";

const generateResult = catchAsync(
  async (req: Request, res: Response) => {
    const candidateId = req.user!.userId;
    const attemptId = req.params.attemptId as string;

    const result =
      await resultService.generateResult(
        candidateId,
        attemptId,
      );

    res.status(httpStatus.CREATED).json({
      success: true,
      message: "Result generated successfully",
      data: result,
    });
  },
);

const getMyResult = catchAsync(
  async (req: Request, res: Response) => {
    const candidateId = req.user!.userId;
    const attemptId = req.params.attemptId as string;

    const result =
      await resultService.getMyResult(
        candidateId,
        attemptId,
      );

    res.status(httpStatus.OK).json({
      success: true,
      message: "Result retrieved successfully",
      data: result,
    });
  },
);

const getAssessmentResults = catchAsync(
  async (req: Request, res: Response) => {
    const recruiterId = req.user!.userId;
    const assessmentId =
      req.params.assessmentId as string;

    const results =
      await resultService.getAssessmentResults(
        recruiterId,
        assessmentId,
      );

    res.status(httpStatus.OK).json({
      success: true,
      message: "Assessment results retrieved successfully",
      data: results,
    });
  },
);

const getRecruiterResultById = catchAsync(
  async (req: Request, res: Response) => {
    const recruiterId = req.user!.userId;
    const resultId =
      req.params.resultId as string;

    const result =
      await resultService.getRecruiterResultById(
        recruiterId,
        resultId,
      );

    res.status(httpStatus.OK).json({
      success: true,
      message: "Result retrieved successfully",
      data: result,
    });
  },
);

const getAssessmentStatistics = catchAsync(
  async (req: Request, res: Response) => {
    const recruiterId = req.user!.userId;
    const assessmentId =
      req.params.assessmentId as string;

    const statistics =
      await resultService.getAssessmentStatistics(
        recruiterId,
        assessmentId,
      );

    res.status(httpStatus.OK).json({
      success: true,
      message: "Assessment statistics retrieved successfully",
      data: statistics,
    });
  },
);

export const resultController = {
  generateResult,
  getMyResult,
  getAssessmentResults,
  getRecruiterResultById,
  getAssessmentStatistics,
};