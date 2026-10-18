import httpStatus from "http-status";

import { catchAsync } from "../../utils/catchAsync.js";

import { userService } from "./user.service.js";

const getMyProfile = catchAsync(async (req, res) => {
  const user = await userService.getMyProfile(req.user!.userId);

  res.status(httpStatus.OK).json({
    success: true,
    statusCode: httpStatus.OK,
    message: "User profile retrieved successfully",
    data: user,
  });
});

const getAllCandidates = catchAsync(async (req, res) => {
  const {
    page = "1",
    limit = "10",
    search,
  } = req.query;

  const result = await userService.getAllCandidates({
    page: Number(page),
    limit: Number(limit),
    search: search as string | undefined,
  });

  res.status(httpStatus.OK).json({
    success: true,
    statusCode: httpStatus.OK,
    message: "Candidates retrieved successfully",
    data: result.candidates,
    pagination: result.pagination,
  });
});

export const userController = {
  getMyProfile,
  getAllCandidates,
};