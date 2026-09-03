import httpStatus from "http-status";

import { catchAsync } from "../../utils/catchAsync.js";
import { problemService } from "./problem.service.js";

const createProblem = catchAsync(async (req, res) => {
  const problem = await problemService.createProblem(
    req.user!.userId,
    req.body,
  );

  res.status(httpStatus.CREATED).json({
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Problem created successfully",
    data: problem,
  });
});

const getAllProblems = catchAsync(async (_req, res) => {
  const problems = await problemService.getAllProblems();

  res.status(httpStatus.OK).json({
    success: true,
    statusCode: httpStatus.OK,
    message: "Problems retrieved successfully",
    data: problems,
  });
});

const getProblemById = catchAsync(async (req, res) => {
  const problem = await problemService.getProblemById(
    req.params.id as string,
  );

  res.status(httpStatus.OK).json({
    success: true,
    statusCode: httpStatus.OK,
    message: "Problem retrieved successfully",
    data: problem,
  });
});

export const problemController = {
  createProblem,
  getAllProblems,
  getProblemById,
};