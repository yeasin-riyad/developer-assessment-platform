
import { prisma } from "../../lib/prisma.js";

const getDashboardStatistics = async (userId: string) => {
  const [
    totalProblems,
    mcqProblems,
    writtenProblems,
    codingProblems,
    assessmentUsages,
  ] = await Promise.all([
    // Total problems created by this creator
    prisma.problem.count({
      where: {
        createdById: userId,
      },
    }),

    // MCQ problems
    prisma.problem.count({
      where: {
        createdById: userId,
        type: "MCQ",
      },
    }),

    // Written problems
    prisma.problem.count({
      where: {
        createdById: userId,
        type: "WRITTEN",
      },
    }),

    // Legacy coding problems, if they exist
    prisma.problem.count({
      where: {
        createdById: userId,
        type: "CODING",
      },
    }),

    // Assessments using this creator's problems
    prisma.assessmentProblem.findMany({
      where: {
        problem: {
          createdById: userId,
        },
      },
      select: {
        assessmentId: true,
      },
      distinct: ["assessmentId"],
    }),
  ]);

  return {
    problems: {
      total: totalProblems,
      mcq: mcqProblems,
      written: writtenProblems,
      coding: codingProblems,
    },

    assessments: {
      total: assessmentUsages.length,
    },
  };
};

export const creatorService = {
  getDashboardStatistics,
};

