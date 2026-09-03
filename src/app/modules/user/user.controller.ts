import httpStatus from "http-status";

import { catchAsync } from "../../utils/catchAsync.js";
import { userService } from "./user.service.js";

const getMyProfile = catchAsync(async (req, res) => {
  const user = await userService.getMyProfile(
    req.user!.userId,
  );

  res.status(httpStatus.OK).json({
    success: true,
    statusCode: httpStatus.OK,
    message: "User profile retrieved successfully",
    data: user,
  });
});

export const userController = {
  getMyProfile,
};