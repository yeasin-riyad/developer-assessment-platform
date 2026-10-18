// modules/candidate/candidate.controller.ts

import type { Request, Response } from "express";
import httpStatus from "http-status";

import { CandidateService } from "./candidate.service.js";

import {
  candidateActivityQuerySchema,
  candidateQuerySchema,
  candidateIdSchema,
} from "./candidate.validation.js";

const getCurrentUser = (req: Request) => {
  if (!req.user) {
    throw new Error("Authenticated user not found");
  }

  return req.user;
};

const getCandidates = async (
  req: Request,
  res: Response,
) => {
  const user = getCurrentUser(req);

  const query = candidateQuerySchema.parse(
    req.query,
  );

  const result =
    await CandidateService.getCandidates(
      user.userId,
      user.role,
      query,
    );

  res.status(httpStatus.OK).json({
    success: true,
    statusCode: httpStatus.OK,
    message: "Candidates retrieved successfully",
    data: result,
  });
};

const getCandidateById = async (
  req: Request,
  res: Response,
) => {
  const user = getCurrentUser(req);

  const { candidateId } =
    candidateIdSchema.parse(req.params);

  const result =
    await CandidateService.getCandidateById(
      candidateId,
      user.userId,
      user.role,
    );

  res.status(httpStatus.OK).json({
    success: true,
    statusCode: httpStatus.OK,
    message: "Candidate retrieved successfully",
    data: result,
  });
};

const getCandidateActivities = async (
  req: Request,
  res: Response,
) => {
  const user = getCurrentUser(req);

  const { candidateId } =
    candidateIdSchema.parse(req.params);

  const query =
    candidateActivityQuerySchema.parse(
      req.query,
    );

  const result =
    await CandidateService.getCandidateActivities(
      candidateId,
      user.userId,
      user.role,
      query,
    );

  res.status(httpStatus.OK).json({
    success: true,
    statusCode: httpStatus.OK,
    message:
      "Candidate activities retrieved successfully",
    data: result,
  });
};

const getCandidateAssessments = async (
  req: Request,
  res: Response,
) => {
  const user = getCurrentUser(req);

  const { candidateId } =
    candidateIdSchema.parse(req.params);

  const query =
    candidateActivityQuerySchema.parse(
      req.query,
    );

  const result =
    await CandidateService.getCandidateAssessments(
      candidateId,
      user.userId,
      user.role,
      query,
    );

  res.status(httpStatus.OK).json({
    success: true,
    statusCode: httpStatus.OK,
    message:
      "Candidate assessments retrieved successfully",
    data: result,
  });
};

export const CandidateController = {
  getCandidates,
  getCandidateById,
  getCandidateActivities,
  getCandidateAssessments,
};