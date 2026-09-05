import type {
  Request,
  Response,
} from "express";

import httpStatus from "http-status";

import { catchAsync } from "../../utils/catchAsync.js";

import {
  evaluationService,
} from "./evaluation.service.js";


const evaluateWritten =
  catchAsync(
    async (
      req: Request,
      res: Response,
    ) => {
      const evaluatorId =
        req.user!.userId;

      const result =
        await evaluationService.evaluateWritten(
          evaluatorId,
          req.params.submissionId as string,
          req.body.score,
          req.body.feedback,
        );

      res.status(
        httpStatus.OK,
      ).json({
        success: true,

        message:
          "Written submission evaluated successfully",

        data: result,
      });
    },
  );


const getPendingEvaluations =
  catchAsync(
    async (
      _req: Request,
      res: Response,
    ) => {
      const result =
        await evaluationService.getPendingEvaluations();

      res.status(
        httpStatus.OK,
      ).json({
        success: true,

        message:
          "Pending evaluations retrieved successfully",

        data: result,
      });
    },
  );


const getSubmissionForEvaluation =
  catchAsync(
    async (
      req: Request,
      res: Response,
    ) => {
      const result =
        await evaluationService.getSubmissionForEvaluation(
          req.params.submissionId as string,
        );

      res.status(
        httpStatus.OK,
      ).json({
        success: true,

        message:
          "Submission retrieved successfully",

        data: result,
      });
    },
  );


const getEvaluationBySubmissionId =
  catchAsync(
    async (
      req: Request,
      res: Response,
    ) => {
      const result =
        await evaluationService.getEvaluationBySubmissionId(
          req.params.submissionId as string,
        );

      res.status(
        httpStatus.OK,
      ).json({
        success: true,

        message:
          "Evaluation retrieved successfully",

        data: result,
      });
    },
  );


export const evaluationController = {
  evaluateWritten,
  getPendingEvaluations,
  getSubmissionForEvaluation,
  getEvaluationBySubmissionId,
};