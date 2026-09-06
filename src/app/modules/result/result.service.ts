import httpStatus from "http-status";

import { AppError } from "../../utils/AppError.js";
import { prisma } from "../../lib/prisma.js";

const PASSING_PERCENTAGE = 40;

const generateResult = async (
  candidateId: string,
  attemptId: string,
) => {
  const attempt =
    await prisma.attempt.findUnique({
      where: {
        id: attemptId,
      },

      include: {
        candidate: true,

        assessment: {
          include: {
            problems: {
              include: {
                problem: true,
              },

              orderBy: {
                order: "asc",
              },
            },
          },
        },

        submissions: {
          include: {
            evaluation: true,
          },

          orderBy: {
            createdAt: "desc",
          },
        },

        result: {
          include: {
            items: true,
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

  const pendingSubmission =
  attempt.submissions.find(
    (submission) =>
      !submission.evaluation,
  );

if (pendingSubmission) {
  throw new AppError(
    httpStatus.BAD_REQUEST,
    "All submissions must be evaluated before generating the final result",
  );
}

  if (
    attempt.candidateId !== candidateId
  ) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not allowed to access this attempt",
    );
  }

  /**
   * Result can only be generated
   * after candidate submits attempt.
   */
  if (
    attempt.status !== "SUBMITTED" &&
    attempt.status !== "EXPIRED"
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Attempt has not been submitted yet",
    );
  }

  /**
   * If result already exists,
   * return existing result.
   */
  if (attempt.result) {
    return attempt.result;
  }

  /**
   * We need the latest submission
   * for every problem.
   */
  const latestSubmissions =
    new Map<string, typeof attempt.submissions[number]>();

  for (const submission of attempt.submissions) {
    if (
      !latestSubmissions.has(
        submission.problemId,
      )
    ) {
      latestSubmissions.set(
        submission.problemId,
        submission,
      );
    }
  }

  let totalMarks = 0;
  let obtainedMarks = 0;

  const resultItems =
  attempt.assessment.problems.map(
    (assessmentProblem) => {
      const maximumMarks =
        assessmentProblem.points;

      totalMarks += maximumMarks;

      const submission =
        latestSubmissions.get(
          assessmentProblem.problemId,
        );

      const obtainedMarks =
        submission?.score ?? 0;

      return {
        problemId:
          assessmentProblem.problemId,

        maximumMarks,

        obtainedMarks:
          Math.min(
            obtainedMarks,
            maximumMarks,
          ),
      };
    },
  );

  obtainedMarks =
    resultItems.reduce(
      (total, item) =>
        total + item.obtainedMarks,
      0,
    );

  const percentage =
    totalMarks === 0
      ? 0
      : (obtainedMarks / totalMarks) * 100;

  const status =
    percentage >= PASSING_PERCENTAGE
      ? "PASS"
      : "FAIL";

  const result =
    await prisma.$transaction(
      async (tx) => {
        const createdResult =
          await tx.result.create({
            data: {
              attemptId,

              totalMarks,

              obtainedMarks,

              percentage,

              status,

              items: {
                create: resultItems,
              },
            },

            include: {
              items: true,
            },
          });

        await tx.attempt.update({
          where: {
            id: attemptId,
          },

          data: {
            score: obtainedMarks,
          },
        });

        return createdResult;
      },
    );

  return result;
};



const getMyResult = async (
  candidateId: string,
  attemptId: string,
) => {
  const result =
    await prisma.result.findUnique({
      where: {
        attemptId,
      },

      include: {
        items: {
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
        },

        attempt: {
          include: {
            assessment: {
              select: {
                id: true,
                title: true,
                duration: true,
              },
            },

            candidate: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

  if (!result) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Result not found",
    );
  }

  if (
    result.attempt.candidateId !==
    candidateId
  ) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not allowed to access this result",
    );
  }

  return result;
};


const getAssessmentResults = async (
  recruiterId: string,
  assessmentId: string,
) => {
  const assessment =
    await prisma.assessment.findUnique({
      where: {
        id: assessmentId,
      },
    });

  if (!assessment) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Assessment not found",
    );
  }

  if (
    assessment.recruiterId !==
    recruiterId
  ) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not allowed to access this assessment",
    );
  }

  return prisma.result.findMany({
    where: {
      attempt: {
        assessmentId,
      },
    },

    include: {
      attempt: {
        include: {
          candidate: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },

    orderBy: {
      obtainedMarks: "desc",
    },
  });
};


const getRecruiterResultById = async (
  recruiterId: string,
  resultId: string,
) => {
  const result =
    await prisma.result.findUnique({
      where: {
        id: resultId,
      },

      include: {
        items: {
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

            assessment: true,
          },
        },
      },
    });

  if (!result) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Result not found",
    );
  }

  if (
    result.attempt.assessment.recruiterId !==
    recruiterId
  ) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not allowed to access this result",
    );
  }

  return result;
};


const getAssessmentStatistics = async (
  recruiterId: string,
  assessmentId: string,
) => {
  const assessment =
    await prisma.assessment.findUnique({
      where: {
        id: assessmentId,
      },
    });

  if (!assessment) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Assessment not found",
    );
  }

  if (
    assessment.recruiterId !==
    recruiterId
  ) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not allowed to access this assessment",
    );
  }

  const results =
    await prisma.result.findMany({
      where: {
        attempt: {
          assessmentId,
        },
      },

      select: {
        obtainedMarks: true,
        totalMarks: true,
        percentage: true,
        status: true,
      },
    });

  const totalCandidates =
    await prisma.attempt.count({
      where: {
        assessmentId,
      },
    });

  const completedCandidates =
    results.length;

  const passed =
    results.filter(
      (result) =>
        result.status === "PASS",
    ).length;

  const failed =
    results.filter(
      (result) =>
        result.status === "FAIL",
    ).length;

  const totalScore =
    results.reduce(
      (sum, result) =>
        sum + result.obtainedMarks,
      0,
    );

  const totalPercentage =
    results.reduce(
      (sum, result) =>
        sum + result.percentage,
      0,
    );

  const highestScore =
    results.length > 0
      ? Math.max(
          ...results.map(
            (result) =>
              result.obtainedMarks,
          ),
        )
      : 0;

  const lowestScore =
    results.length > 0
      ? Math.min(
          ...results.map(
            (result) =>
              result.obtainedMarks,
          ),
        )
      : 0;

  return {
    assessmentId,

    totalCandidates,

    completedCandidates,

    passed,

    failed,

    averageScore:
      completedCandidates > 0
        ? totalScore /
          completedCandidates
        : 0,

    averagePercentage:
      completedCandidates > 0
        ? totalPercentage /
          completedCandidates
        : 0,

    highestScore,

    lowestScore,
  };
};


export const resultService = {
  generateResult,
  getMyResult,
  getAssessmentResults,
  getRecruiterResultById,
  getAssessmentStatistics,
};