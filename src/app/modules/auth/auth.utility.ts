import { prisma } from "../../lib/prisma.js";

export async function findUserByGoogleId(
  googleId: string,
) {
  return prisma.user.findUnique({
    where: {
      googleId,
    },
  });
}

export async function findUserByEmail(
  email: string,
) {
  return prisma.user.findUnique({
    where: {
      email,
    },
  });
}

export async function linkGoogleIdToUser(
  userId: string,
  googleId: string,
) {
  return prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      googleId,
    },
  });
}

export async function createGoogleUser(
  email: string,
  googleId: string,
  name: string,
) {
  return prisma.user.create({
    data: {
      name,
      email,
      googleId,

      // Google user does not have local password
      password: null,

      // IMPORTANT
      // Google signup becomes candidate
      role: "CANDIDATE",

      isActive: true,
    },
  });
}