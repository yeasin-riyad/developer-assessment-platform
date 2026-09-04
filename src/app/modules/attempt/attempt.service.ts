import httpStatus from "http-status";

import { AppError } from "../../utils/AppError.js";
import { prisma } from "../../lib/prisma.js";

const getMyAttempt = async (
  candidateId: string,
  attemptId: string,
) => {
  const attempt = await prisma.attempt.findFirst({
    where: {
      id: attemptId,
      candidateId,
    },

    include: {
      assessment: {
        select: {
          id: true,
          title: true,
          duration: true,
          totalMarks: true,
          status: true,
        },
      },

      answers: true,
    },
  });

  if (!attempt) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Attempt not found",
    );
  }

  return attempt;
};

const startAttempt = async (
  candidateId: string,
  attemptId: string,
) => {
  const attempt = await prisma.attempt.findFirst({
    where: {
      id: attemptId,
      candidateId,
    },

    include: {
      assessment: {
        select: {
          duration: true,
          status: true,
        },
      },
    },
  });

  if (!attempt) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Attempt not found",
    );
  }

  if (attempt.status !== "NOT_STARTED") {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Attempt has already been started or completed",
    );
  }

  if (attempt.assessment.status !== "PUBLISHED") {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Assessment is not available",
    );
  }

  const startedAt = new Date();

  const expiresAt = new Date(
    startedAt.getTime() +
      attempt.assessment.duration * 60 * 1000,
  );

  return prisma.attempt.update({
    where: {
      id: attemptId,
    },

    data: {
      status: "IN_PROGRESS",
      startedAt,
      expiresAt,
    },
  });
};

const getAttemptQuestions = async (
  candidateId: string,
  attemptId: string,
) => {
  const attempt = await prisma.attempt.findFirst({
    where: {
      id: attemptId,
      candidateId,
    },

    include: {
      assessment: {
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

                  options: {
                    select: {
                      id: true,
                      text: true,
                    },
                  },
                },
              },
            },

            orderBy: {
              order: "asc",
            },
          },
        },
      },
    },
  });

  if (!attempt) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Attempt not found",
    );
  }

  if (
    attempt.status !== "IN_PROGRESS" &&
    attempt.status !== "NOT_STARTED"
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "This attempt is no longer available",
    );
  }

  return {
    attemptId: attempt.id,
    status: attempt.status,
    startedAt: attempt.startedAt,
    expiresAt: attempt.expiresAt,

    assessment: {
      id: attempt.assessment.id,
      title: attempt.assessment.title,
      duration: attempt.assessment.duration,
      totalMarks: attempt.assessment.totalMarks,
    },

    problems: attempt.assessment.problems,
  };
};

const saveAnswer = async (
  candidateId: string,
  attemptId: string,
  payload: {
    problemId: string;
    answer: string;
  },
) => {
  const attempt = await prisma.attempt.findFirst({
    where: {
      id: attemptId,
      candidateId,
    },
  });

  if (!attempt) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Attempt not found",
    );
  }

  if (attempt.status !== "IN_PROGRESS") {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Attempt is not in progress",
    );
  }

  // Server-side timer validation
  if (
    attempt.expiresAt &&
    new Date() > attempt.expiresAt
  ) {
    await prisma.attempt.update({
      where: {
        id: attempt.id,
      },

      data: {
        status: "EXPIRED",
      },
    });

    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Assessment time has expired",
    );
  }

  // Make sure problem belongs to assessment
  const assessmentProblem =
    await prisma.assessmentProblem.findUnique({
      where: {
        assessmentId_problemId: {
          assessmentId: attempt.assessmentId,
          problemId: payload.problemId,
        },
      },
    });

  if (!assessmentProblem) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Problem does not belong to this assessment",
    );
  }

  return prisma.attemptAnswer.upsert({
    where: {
      attemptId_problemId: {
        attemptId,
        problemId: payload.problemId,
      },
    },

    create: {
      attemptId,
      problemId: payload.problemId,
      answer: payload.answer,
    },

    update: {
      answer: payload.answer,
    },
  });
};

const submitAttempt = async (
  candidateId: string,
  attemptId: string,
) => {
  const attempt = await prisma.attempt.findFirst({
    where: {
      id: attemptId,
      candidateId,
    },
  });

  if (!attempt) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Attempt not found",
    );
  }

  if (attempt.status !== "IN_PROGRESS") {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Only active attempts can be submitted",
    );
  }

  const now = new Date();

  // Time expired
  if (
    attempt.expiresAt &&
    now > attempt.expiresAt
  ) {
    return prisma.attempt.update({
      where: {
        id: attemptId,
      },

      data: {
        status: "EXPIRED",
        submittedAt: now,
      },
    });
  }

  return prisma.attempt.update({
    where: {
      id: attemptId,
    },

    data: {
      status: "SUBMITTED",
      submittedAt: now,
    },
  });
};

const getAttemptStatus = async (
  candidateId: string,
  attemptId: string,
) => {
  const attempt = await prisma.attempt.findFirst({
    where: {
      id: attemptId,
      candidateId,
    },

    select: {
      id: true,
      status: true,
      startedAt: true,
      expiresAt: true,
      submittedAt: true,
    },
  });

  if (!attempt) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Attempt not found",
    );
  }

  // Automatically mark expired attempt
  if (
    attempt.status === "IN_PROGRESS" &&
    attempt.expiresAt &&
    new Date() > attempt.expiresAt
  ) {
    const updatedAttempt =
      await prisma.attempt.update({
        where: {
          id: attempt.id,
        },

        data: {
          status: "EXPIRED",
        },

        select: {
          id: true,
          status: true,
          startedAt: true,
          expiresAt: true,
          submittedAt: true,
        },
      });

    return updatedAttempt;
  }

  return attempt;
};


export const attemptService = {
  getMyAttempt,
  startAttempt,
  getAttemptQuestions,
  getAttemptStatus,
  saveAnswer,
  submitAttempt,
};