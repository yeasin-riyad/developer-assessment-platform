import httpStatus from "http-status";

import { catchAsync } from "../../utils/catchAsync.js";
import { attemptService } from "./attempt.service.js";

const getMyAttempt = catchAsync(async (req, res) => {
  const attempt = await attemptService.getMyAttempt(
    req.user!.userId,
    req.params.id as string,
  );

  res.status(httpStatus.OK).json({
    success: true,
    statusCode: httpStatus.OK,
    message: "Attempt retrieved successfully",
    data: attempt,
  });
});

const startAttempt = catchAsync(async (req, res) => {
  const attempt = await attemptService.startAttempt(
    req.user!.userId,
    req.params.id as string,
  );

  res.status(httpStatus.OK).json({
    success: true,
    statusCode: httpStatus.OK,
    message: "Assessment started successfully",
    data: attempt,
  });
});

const getAttemptQuestions = catchAsync(
  async (req, res) => {
    const questions =
      await attemptService.getAttemptQuestions(
        req.user!.userId,
        req.params.id as string,
      );

    res.status(httpStatus.OK).json({
      success: true,
      statusCode: httpStatus.OK,
      message: "Assessment questions retrieved successfully",
      data: questions,
    });
  },
);

const getAttemptStatus = catchAsync(
  async (req, res) => {
    const status =
      await attemptService.getAttemptStatus(
        req.user!.userId,
        req.params.id as string,
      );

    res.status(httpStatus.OK).json({
      success: true,
      statusCode: httpStatus.OK,
      message: "Attempt status retrieved successfully",
      data: status,
    });
  },
);

const saveAnswer = catchAsync(async (req, res) => {
  const answer = await attemptService.saveAnswer(
    req.user!.userId,
    req.params.id as string,
    req.body,
  );

  res.status(httpStatus.OK).json({
    success: true,
    statusCode: httpStatus.OK,
    message: "Answer saved successfully",
    data: answer,
  });
});

const submitAttempt = catchAsync(async (req, res) => {
  const attempt =
    await attemptService.submitAttempt(
      req.user!.userId,
      req.params.id as string,
    );

  res.status(httpStatus.OK).json({
    success: true,
    statusCode: httpStatus.OK,
    message: "Assessment submitted successfully",
    data: attempt,
  });
});

export const attemptController = {
  getMyAttempt,
  startAttempt,
  getAttemptQuestions,
  getAttemptStatus,
  saveAnswer,
  submitAttempt,
};