import httpStatus from "http-status";

import { AppError } from "../../utils/AppError.js";
import { prisma } from "../../lib/prisma.js";

const createProblem = async (
  userId: string,
  payload: {
    title: string;
    description: string;
    type: "CODING" | "MCQ" | "WRITTEN";
    difficulty: "EASY" | "MEDIUM" | "HARD";
    points: number;
    options?: {
      text: string;
      isCorrect: boolean;
    }[];
    testCases?: {
      input: string;
      expectedOutput: string;
      isHidden: boolean;
    }[];
  },
) => {
  const problem = await prisma.problem.create({
    data: {
      title: payload.title,
      description: payload.description,
      type: payload.type,
      difficulty: payload.difficulty,
      points: payload.points,

      createdById: userId,

      options: payload.options
        ? {
            create: payload.options,
          }
        : undefined,

      testCases: payload.testCases
        ? {
            create: payload.testCases,
          }
        : undefined,
    },

    include: {
      options: true,
      testCases: true,
    },
  });

  return problem;
};

const getAllProblems = async () => {
  return prisma.problem.findMany({
    include: {
      options: true,
      testCases: true,
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

const getProblemById = async (problemId: string) => {
  const problem = await prisma.problem.findUnique({
    where: {
      id: problemId,
    },
    include: {
      options: true,
      testCases: true,
      createdBy: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!problem) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Problem not found",
    );
  }

  return problem;
};

export const problemService = {
  createProblem,
  getAllProblems,
  getProblemById,
};