import httpStatus from "http-status";

import { AppError } from "../../utils/AppError.js";
import { prisma } from "../../lib/prisma.js";
import { evaluationService } from "../evaluation/evaluation.service.js";



const createSubmission = async (
  candidateId: string,
  attemptId: string,
  problemId: string,
  answer: string,
) => {
  const attempt =
    await prisma.attempt.findUnique({
      where: {
        id: attemptId,
      },

      include: {
        assessment: true,
      },
    });

  if (!attempt) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Attempt not found",
    );
  }

  if (
    attempt.candidateId !==
    candidateId
  ) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not allowed to submit for this attempt",
    );
  }

  if (
    attempt.status !==
    "IN_PROGRESS"
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Attempt is not active",
    );
  }

  if (
    attempt.expiresAt &&
    new Date() >
      attempt.expiresAt
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Attempt has expired",
    );
  }

  const problem =
    await prisma.problem.findUnique({
      where: {
        id: problemId,
      },

      include: {
        options: true,
      },
    });

  if (!problem) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Problem not found",
    );
  }

  /**
   * Verify that this problem
   * belongs to the assessment.
   */
  const assessmentProblem =
    await prisma.assessmentProblem.findUnique(
      {
        where: {
          assessmentId_problemId: {
            assessmentId:
              attempt.assessmentId,

            problemId,
          },
        },
      },
    );

  if (!assessmentProblem) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Problem does not belong to this assessment",
    );
  }

  /**
   * Create submission.
   */
  const submission =
    await prisma.submission.create({
      data: {
        attemptId,
        problemId,
        answer,
        status: "PENDING",
      },
    });

  /**
   * Objective questions:
   * evaluate immediately.
   */
  if (
    problem.type === "MCQ" ||
    problem.type === "CODING"
  ) {
    return evaluationService
      .evaluateObjectiveSubmission(
        submission.id,
      );
  }

  /**
   * Written questions remain
   * PENDING for evaluator.
   */
  return submission;
};

const getMySubmissions = async (
  candidateId: string,
) => {
  return prisma.submission.findMany({
    where: {
      attempt: {
        candidateId,
      },
    },

    include: {
      problem: {
        select: {
          id: true,
          title: true,
          type: true,
          difficulty: true,
        },
      },

      evaluation: true,
    },

    orderBy: {
      submittedAt: "desc",
    },
  });
};

const getSubmissionById = async (
  candidateId: string,
  submissionId: string,
) => {
  const submission =
    await prisma.submission.findFirst({
      where: {
        id: submissionId,
        attempt: {
          candidateId,
        },
      },

      include: {
        problem: {
          select: {
            id: true,
            title: true,
            type: true,
            difficulty: true,
          },
        },

        evaluation: true,
      },
    });

  if (!submission) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Submission not found",
    );
  }

  return submission;
};

export const submissionService = {
  createSubmission,
  getMySubmissions,
  getSubmissionById,
};