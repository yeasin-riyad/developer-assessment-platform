
import httpStatus from "http-status";

import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
import { evaluationService } from "../evaluation/evaluation.service.js";
import { resultService } from "../result/result.service.js";

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

      answers: {
        select: {
          id: true,
          problemId: true,
          answer: true,
          createdAt: true,
          updatedAt: true,
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

    select: {
      id: true,
      assessmentId: true,
      candidateId: true,
      status: true,
      startedAt: true,
      expiresAt: true,
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
                    orderBy: {
                      id: "asc",
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

  if (attempt.status !== "IN_PROGRESS") {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Attempt has not been started or is no longer available",
    );
  }

  /*
   * Server-side timer protection.
   *
   * Even if the frontend timer has not reached zero,
   * the backend remains the source of truth.
   */
  if (
    attempt.expiresAt &&
    new Date() >= attempt.expiresAt
  ) {
    const expiredAttempt = await prisma.attempt.update({
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

    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Assessment time has expired. Attempt status: ${expiredAttempt.status}`,
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

  /*
   * Server-side timer validation.
   */
  if (
    attempt.expiresAt &&
    new Date() >= attempt.expiresAt
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

  /*
   * Make sure the problem belongs to
   * this assessment.
   */
  const assessmentProblem =
    await prisma.assessmentProblem.findUnique({
      where: {
        assessmentId_problemId: {
          assessmentId: attempt.assessmentId,
          problemId: payload.problemId,
        },
      },

      include: {
        problem: {
          select: {
            id: true,
            type: true,

            options: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });

  if (!assessmentProblem) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Problem does not belong to this assessment",
    );
  }

  /*
   * Only MCQ is supported.
   */
  if (assessmentProblem.problem.type !== "MCQ") {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Only MCQ questions are supported",
    );
  }

  const answer = payload.answer.trim();

  if (!answer) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Answer cannot be empty",
    );
  }

  /*
   * Answer must be a valid option ID.
   */
  const isValidOption =
    assessmentProblem.problem.options.some(
      (option) => option.id === answer,
    );

  if (!isValidOption) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Invalid option selected",
    );
  }

  /*
   * Save / update candidate answer.
   */
  const attemptAnswer =
    await prisma.attemptAnswer.upsert({
      where: {
        attemptId_problemId: {
          attemptId,
          problemId: payload.problemId,
        },
      },

      create: {
        attemptId,
        problemId: payload.problemId,
        answer,
      },

      update: {
        answer,
      },

      select: {
        id: true,
        attemptId: true,
        problemId: true,
        answer: true,
        createdAt: true,
        updatedAt: true,
      },
    });

  /*
   * Create / update submission.
   */
  const submission =
    await prisma.submission.upsert({
      where: {
        attemptId_problemId: {
          attemptId,
          problemId: payload.problemId,
        },
      },

      create: {
        attemptId,
        problemId: payload.problemId,
        answer,
        status: "PENDING",
      },

      update: {
        answer,
        status: "PENDING",
      },
    });

  /*
   * Automatically evaluate MCQ.
   */
  const evaluation =
    await evaluationService.evaluateObjectiveSubmission(
      submission.id,
    );

  return {
    attemptAnswer,
    submission: evaluation,
  };
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

  /*
   * Timer expired.
   */
  if (
    attempt.expiresAt &&
    now >= attempt.expiresAt
  ) {
    const expiredAttempt =
      await prisma.attempt.update({
        where: {
          id: attemptId,
        },

        data: {
          status: "EXPIRED",
          submittedAt: now,
        },

        select: {
          id: true,
          assessmentId: true,
          candidateId: true,
          status: true,
          startedAt: true,
          expiresAt: true,
          submittedAt: true,
        },
      });

    /*
     * Generate result even for expired attempt.
     *
     * Unanswered MCQs simply receive 0 marks.
     */
    const result =
      await resultService.generateResult(
        candidateId,
        attemptId,
      );

    return {
      attempt: expiredAttempt,
      result,
    };
  }

  /*
   * Normal submission.
   */
  const submittedAttempt =
    await prisma.attempt.update({
      where: {
        id: attemptId,
      },

      data: {
        status: "SUBMITTED",
        submittedAt: now,
      },

      select: {
        id: true,
        assessmentId: true,
        candidateId: true,
        status: true,
        startedAt: true,
        expiresAt: true,
        submittedAt: true,
      },
    });

  /*
   * Automatically generate final result.
   */
  const result =
    await resultService.generateResult(
      candidateId,
      attemptId,
    );

  return {
    attempt: submittedAttempt,
    result,
  };
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

  /*
   * Automatically expire an active attempt
   * when the server-side deadline has passed.
   */
  if (
    attempt.status === "IN_PROGRESS" &&
    attempt.expiresAt &&
    new Date() >= attempt.expiresAt
  ) {
    return prisma.attempt.update({
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

