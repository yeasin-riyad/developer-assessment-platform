import httpStatus from "http-status";
import { AppError } from "../../utils/AppError.js";
import { prisma } from "../../lib/prisma.js";


const evaluateObjectiveSubmission = async (
  submissionId: string,
) => {
  const submission =
    await prisma.submission.findUnique({
      where: {
        id: submissionId,
      },

      include: {
        problem: {
          include: {
            options: true,
          },
        },

        attempt: {
          include: {
            assessment: {
              include: {
                problems: true,
              },
            },
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

  /**
   * Only MCQ and CODING support
   * automatic evaluation.
   */
  if (
    submission.problem.type !== "MCQ" &&
    submission.problem.type !== "CODING"
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "This problem does not support automatic evaluation",
    );
  }

  /**
   * Prevent evaluating the same submission twice.
   */
  if (submission.evaluation) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Submission has already been evaluated",
    );
  }

  /**
   * Find selected option.
   */
  const selectedOption =
    submission.problem.options.find(
      (option) =>
        option.id === submission.answer,
    );

  if (!selectedOption) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Invalid option selected",
    );
  }

  /**
   * Find the problem inside the assessment.
   *
   * Important:
   *
   * Problem.points
   *      ↓
   * default/reference points
   *
   * AssessmentProblem.points
   *      ↓
   * actual marks for this assessment
   */
  const assessmentProblem =
    submission.attempt.assessment.problems.find(
      (item) =>
        item.problemId ===
        submission.problemId,
    );

  if (!assessmentProblem) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Problem does not belong to this assessment",
    );
  }

  const isCorrect =
    selectedOption.isCorrect;

  const score = isCorrect
    ? assessmentProblem.points
    : 0;

  const status = isCorrect
    ? "ACCEPTED"
    : "WRONG_ANSWER";

  /**
   * Update submission and create evaluation
   * inside one transaction.
   */
  const result =
    await prisma.$transaction(
      async (tx) => {
        const updatedSubmission =
          await tx.submission.update({
            where: {
              id: submission.id,
            },

            data: {
              score,
              status,
            },
          });

        const evaluation =
          await tx.evaluation.create({
            data: {
              submissionId:
                updatedSubmission.id,

              type: "AUTOMATIC",

              score,

              feedback: isCorrect
                ? "Correct answer"
                : "Incorrect answer",
            },
          });

        return {
          submission:
            updatedSubmission,

          evaluation,
        };
      },
    );

  return result;
};


const evaluateWritten = async (
  evaluatorId: string,
  submissionId: string,
  score: number,
  feedback?: string,
) => {
  const submission =
    await prisma.submission.findUnique({
      where: {
        id: submissionId,
      },

      include: {
        problem: true,

        attempt: {
          include: {
            assessment: {
              include: {
                problems: true,
              },
            },
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

  /**
   * Manual evaluation is only for WRITTEN.
   */
  if (submission.problem.type !== "WRITTEN") {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Only written submissions require manual evaluation",
    );
  }

  /**
   * Prevent duplicate evaluation.
   */
  if (submission.evaluation) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Submission has already been evaluated",
    );
  }

  /**
   * Find assessment-specific marks.
   */
  const assessmentProblem =
    submission.attempt.assessment.problems.find(
      (item) =>
        item.problemId ===
        submission.problemId,
    );

  if (!assessmentProblem) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Problem does not belong to this assessment",
    );
  }

  /**
   * Evaluator cannot give more marks
   * than the problem is worth.
   */
  if (score > assessmentProblem.points) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Score cannot exceed ${assessmentProblem.points}`,
    );
  }

  const result =
    await prisma.$transaction(
      async (tx) => {
        const updatedSubmission =
          await tx.submission.update({
            where: {
              id: submission.id,
            },

            data: {
              score,
              status: "EVALUATED",
            },
          });

        const evaluation =
          await tx.evaluation.create({
            data: {
              submissionId:
                updatedSubmission.id,

              type: "MANUAL",

              score,

              feedback,

              evaluatorId,
            },
          });

        return {
          submission:
            updatedSubmission,

          evaluation,
        };
      },
    );

  return result;
};

const getPendingEvaluations = async () => {
  return prisma.submission.findMany({
    where: {
      status: "PENDING",

      problem: {
        type: "WRITTEN",
      },
    },

    include: {
      problem: {
        select: {
          id: true,
          title: true,
          description: true,
          type: true,
          points: true,
        },
      },

      attempt: {
        include: {
          candidate: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },

          assessment: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      },
    },

    orderBy: {
      submittedAt: "asc",
    },
  });
};

const getEvaluationBySubmissionId = async (
  submissionId: string,
) => {
  const evaluation =
    await prisma.evaluation.findUnique({
      where: {
        submissionId,
      },

      include: {
        submission: {
          include: {
            problem: {
              select: {
                id: true,
                title: true,
                description: true,
                type: true,
              },
            },

            attempt: {
              include: {
                candidate: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },

                assessment: {
                  select: {
                    id: true,
                    title: true,
                  },
                },
              },
            },
          },
        },

        evaluator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

  if (!evaluation) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Evaluation not found",
    );
  }

  return evaluation;
};

const getSubmissionForEvaluation = async (
  submissionId: string,
) => {
  const submission =
    await prisma.submission.findUnique({
      where: {
        id: submissionId,
      },

      include: {
        problem: {
          select: {
            id: true,
            title: true,
            description: true,
            type: true,
            points: true,
          },
        },

        attempt: {
          include: {
            candidate: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },

            assessment: {
              include: {
                problems: true,
              },
            },
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

  const assessmentProblem =
    submission.attempt.assessment.problems.find(
      (item) =>
        item.problemId ===
        submission.problemId,
    );

  return {
    submission: {
      id: submission.id,
      answer: submission.answer,
      status: submission.status,
      score: submission.score,
      submittedAt:
        submission.submittedAt,
    },

    problem: submission.problem,

    candidate:
      submission.attempt.candidate,

    assessment:
      submission.attempt.assessment,

    maximumMarks:
      assessmentProblem?.points ?? 0,

    evaluation:
      submission.evaluation,
  };
};

export const evaluationService = {
  evaluateObjectiveSubmission,
  evaluateWritten,
  getPendingEvaluations,
  getSubmissionForEvaluation,
  getEvaluationBySubmissionId,
};