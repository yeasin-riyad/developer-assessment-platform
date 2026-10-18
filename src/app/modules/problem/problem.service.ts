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

interface GetAllProblemsParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: "MCQ" | "WRITTEN";
  difficulty?: "EASY" | "MEDIUM" | "HARD";
}

const getAllProblems = async ({
  page = 1,
  limit = 10,
  search,
  type,
  difficulty,
}: GetAllProblemsParams) => {
  const safePage = Math.max(1, page);
  const safeLimit = Math.min(
    Math.max(1, limit),
    100,
  );

  const skip = (safePage - 1) * safeLimit;

  const where = {
    ...(search
      ? {
          OR: [
            {
              title: {
                contains: search,
                mode: "insensitive" as const,
              },
            },
            {
              description: {
                contains: search,
                mode: "insensitive" as const,
              },
            },
          ],
        }
      : {}),

    ...(type ? { type } : {}),

    ...(difficulty ? { difficulty } : {}),
  };

  const [problems, total] =
    await Promise.all([
      prisma.problem.findMany({
        where,

        select: {
          id: true,
          title: true,
          description: true,
          type: true,
          difficulty: true,
          points: true,
          createdAt: true,

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

        skip,
        take: safeLimit,
      }),

      prisma.problem.count({
        where,
      }),
    ]);

  const totalPages = Math.ceil(
    total / safeLimit,
  );

  return {
    problems,

    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages,
      hasNextPage:
        safePage < totalPages,
      hasPreviousPage:
        safePage > 1,
    },
  };
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