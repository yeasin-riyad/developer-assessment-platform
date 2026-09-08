import bcrypt from "bcryptjs";
import httpStatus from "http-status";
import type { SignOptions } from "jsonwebtoken";

import { UserRole } from "../../../generated/prisma/enums.js";
import config from "../../config/index.js";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
import { getGoogleUserFromAuthCode } from "../../utils/googleOAuth.js";
import { jwtUtils } from "../../utils/jwt.js";

// ======================================================
// LOGIN USER WITH EMAIL + PASSWORD
// ======================================================

const loginUser = async (payload: {
  email: string;
  password: string;
}) => {
  const email = payload.email.toLowerCase().trim();

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      "Invalid email or password",
    );
  }

  if (!user.isActive) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Your account has been deactivated",
    );
  }

  // Accounts created via Google signup do not have a local password
  if (!user.password) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      "This account uses Google login. Please continue with Google.",
    );
  }

  const isPasswordMatched = await bcrypt.compare(
    payload.password,
    user.password,
  );

  if (!isPasswordMatched) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      "Invalid email or password",
    );
  }

  const jwtPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_access_secret,
    config.jwt_access_expires_in as SignOptions["expiresIn"],
  );

  const refreshToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_refresh_secret,
    config.jwt_refresh_expires_in as SignOptions["expiresIn"],
  );

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
};

// ======================================================
// REGISTER USER
// ======================================================

const registerUser = async (payload: {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}) => {
  if (
    payload.role &&
    payload.role !== UserRole.CREATOR &&
    payload.role !== UserRole.CANDIDATE
  ) {
    throw new AppError(
      httpStatus.CONFLICT,
      "Only Candidate or Creator can manually register",
    );
  }

  const email = payload.email.toLowerCase().trim();

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new AppError(
      httpStatus.CONFLICT,
      "User with this email already exists",
    );
  }

  const hashedPassword = await bcrypt.hash(payload.password, 12);

  const user = await prisma.user.create({
    data: {
      name: payload.name,
      email,
      password: hashedPassword,
      role: payload.role || UserRole.CANDIDATE,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  return user;
};

// ======================================================
// REFRESH ACCESS TOKEN
// ======================================================

const refreshAccessToken = async (refreshToken: string) => {
  const result = jwtUtils.verifyToken(
    refreshToken,
    config.jwt_refresh_secret,
  );

  if (!result.success) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      "Invalid or expired refresh token",
    );
  }

  const payload = result.data as {
    userId: string;
    email: string;
    role: string;
  };

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
  });

  if (!user) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      "User no longer exists",
    );
  }

  if (!user.isActive) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Your account has been deactivated",
    );
  }

  const newAccessToken = jwtUtils.createToken(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
    },
    config.jwt_access_secret,
    config.jwt_access_expires_in as SignOptions["expiresIn"],
  );

  return newAccessToken;
};

// ======================================================
// GOOGLE OAUTH HELPER FUNCTIONS
// ======================================================

const findUserByGoogleId = async (googleId: string) => {
  return prisma.user.findUnique({
    where: { googleId },
  });
};

const findUserByEmail = async (email: string) => {
  return prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
  });
};

const linkGoogleIdToUser = async (userId: string, googleId: string) => {
  try {
    return await prisma.user.update({
      where: { id: userId },
      data: { googleId },
    });
  } catch (error: any) {
    if (error?.code === "P2002") {
      throw new AppError(
        httpStatus.CONFLICT,
        "This Google account is already linked to another user",
      );
    }
    throw error;
  }
};

const createGoogleUser = async (
  email: string,
  googleId: string,
  name: string,
) => {
  try {
    return await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase().trim(),
        password: null,
        googleId,
        role: UserRole.CANDIDATE,
        isActive: true,
      },
    });
  } catch (error: any) {
    if (error?.code === "P2002") {
      throw new AppError(
        httpStatus.CONFLICT,
        "User with this Google account or email already exists",
      );
    }
    throw error;
  }
};

const createAccessTokenForUser = (user: {
  id: string;
  email: string;
  role: UserRole;
}) => {
  return jwtUtils.createToken(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
    },
    config.jwt_access_secret,
    config.jwt_access_expires_in as SignOptions["expiresIn"],
  );
};

const createRefreshTokenForUser = (user: {
  id: string;
  email: string;
  role: UserRole;
}) => {
  return jwtUtils.createToken(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
    },
    config.jwt_refresh_secret,
    config.jwt_refresh_expires_in as SignOptions["expiresIn"],
  );
};

// ======================================================
// LOGIN WITH GOOGLE
// ======================================================

const loginWithGoogle = async (code: string) => {
  const googleProfile = await getGoogleUserFromAuthCode(code);

  let user = await findUserByGoogleId(googleProfile.googleId);

  if (!user) {
    user = await findUserByEmail(googleProfile.email);

    if (user) {
      user = await linkGoogleIdToUser(user.id, googleProfile.googleId);
    } else {
      user = await createGoogleUser(
        googleProfile.email,
        googleProfile.googleId,
        googleProfile.name,
      );
    }
  }

  if (!user.isActive) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Your account has been deactivated",
    );
  }

  const accessToken = createAccessTokenForUser({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  const refreshToken = createRefreshTokenForUser({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
};

export const authService = {
  registerUser,
  loginUser,
  refreshAccessToken,
  loginWithGoogle,
};