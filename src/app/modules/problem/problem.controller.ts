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

const getAllProblems = catchAsync(async (req, res) => {
  const {
    page = "1",
    limit = "10",
    search,
    type,
    difficulty,
  } = req.query;

  const result = await problemService.getAllProblems({
    page: Number(page),
    limit: Number(limit),
    search: search as string | undefined,
    type: type as "MCQ" | "WRITTEN" | undefined,
    difficulty: difficulty as
      | "EASY"
      | "MEDIUM"
      | "HARD"
      | undefined,
  });

  res.status(httpStatus.OK).json({
    success: true,
    statusCode: httpStatus.OK,
    message: "Problems retrieved successfully",
    data: result.problems,
    pagination: result.pagination,
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