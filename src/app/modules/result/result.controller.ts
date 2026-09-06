import type {
  Request,
  Response,
} from "express";

import httpStatus from "http-status";

import { catchAsync } from "../../utils/catchAsync.js";

import {
  resultService,
} from "./result.service.js";


const generateResult =
  catchAsync(
    async (
      req: Request,
      res: Response,
    ) => {
      const candidateId =
        req.user!.userId;

      const result =
        await resultService.generateResult(
          candidateId,
          req.params.attemptId as string,
        );

      res.status(
        httpStatus.CREATED,
      ).json({
        success: true,

        message:
          "Result generated successfully",

        data: result,
      });
    },
  );


const getMyResult =
  catchAsync(
    async (
      req: Request,
      res: Response,
    ) => {
      const candidateId =
        req.user!.userId;

      const result =
        await resultService.getMyResult(
          candidateId,
          req.params.attemptId as string,
        );

      res.status(
        httpStatus.OK,
      ).json({
        success: true,

        message:
          "Result retrieved successfully",

        data: result,
      });
    },
  );


const getAssessmentResults =
  catchAsync(
    async (
      req: Request,
      res: Response,
    ) => {
      const recruiterId =
        req.user!.userId;

      const results =
        await resultService.getAssessmentResults(
          recruiterId,
          req.params.assessmentId as string,
        );

      res.status(
        httpStatus.OK,
      ).json({
        success: true,

        message:
          "Assessment results retrieved successfully",

        data: results,
      });
    },
  );


const getRecruiterResultById =
  catchAsync(
    async (
      req: Request,
      res: Response,
    ) => {
      const recruiterId =
        req.user!.userId;

      const result =
        await resultService.getRecruiterResultById(
          recruiterId,
          req.params.resultId as string,
        );

      res.status(
        httpStatus.OK,
      ).json({
        success: true,

        message:
          "Result retrieved successfully",

        data: result,
      });
    },
  );


const getAssessmentStatistics =
  catchAsync(
    async (
      req: Request,
      res: Response,
    ) => {
      const recruiterId =
        req.user!.userId;

      const statistics =
        await resultService.getAssessmentStatistics(
          recruiterId,
          req.params.assessmentId as string,
        );

      res.status(
        httpStatus.OK,
      ).json({
        success: true,

        message:
          "Assessment statistics retrieved successfully",

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