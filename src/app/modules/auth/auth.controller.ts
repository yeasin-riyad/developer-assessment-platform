import type { Request, Response } from "express";
import httpStatus from "http-status";

import config from "../../config/index.js";
import { AppError } from "../../utils/AppError.js";
import { catchAsync } from "../../utils/catchAsync.js";
import { getGoogleAuthUrl } from "../../utils/googleOAuth.js";
import { authService } from "./auth.service.js";

// Cookie configuration utility
const setRefreshTokenCookie = (res: Response, token: string) => {
  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: config.node_env === "production",
    sameSite: config.node_env === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

// ======================================================
// REGISTER
// ======================================================

const register = catchAsync(async (req: Request, res: Response) => {
  const result = await authService.registerUser(req.body);

  res.status(httpStatus.CREATED).json({
    success: true,
    message: "User registered successfully",
    data: result,
  });
});

// ======================================================
// LOGIN
// ======================================================

const login = catchAsync(async (req: Request, res: Response) => {
  const result = await authService.loginUser(req.body);

  setRefreshTokenCookie(res, result.refreshToken);

  res.status(httpStatus.OK).json({
    success: true,
    message: "Login successful",
    data: {
      accessToken: result.accessToken,
      user: result.user,
    },
  });
});

// ======================================================
// REFRESH TOKEN
// ======================================================

const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken;

  if (!token) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      "Refresh token is required",
    );
  }

  const newAccessToken = await authService.refreshAccessToken(token);

  res.status(httpStatus.OK).json({
    success: true,
    message: "Access token refreshed successfully",
    data: {
      accessToken: newAccessToken,
    },
  });
});

// ======================================================
// LOGOUT
// ======================================================

const logout = catchAsync(async (req: Request, res: Response) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: config.node_env === "production",
    sameSite: config.node_env === "production" ? "none" : "lax",
  });

  res.status(httpStatus.OK).json({
    success: true,
    message: "Logout successful",
  });
});

// ======================================================
// GOOGLE LOGIN
// ======================================================

const googleLogin = catchAsync(async (req: Request, res: Response) => {
  const googleAuthUrl = getGoogleAuthUrl();
  res.redirect(googleAuthUrl);
});

// ======================================================
// GOOGLE CALLBACK
// ======================================================

const googleCallback = catchAsync(async (req: Request, res: Response) => {
  const code = req.query.code as string | undefined;

  if (!code) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Google authorization code is required",
    );
  }

  const result = await authService.loginWithGoogle(code);

  setRefreshTokenCookie(res, result.refreshToken);

  // Note: For production SPA clients (React/Next.js), consider redirecting 
  // to client URL: res.redirect(`${config.client_url}/oauth/success?token=${result.accessToken}`);
  res.status(httpStatus.OK).json({
    success: true,
    message: "Google login successful",
    data: {
      accessToken: result.accessToken,
      user: result.user,
    },
  });
});

export const authController = {
  register,
  login,
  refreshToken,
  logout,
  googleLogin,
  googleCallback,
};