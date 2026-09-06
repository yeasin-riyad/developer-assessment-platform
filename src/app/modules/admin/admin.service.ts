import httpStatus from "http-status";

import { AppError } from "../../utils/AppError.js";
import { AssessmentStatus, CompanyStatus, Difficulty, ProblemType, UserRole } from "../../../generated/prisma/enums.js";
import { prisma } from "../../lib/prisma.js";

const getAllUsers = async (
  query: {
    role?: UserRole;
    isActive?: boolean;
    search?: string;
  } = {},
) => {
  const { role, isActive, search } = query;

  const users = await prisma.user.findMany({
    where: {
      ...(role && {
        role,
      }),

      ...(isActive !== undefined && {
        isActive,
      }),

      ...(search && {
        OR: [
          {
            name: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            email: {
              contains: search,
              mode: "insensitive",
            },
          },
        ],
      }),
    },

    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,

      company: {
        select: {
          id: true,
          name: true,
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  return users;
};

const getUserById = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },

    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,

      company: {
        select: {
          id: true,
          name: true,
          description: true,
          website: true,
          logo: true,
        },
      },

      _count: {
        select: {
          problems: true,
          assessments: true,
          invitations: true,
          attempts: true,
          evaluations: true,
        },
      },
    },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  return user;
};

const updateUserRole = async (
  adminId: string,
  userId: string,
  role: UserRole,
) => {
  // Prevent admin from changing their own role
  if (adminId === userId) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You cannot change your own role",
    );
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },

    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
    },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  const updatedUser = await prisma.user.update({
    where: {
      id: userId,
    },

    data: {
      role,
    },

    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      updatedAt: true,
    },
  });

  return updatedUser;
};

const updateUserStatus = async (
  adminId: string,
  userId: string,
  isActive: boolean,
) => {
  if (adminId === userId) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You cannot change your own account status",
    );
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },

    select: {
      id: true,
      name: true,
      email: true,
      isActive: true,
    },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  const updatedUser = await prisma.user.update({
    where: {
      id: userId,
    },

    data: {
      isActive,
    },

    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      updatedAt: true,
    },
  });

  return updatedUser;
};

const deleteUser = async (adminId: string, userId: string) => {
  if (adminId === userId) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You cannot delete your own account",
    );
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },

    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  await prisma.user.delete({
    where: {
      id: userId,
    },
  });

  return null;
};

const getAllCompanies = async (
  query: {
    status?: CompanyStatus;
    search?: string;
  } = {},
) => {
  const { status, search } = query;

  const companies = await prisma.company.findMany({
    where: {
      ...(status && {
        status,
      }),

      ...(search && {
        OR: [
          {
            name: {
              contains: search,
              mode: "insensitive",
            },
          },

          {
            description: {
              contains: search,
              mode: "insensitive",
            },
          },
        ],
      }),
    },

    select: {
      id: true,
      name: true,
      description: true,
      website: true,
      logo: true,
      status: true,

      recruiter: {
        select: {
          id: true,
          name: true,
          email: true,
          isActive: true,
        },
      },

      createdAt: true,
      updatedAt: true,
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  return companies;
};

const getCompanyById = async (companyId: string) => {
  const company = await prisma.company.findUnique({
    where: {
      id: companyId,
    },

    select: {
      id: true,
      name: true,
      description: true,
      website: true,
      logo: true,
      status: true,

      recruiter: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
        },
      },

      createdAt: true,
      updatedAt: true,
    },
  });

  if (!company) {
    throw new AppError(httpStatus.NOT_FOUND, "Company not found");
  }

  return company;
};

const updateCompanyStatus = async (
  companyId: string,
  status: CompanyStatus,
) => {
  const company = await prisma.company.findUnique({
    where: {
      id: companyId,
    },

    select: {
      id: true,
      name: true,
      status: true,
    },
  });

  if (!company) {
    throw new AppError(httpStatus.NOT_FOUND, "Company not found");
  }

  const updatedCompany = await prisma.company.update({
    where: {
      id: companyId,
    },

    data: {
      status,
    },

    select: {
      id: true,
      name: true,
      description: true,
      website: true,
      logo: true,
      status: true,

      recruiter: {
        select: {
          id: true,
          name: true,
          email: true,
          isActive: true,
        },
      },

      updatedAt: true,
    },
  });

  return updatedCompany;
};


const deleteCompany = async (
  companyId: string,
) => {
  const company =
    await prisma.company.findUnique({
      where: {
        id: companyId,
      },

      select: {
        id: true,
        name: true,
      },
    });

  if (!company) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Company not found",
    );
  }

  await prisma.company.delete({
    where: {
      id: companyId,
    },
  });

  return null;
};


