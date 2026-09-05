import type { Request, Response } from "express";
import httpStatus from "http-status";

import { catchAsync } from "../../utils/catchAsync.js";
import { submissionService } from "./submission.service.js";

const createSubmission = catchAsync(
  async (req: Request, res: Response) => {
    const candidateId = req.user!.userId;

    const submission =
      await submissionService.createSubmission(
        candidateId,
        req.params.attemptId as string,
        req.body.problemId,
        req.body.answer,
      );

    res.status(httpStatus.CREATED).json({
      success: true,
      message: "Submission created successfully",
      data: submission,
    });
  },
);

const getMySubmissions = catchAsync(
  async (req: Request, res: Response) => {
    const candidateId = req.user!.userId;

    const submissions =
      await submissionService.getMySubmissions(
        candidateId,
      );

    res.status(httpStatus.OK).json({
      success: true,
      message: "Submissions retrieved successfully",
      data: submissions,
    });
  },
);

const getSubmissionById = catchAsync(
  async (req: Request, res: Response) => {
    const candidateId = req.user!.userId;

    const submission =
      await submissionService.getSubmissionById(
        candidateId,
        req.params.submissionId as string,
      );

    res.status(httpStatus.OK).json({
      success: true,
      message: "Submission retrieved successfully",
      data: submission,
    });
  },
);

export const submissionController = {
  createSubmission,
  getMySubmissions,
  getSubmissionById,
};