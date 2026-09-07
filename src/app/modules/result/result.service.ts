import httpStatus from "http-status";

import { AppError } from "../../utils/AppError.js";
import { prisma } from "../../lib/prisma.js";

const PASSING_PERCENTAGE = 40;

const generateResult = async (
  candidateId: string,
  attemptId: string,
) => {
  // 1. Find attempt
  const attempt = await prisma.attempt.findUnique({
    where: {
      id: attemptId,
    },
    include: {
      assessment: {
        include: {
          problems: {
            orderBy: {
              order: "asc",
            },
          },
        },
      },

      submissions: {
        orderBy: [
          {
            createdAt: "desc",
          },
          {
            id: "desc",
          },
        ],
        include: {
          evaluation: true,
        },
      },

      result: true,
    },
  });

  // 2. Attempt exists?
  if (!attempt) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Attempt not found",
    );
  }

  // 3. Check candidate ownership
  if (attempt.candidateId !== candidateId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not allowed to generate result for this attempt",
    );
  }

  // 4. Prevent result generation before submission
  if (
    attempt.status !== "SUBMITTED" &&
    attempt.status !== "EXPIRED"
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Result can only be generated after the attempt is submitted or expired",
    );
  }

  // 5. If result already exists, return it
  if (attempt.result) {
    return await prisma.result.findUnique({
      where: {
        id: attempt.result.id,
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
          select: {
            id: true,
            status: true,
            submittedAt: true,
            candidateId: true,

            assessment: {
              select: {
                id: true,
                title: true,
                duration: true,
              },
            },
          },
        },
      },
    });
  }

  // 6. Make sure every submission has been evaluated
  //
  // This is especially important for WRITTEN questions,
  // because they require manual evaluation.
  const pendingSubmission = attempt.submissions.find(
    (submission) => !submission.evaluation,
  );

  if (pendingSubmission) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "All submissions must be evaluated before generating the final result",
    );
  }

  // 7. Select latest submission for each problem
  //
  // submissions are already ordered:
  // createdAt DESC, id DESC
  //
  // Therefore, the first submission we encounter
  // for a problem is its latest submission.
  const latestSubmissions = new Map<
    string,
    (typeof attempt.submissions)[number]
  >();

  for (const submission of attempt.submissions) {
    if (!latestSubmissions.has(submission.problemId)) {
      latestSubmissions.set(
        submission.problemId,
        submission,
      );
    }
  }

  // 8. Calculate result items
  let totalMarks = 0;
  let obtainedMarks = 0;

  const resultItems =
    attempt.assessment.problems.map(
      (assessmentProblem) => {
        // Assessment-specific marks
        const maximumMarks =
          assessmentProblem.points;

        totalMarks += maximumMarks;

        // Get latest submission for this problem
        const submission =
          latestSubmissions.get(
            assessmentProblem.problemId,
          );

        // If candidate did not submit this problem,
        // score will be 0.
        const submissionScore =
          submission?.score ?? 0;

        // Never allow score > maximum marks
        const problemObtainedMarks =
          Math.min(
            Math.max(submissionScore, 0),
            maximumMarks,
          );

        obtainedMarks +=
          problemObtainedMarks;

        return {
          problemId:
            assessmentProblem.problemId,

          maximumMarks,

          obtainedMarks:
            problemObtainedMarks,
        };
      },
    );

  // 9. Calculate percentage
  const percentage =
    totalMarks === 0
      ? 0
      : Number(
          (
            (obtainedMarks / totalMarks) *
            100
          ).toFixed(2),
        );

  // 10. Determine PASS / FAIL
  const status =
    percentage >= PASSING_PERCENTAGE
      ? "PASS"
      : "FAIL";

  // 11. Create Result + ResultItems + update Attempt
  //
  // Everything happens inside one transaction.
  const result = await prisma.$transaction(
    async (tx) => {
      // Double-check inside transaction.
      //
      // This protects against two requests trying to
      // generate the same result at almost the same time.
      const existingResult =
        await tx.result.findUnique({
          where: {
            attemptId,
          },
        });

      if (existingResult) {
        return await tx.result.findUnique({
          where: {
            id: existingResult.id,
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
              select: {
                id: true,
                status: true,
                submittedAt: true,
                candidateId: true,

                assessment: {
                  select: {
                    id: true,
                    title: true,
                    duration: true,
                  },
                },
              },
            },
          },
        });
      }

      // Create final result
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
              select: {
                id: true,
                status: true,
                submittedAt: true,
                candidateId: true,

                assessment: {
                  select: {
                    id: true,
                    title: true,
                    duration: true,
                  },
                },
              },
            },
          },
        });

      // Update Attempt.score
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
  const result = await prisma.result.findUnique({
    where: {
      attemptId,
    },

    include: {
      items: {
        orderBy: {
          createdAt: "asc",
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
        },
      },

      attempt: {
        select: {
          id: true,
          candidateId: true,
          status: true,
          startedAt: true,
          submittedAt: true,

          assessment: {
            select: {
              id: true,
              title: true,
              description: true,
              duration: true,
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

  // Make sure this result belongs to the logged-in candidate
  if (result.attempt.candidateId !== candidateId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not allowed to view this result",
    );
  }

  return result;
};


const getAssessmentResults = async (
  recruiterId: string,
  assessmentId: string,
  status?: "PASS" | "FAIL",
) => {
  // 1. Verify assessment ownership
  const assessment =
    await prisma.assessment.findUnique({
      where: {
        id: assessmentId,
      },

      select: {
        id: true,
        title: true,
        recruiterId: true,
      },
    });

  if (!assessment) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Assessment not found",
    );
  }

  if (assessment.recruiterId !== recruiterId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not allowed to view results for this assessment",
    );
  }

  // 2. Build result filter
  const results = await prisma.result.findMany({
    where: {
      status,

      attempt: {
        assessmentId,
      },
    },

    orderBy: [
      {
        obtainedMarks: "desc",
      },
      {
        percentage: "desc",
      },
      {
        createdAt: "asc",
      },
    ],

    include: {
      items: {
        orderBy: {
          createdAt: "asc",
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
        },
      },

      attempt: {
        select: {
          id: true,
          status: true,
          startedAt: true,
          submittedAt: true,

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

  return {
    assessment: {
      id: assessment.id,
      title: assessment.title,
    },

    totalResults: results.length,

    results,
  };
};


const getRecruiterResultById = async (
  recruiterId: string,
  resultId: string,
) => {
  const result = await prisma.result.findUnique({
    where: {
      id: resultId,
    },

    include: {
      items: {
        orderBy: {
          createdAt: "asc",
        },

        include: {
          problem: {
            select: {
              id: true,
              title: true,
              description: true,
              type: true,
              difficulty: true,
            },
          },
        },
      },

      attempt: {
        select: {
          id: true,
          candidateId: true,
          status: true,
          startedAt: true,
          expiresAt: true,
          submittedAt: true,

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
              description: true,
              duration: true,
              recruiterId: true,
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

  // Verify recruiter owns this assessment
  if (
    result.attempt.assessment.recruiterId !==
    recruiterId
  ) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not allowed to view this result",
    );
  }

  return result;
};


const getAssessmentStatistics = async (
  recruiterId: string,
  assessmentId: string,
) => {
  // 1. Verify assessment ownership
  const assessment =
    await prisma.assessment.findUnique({
      where: {
        id: assessmentId,
      },

      select: {
        id: true,
        title: true,
        recruiterId: true,
      },
    });

  if (!assessment) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Assessment not found",
    );
  }

  if (assessment.recruiterId !== recruiterId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not allowed to view statistics for this assessment",
    );
  }

  // 2. Get all attempts
  const totalCandidates =
    await prisma.attempt.count({
      where: {
        assessmentId,
      },
    });

  // 3. Get completed results
  const results = await prisma.result.findMany({
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

  const completedCandidates =
    results.length;

  // 4. Passed / failed
  const passedCandidates =
    results.filter(
      (result) => result.status === "PASS",
    ).length;

  const failedCandidates =
    results.filter(
      (result) => result.status === "FAIL",
    ).length;

  // 5. Calculate average score
  const totalObtainedMarks =
    results.reduce(
      (sum, result) =>
        sum + result.obtainedMarks,
      0,
    );

  const totalPercentages =
    results.reduce(
      (sum, result) =>
        sum + result.percentage,
      0,
    );

  const averageScore =
    completedCandidates === 0
      ? 0
      : Number(
          (
            totalObtainedMarks /
            completedCandidates
          ).toFixed(2),
        );

  const averagePercentage =
    completedCandidates === 0
      ? 0
      : Number(
          (
            totalPercentages /
            completedCandidates
          ).toFixed(2),
        );

  // 6. Highest / lowest score
  const scores = results.map(
    (result) => result.obtainedMarks,
  );

  const highestScore =
    scores.length > 0
      ? Math.max(...scores)
      : 0;

  const lowestScore =
    scores.length > 0
      ? Math.min(...scores)
      : 0;

  // 7. Pass percentage
  const passPercentage =
    completedCandidates === 0
      ? 0
      : Number(
          (
            (passedCandidates /
              completedCandidates) *
            100
          ).toFixed(2),
        );

  return {
    assessment: {
      id: assessment.id,
      title: assessment.title,
    },

    statistics: {
      totalCandidates,

      completedCandidates,

      pendingCandidates:
        totalCandidates -
        completedCandidates,

      passedCandidates,

      failedCandidates,

      passPercentage,

      averageScore,

      averagePercentage,

      highestScore,

      lowestScore,
    },
  };
};


export const resultService = {
  generateResult,
  getMyResult,
  getAssessmentResults,
  getRecruiterResultById,
  getAssessmentStatistics,
};