const getAllProblems = async (
  query: {
    type?: ProblemType;
    difficulty?: Difficulty;
    search?: string;
  } = {},
) => {
  const {
    type,
    difficulty,
    search,
  } = query;

  const problems =
    await prisma.problem.findMany({
      where: {
        ...(type && {
          type,
        }),

        ...(difficulty && {
          difficulty,
        }),

        ...(search && {
          OR: [
            {
              title: {
                contains: search,
                mode: "insensitive",
              },
            },

            {
              description: {
                contains: search,
                mode: "insensitive",
              },
            },
          ],
        }),
      },

      select: {
        id: true,
        title: true,
        description: true,
        type: true,
        difficulty: true,
        points: true,

        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },

        _count: {
          select: {
            options: true,
            testCases: true,
            assessmentProblems: true,
            submissions: true,
          },
        },

        createdAt: true,
        updatedAt: true,
      },

      orderBy: {
        createdAt: "desc",
      },
    });

  return problems;
};

const getProblemById = async (
  problemId: string,
) => {
  const problem =
    await prisma.problem.findUnique({
      where: {
        id: problemId,
      },

      select: {
        id: true,
        title: true,
        description: true,
        type: true,
        difficulty: true,
        points: true,

        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true,
          },
        },

        options: {
          select: {
            id: true,
            text: true,
            isCorrect: true,
          },

          orderBy: {
            createdAt: "asc",
          },
        },

        testCases: {
          select: {
            id: true,
            input: true,
            expectedOutput: true,
            isHidden: true,
            createdAt: true,
          },

          orderBy: {
            createdAt: "asc",
          },
        },

        assessmentProblems: {
          select: {
            id: true,
            order: true,
            points: true,

            assessment: {
              select: {
                id: true,
                title: true,
                status: true,
              },
            },
          },

          orderBy: {
            createdAt: "desc",
          },
        },

        _count: {
          select: {
            submissions: true,
            attemptAnswers: true,
          },
        },

        createdAt: true,
        updatedAt: true,
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

const deleteProblem = async (
  problemId: string,
) => {
  const problem =
    await prisma.problem.findUnique({
      where: {
        id: problemId,
      },

      select: {
        id: true,
        title: true,

        _count: {
          select: {
            assessmentProblems: true,
            submissions: true,
            attemptAnswers: true,
            resultItems: true,
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

  // Problem is already used in assessments
  if (
    problem._count.assessmentProblems > 0
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Cannot delete a problem that is already used in an assessment",
    );
  }

  // Problem already has submissions
  if (
    problem._count.submissions > 0
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Cannot delete a problem that already has submissions",
    );
  }

  // Problem already has candidate answers
  if (
    problem._count.attemptAnswers > 0
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Cannot delete a problem that already has candidate answers",
    );
  }

  // Problem is referenced by result
  if (
    problem._count.resultItems > 0
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Cannot delete a problem that is already included in results",
    );
  }

  await prisma.problem.delete({
    where: {
      id: problemId,
    },
  });

  return null;
};


const getAllAssessments = async (
  query: {
    status?: AssessmentStatus;
    search?: string;
  } = {},
) => {
  const {
    status,
    search,
  } = query;

  const assessments =
    await prisma.assessment.findMany({
      where: {
        ...(status && {
          status,
        }),

        ...(search && {
          OR: [
            {
              title: {
                contains: search,
                mode: "insensitive",
              },
            },

            {
              description: {
                contains: search,
                mode: "insensitive",
              },
            },
          ],
        }),
      },

      select: {
        id: true,
        title: true,
        description: true,
        duration: true,
        totalMarks: true,
        status: true,

        recruiter: {
          select: {
            id: true,
            name: true,
            email: true,
            isActive: true,
          },
        },

        _count: {
          select: {
            problems: true,
            invitations: true,
            attempts: true,
          },
        },

        createdAt: true,
        updatedAt: true,
      },

      orderBy: {
        createdAt: "desc",
      },
    });

  return assessments;
};


const getAssessmentById = async (
  assessmentId: string,
) => {
  const assessment =
    await prisma.assessment.findUnique({
      where: {
        id: assessmentId,
      },

      select: {
        id: true,
        title: true,
        description: true,
        duration: true,
        totalMarks: true,
        status: true,

        recruiter: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true,
          },
        },

        problems: {
          orderBy: {
            order: "asc",
          },

          select: {
            id: true,
            order: true,
            points: true,

            problem: {
              select: {
                id: true,
                title: true,
                type: true,
                difficulty: true,
                points: true,
              },
            },
          },
        },

        invitations: {
          orderBy: {
            createdAt: "desc",
          },

          select: {
            id: true,
            status: true,
            expiresAt: true,
            createdAt: true,

            candidate: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },

        attempts: {
          orderBy: {
                createdAt: "desc",
          },

          select: {
            id: true,
            status: true,
            startedAt: true,
            expiresAt: true,
            submittedAt: true,
            score: true,

            candidate: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },

            result: {
              select: {
                id: true,
                obtainedMarks: true,
                totalMarks: true,
                percentage: true,
                status: true,
              },
            },
          },
        },

        _count: {
          select: {
            problems: true,
            invitations: true,
            attempts: true,
          },
        },

        createdAt: true,
        updatedAt: true,
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


const closeAssessment = async (
  assessmentId: string,
) => {
  const assessment =
    await prisma.assessment.findUnique({
      where: {
        id: assessmentId,
      },

      select: {
        id: true,
        title: true,
        status: true,
      },
    });

  if (!assessment) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Assessment not found",
    );
  }

  if (assessment.status === "CLOSED") {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Assessment is already closed",
    );
  }

  if (assessment.status === "DRAFT") {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Draft assessment cannot be closed",
    );
  }

  const updatedAssessment =
    await prisma.assessment.update({
      where: {
        id: assessmentId,
      },

      data: {
        status: "CLOSED",
      },

      select: {
        id: true,
        title: true,
        description: true,
        duration: true,
        totalMarks: true,
        status: true,

        recruiter: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },

        updatedAt: true,
      },
    });

  return updatedAssessment;
};


