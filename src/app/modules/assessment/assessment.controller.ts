import httpStatus from "http-status";

import { catchAsync } from "../../utils/catchAsync.js";
import { assessmentService } from "./assessment.service.js";

const createAssessment = catchAsync(async (req, res) => {
  const assessment =
    await assessmentService.createAssessment(
      req.user!.userId,
      req.body,
    );

  res.status(httpStatus.CREATED).json({
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Assessment created successfully",
    data: assessment,
  });
});

const getMyAssessments = catchAsync(async (req, res) => {
  const assessments =
    await assessmentService.getMyAssessments(
      req.user!.userId,
    );

  res.status(httpStatus.OK).json({
    success: true,
    statusCode: httpStatus.OK,
    message: "Assessments retrieved successfully",
    data: assessments,
  });
});

const getAssessmentById = catchAsync(async (req, res) => {
  const assessment =
    await assessmentService.getAssessmentById(
      req.user!.userId,
      req.params.id as string,
    );

  res.status(httpStatus.OK).json({
    success: true,
    statusCode: httpStatus.OK,
    message: "Assessment retrieved successfully",
    data: assessment,
  });
});

const updateAssessment = catchAsync(async (req, res) => {
  const assessment =
    await assessmentService.updateAssessment(
      req.user!.userId,
      req.params.id as string,
      req.body,
    );

  res.status(httpStatus.OK).json({
    success: true,
    statusCode: httpStatus.OK,
    message: "Assessment updated successfully",
    data: assessment,
  });
});

const addProblem = catchAsync(async (req, res) => {
  const result =
    await assessmentService.addProblemToAssessment(
      req.user!.userId,
      req.params.id as string,
      req.body,
    );

  res.status(httpStatus.CREATED).json({
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Problem added to assessment successfully",
    data: result,
  });
});

const removeProblem = catchAsync(async (req, res) => {
  const result =
    await assessmentService.removeProblemFromAssessment(
      req.user!.userId,
      req.params.id as string,
      req.params.problemId as string,
    );

  res.status(httpStatus.OK).json({
    success: true,
    statusCode: httpStatus.OK,
    message: "Problem removed from assessment successfully",
    data: result,
  });
});

const publishAssessment = catchAsync(async (req, res) => {
  const assessment =
    await assessmentService.publishAssessment(
      req.user!.userId,
      req.params.id as string,
    );

  res.status(httpStatus.OK).json({
    success: true,
    statusCode: httpStatus.OK,
    message: "Assessment published successfully",
    data: assessment,
  });
});

const unpublishAssessment = catchAsync(async (req, res) => {
  const assessment =
    await assessmentService.unpublishAssessment(
      req.user!.userId,
      req.params.id as string,
    );

  res.status(httpStatus.OK).json({
    success: true,
    statusCode: httpStatus.OK,
    message: "Assessment unpublished successfully",
    data: assessment,
  });
});

export const assessmentController = {
  createAssessment,
  getMyAssessments,
  getAssessmentById,
  updateAssessment,
  addProblem,
  removeProblem,
  publishAssessment,
  unpublishAssessment,
};