import httpStatus from "http-status";

import { AppError } from "../../utils/AppError.js";
import { prisma } from "../../lib/prisma.js";

const createCompany = async (
  userId: string,
  payload: {
    name: string;
    description?: string;
    website?: string;
    logo?: string;
  },
) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "User not found",
    );
  }

  if (user.role !== "RECRUITER") {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Only recruiters can create a company",
    );
  }

  const existingCompany = await prisma.company.findUnique({
    where: {
      recruiterId: userId,
    },
  });

  if (existingCompany) {
    throw new AppError(
      httpStatus.CONFLICT,
      "You already have a company",
    );
  }

  const company = await prisma.company.create({
    data: {
      name: payload.name,
      description: payload.description,
      website: payload.website,
      logo: payload.logo,
      recruiterId: userId,
    },
  });

  return company;
};

const getMyCompany = async (userId: string) => {
  const company = await prisma.company.findUnique({
    where: {
      recruiterId: userId,
    },
  });

  if (!company) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Company not found",
    );
  }

  return company;
};

export const companyService = {
  createCompany,
  getMyCompany,
};