const getPlatformStatistics = async () => {
  const [
    totalUsers,
    candidates,
    recruiters,
    creators,
    evaluators,
    admins,

    totalCompanies,
    activeCompanies,
    suspendedCompanies,

    totalProblems,
    codingProblems,
    mcqProblems,
    writtenProblems,

    totalAssessments,
    draftAssessments,
    publishedAssessments,
    activeAssessments,
    closedAssessments,

    totalInvitations,
    totalAttempts,
    totalSubmissions,
    totalEvaluations,

    totalResults,
    passedResults,
    failedResults,
  ] = await Promise.all([
    // ===========================
    // Users
    // ===========================

    prisma.user.count(),

    prisma.user.count({
      where: {
        role: "CANDIDATE",
      },
    }),

    prisma.user.count({
      where: {
        role: "RECRUITER",
      },
    }),

    prisma.user.count({
      where: {
        role: "CREATOR",
      },
    }),

    prisma.user.count({
      where: {
        role: "EVALUATOR",
      },
    }),

    prisma.user.count({
      where: {
        role: "ADMIN",
      },
    }),

    // ===========================
    // Companies
    // ===========================

    prisma.company.count(),

    prisma.company.count({
      where: {
        status: "ACTIVE",
      },
    }),

    prisma.company.count({
      where: {
        status: "SUSPENDED",
      },
    }),

    // ===========================
    // Problems
    // ===========================

    prisma.problem.count(),

    prisma.problem.count({
      where: {
        type: "CODING",
      },
    }),

    prisma.problem.count({
      where: {
        type: "MCQ",
      },
    }),

    prisma.problem.count({
      where: {
        type: "WRITTEN",
      },
    }),

    // ===========================
    // Assessments
    // ===========================

    prisma.assessment.count(),

    prisma.assessment.count({
      where: {
        status: "DRAFT",
      },
    }),

    prisma.assessment.count({
      where: {
        status: "PUBLISHED",
      },
    }),

    prisma.assessment.count({
      where: {
        status: "ACTIVE",
      },
    }),

    prisma.assessment.count({
      where: {
        status: "CLOSED",
      },
    }),

    // ===========================
    // Activity
    // ===========================

    prisma.invitation.count(),

    prisma.attempt.count(),

    prisma.submission.count(),

    prisma.evaluation.count(),

    // ===========================
    // Results
    // ===========================

    prisma.result.count(),

    prisma.result.count({
      where: {
        status: "PASS",
      },
    }),

    prisma.result.count({
      where: {
        status: "FAIL",
      },
    }),
  ]);

  return {
    users: {
      total: totalUsers,

      candidates,
      recruiters,
      creators,
      evaluators,
      admins,
    },

    companies: {
      total: totalCompanies,
      active: activeCompanies,
      suspended: suspendedCompanies,
    },

    problems: {
      total: totalProblems,

      coding: codingProblems,
      mcq: mcqProblems,
      written: writtenProblems,
    },

    assessments: {
      total: totalAssessments,

      draft: draftAssessments,
      published: publishedAssessments,
      active: activeAssessments,
      closed: closedAssessments,
    },

    activity: {
      totalInvitations,
      totalAttempts,
      totalSubmissions,
      totalEvaluations,
    },

    results: {
      total: totalResults,
      passed: passedResults,
      failed: failedResults,
    },
  };
};


export const adminService = {
  // User Management
  getAllUsers,
  getUserById,
  updateUserRole,
  updateUserStatus,
  deleteUser,

  // Company Management
  getAllCompanies,
  getCompanyById,
  updateCompanyStatus,
  deleteCompany,

  // Problem Management
  getAllProblems,
  getProblemById,
  deleteProblem,

  // Assessment Management
  getAllAssessments,
  getAssessmentById,
  closeAssessment,

  // Platform Statistics
  getPlatformStatistics,
};
