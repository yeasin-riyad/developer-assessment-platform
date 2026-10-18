
import bcrypt from "bcryptjs";
import httpStatus from "http-status";

import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";

const getMySettings = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      authProvider: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "User not found",
    );
  }

  return user;
};

const updateMyProfile = async (
  userId: string,
  payload: { name: string },
) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!user) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "User not found",
    );
  }

  return prisma.user.update({
    where: { id: userId },
    data: {
      name: payload.name.trim(),
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      authProvider: true,
      isActive: true,
      updatedAt: true,
    },
  });
};

const changeMyPassword = async (
  userId: string,
  payload: {
    currentPassword: string;
    newPassword: string;
  },
) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      password: true,
      authProvider: true,
      isActive: true,
    },
  });

  if (!user) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "User not found",
    );
  }

  if (!user.isActive) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Your account has been deactivated",
    );
  }

  // Google-only users need a separate password setup/reset flow.
  if (!user.password) {
    throw new AppError(
      httpStatus.CONFLICT,
      "This account has no local password. Use the password setup or reset flow.",
    );
  }

  const isPasswordMatched = await bcrypt.compare(
    payload.currentPassword,
    user.password,
  );

  if (!isPasswordMatched) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      "Current password is incorrect",
    );
  }

  const hashedPassword = await bcrypt.hash(
    payload.newPassword,
    12,
  );

  await prisma.user.update({
    where: { id: userId },
    data: {
      password: hashedPassword,
    },
  });

  return {
    message: "Password changed successfully",
  };
};

export const settingsService = {
  getMySettings,
  updateMyProfile,
  changeMyPassword,
};