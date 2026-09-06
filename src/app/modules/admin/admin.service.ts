import httpStatus from "http-status";

import { AppError } from "../../utils/AppError.js";
import { UserRole } from "../../../generated/prisma/enums.js";
import { prisma } from "../../lib/prisma.js";

const getAllUsers = async (
  query: {
    role?: UserRole;
    isActive?: boolean;
    search?: string;
  } = {},
) => {
  const { role, isActive, search } = query;

  const users = await prisma.user.findMany({
    where: {
      ...(role && {
        role,
      }),

      ...(isActive !== undefined && {
        isActive,
      }),

      ...(search && {
        OR: [
          {
            name: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            email: {
              contains: search,
              mode: "insensitive",
            },
          },
        ],
      }),
    },

    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,

      company: {
        select: {
          id: true,
          name: true,
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  return users;
};

const getUserById = async (
  userId: string,
) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },

    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,

      company: {
        select: {
          id: true,
          name: true,
          description: true,
          website: true,
          logo: true,
        },
      },

      _count: {
        select: {
          problems: true,
          assessments: true,
          invitations: true,
          attempts: true,
          evaluations: true,
        },
      },
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


const updateUserRole = async (
  adminId: string,
  userId: string,
  role: UserRole,
) => {
  // Prevent admin from changing their own role
  if (adminId === userId) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You cannot change your own role",
    );
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },

    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
    },
  });

  if (!user) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "User not found",
    );
  }

  const updatedUser =
    await prisma.user.update({
      where: {
        id: userId,
      },

      data: {
        role,
      },

      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        updatedAt: true,
      },
    });

  return updatedUser;
};

const updateUserStatus = async (
  adminId: string,
  userId: string,
  isActive: boolean,
) => {
  if (adminId === userId) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You cannot change your own account status",
    );
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },

    select: {
      id: true,
      name: true,
      email: true,
      isActive: true,
    },
  });

  if (!user) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "User not found",
    );
  }

  const updatedUser =
    await prisma.user.update({
      where: {
        id: userId,
      },

      data: {
        isActive,
      },

      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        updatedAt: true,
      },
    });

  return updatedUser;
};

const deleteUser = async (
  adminId: string,
  userId: string,
) => {
  if (adminId === userId) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You cannot delete your own account",
    );
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },

    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });

  if (!user) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "User not found",
    );
  }

  await prisma.user.delete({
    where: {
      id: userId,
    },
  });

  return null;
};

export const adminService = {
  getAllUsers,
  getUserById,
  updateUserRole,
  updateUserStatus,
  deleteUser,
};