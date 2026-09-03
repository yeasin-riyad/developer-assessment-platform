import httpStatus from "http-status";

import { AppError } from "../../utils/AppError.js";
import { prisma } from "../../lib/prisma.js";

const createAssessment = async (
  recruiterId: string,
  payload: {
    title: string;
    description?: string;
    duration: number;
  },
) => {
  const recruiter = await prisma.user.findUnique({
    where: {
      id: recruiterId,
    },
  });

  if (!recruiter) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Recruiter not found",
    );
  }

  if (recruiter.role !== "RECRUITER") {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Only recruiters can create assessments",
    );
  }

  const company = await prisma.company.findUnique({
    where: {
      recruiterId,
    },
  });

  if (!company) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You must create a company before creating an assessment",
    );
  }

  const assessment = await prisma.assessment.create({
    data: {
      title: payload.title,
      description: payload.description,
      duration: payload.duration,
      recruiterId,
    },
  });

  return assessment;
};

const getMyAssessments = async (
  recruiterId: string,
) => {
  return prisma.assessment.findMany({
    where: {
      recruiterId,
    },

    include: {
      problems: {
        include: {
          problem: {
            select: {
              id: true,
              title: true,
              type: true,
              difficulty: true,
            },
          },
        },

        orderBy: {
          order: "asc",
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });
};

const getAssessmentById = async (
  recruiterId: string,
  assessmentId: string,
) => {
  const assessment =
    await prisma.assessment.findFirst({
      where: {
        id: assessmentId,
        recruiterId,
      },

      include: {
        problems: {
          include: {
            problem: {
              select: {
                id: true,
                title: true,
                description: true,
                type: true,
                difficulty: true,
                points: true,
              },
            },
          },

          orderBy: {
            order: "asc",
          },
        },
      },
    });

  if (!assessment) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Assessment not found",
    );
  }

  return assessment;
};


const addProblemToAssessment = async (
  recruiterId: string,
  assessmentId: string,
  payload: {
    problemId: string;
    points: number;
    order: number;
  },
) => {
  const assessment =
    await prisma.assessment.findFirst({
      where: {
        id: assessmentId,
        recruiterId,
      },
    });

  if (!assessment) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Assessment not found",
    );
  }

  if (assessment.status !== "DRAFT") {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Problems can only be added to a draft assessment",
    );
  }

  const problem = await prisma.problem.findUnique({
    where: {
      id: payload.problemId,
    },
  });

  if (!problem) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Problem not found",
    );
  }

  const existing =
    await prisma.assessmentProblem.findUnique({
      where: {
        assessmentId_problemId: {
          assessmentId,
          problemId: payload.problemId,
        },
      },
    });

  if (existing) {
    throw new AppError(
      httpStatus.CONFLICT,
      "Problem already exists in this assessment",
    );
  }

  const assessmentProblem =
    await prisma.assessmentProblem.create({
      data: {
        assessmentId,
        problemId: payload.problemId,
        points: payload.points,
        order: payload.order,
      },

      include: {
        problem: true,
      },
    });

  const totalMarks = await prisma.assessmentProblem.aggregate({
    where: {
      assessmentId,
    },

    _sum: {
      points: true,
    },
  });

  await prisma.assessment.update({
    where: {
      id: assessmentId,
    },

    data: {
      totalMarks: totalMarks._sum.points ?? 0,
    },
  });

  return assessmentProblem;
};


const removeProblemFromAssessment = async (
  recruiterId: string,
  assessmentId: string,
  problemId: string,
) => {
  const assessment =
    await prisma.assessment.findFirst({
      where: {
        id: assessmentId,
        recruiterId,
      },
    });

  if (!assessment) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Assessment not found",
    );
  }

  if (assessment.status !== "DRAFT") {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Problems can only be removed from a draft assessment",
    );
  }

  const assessmentProblem =
    await prisma.assessmentProblem.findUnique({
      where: {
        assessmentId_problemId: {
          assessmentId,
          problemId,
        },
      },
    });

  if (!assessmentProblem) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Problem is not part of this assessment",
    );
  }

  await prisma.assessmentProblem.delete({
    where: {
      id: assessmentProblem.id,
    },
  });

  const totalMarks = await prisma.assessmentProblem.aggregate({
    where: {
      assessmentId,
    },

    _sum: {
      points: true,
    },
  });

  return prisma.assessment.update({
    where: {
      id: assessmentId,
    },

    data: {
      totalMarks: totalMarks._sum.points ?? 0,
    },
  });
};


const updateAssessment = async (
  recruiterId: string,
  assessmentId: string,
  payload: {
    title?: string;
    description?: string;
    duration?: number;
  },
) => {
  const assessment =
    await prisma.assessment.findFirst({
      where: {
        id: assessmentId,
        recruiterId,
      },
    });

  if (!assessment) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Assessment not found",
    );
  }

  if (assessment.status !== "DRAFT") {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Only draft assessments can be updated",
    );
  }

  return prisma.assessment.update({
    where: {
      id: assessmentId,
    },

    data: payload,
  });
};


const publishAssessment = async (
  recruiterId: string,
  assessmentId: string,
) => {
  const assessment =
    await prisma.assessment.findFirst({
      where: {
        id: assessmentId,
        recruiterId,
      },

      include: {
        problems: true,
      },
    });

  if (!assessment) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Assessment not found",
    );
  }

  if (assessment.status !== "DRAFT") {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Only draft assessments can be published",
    );
  }

  if (assessment.problems.length === 0) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Assessment must contain at least one problem",
    );
  }

  if (assessment.totalMarks <= 0) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Assessment total marks must be greater than zero",
    );
  }

  return prisma.assessment.update({
    where: {
      id: assessmentId,
    },

    data: {
      status: "PUBLISHED",
    },
  });
};


const unpublishAssessment = async (
  recruiterId: string,
  assessmentId: string,
) => {
  const assessment =
    await prisma.assessment.findFirst({
      where: {
        id: assessmentId,
        recruiterId,
      },
    });

  if (!assessment) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Assessment not found",
    );
  }

  if (assessment.status !== "PUBLISHED") {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Only published assessments can be unpublished",
    );
  }

  return prisma.assessment.update({
    where: {
      id: assessmentId,
    },

    data: {
      status: "DRAFT",
    },
  });
};

export const assessmentService = {
  createAssessment,
  getMyAssessments,
  getAssessmentById,
  updateAssessment,
  addProblemToAssessment,
  removeProblemFromAssessment,
  publishAssessment,
  unpublishAssessment,
};