// modules/candidate/candidate.service.ts

import httpStatus from "http-status";

import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";

interface CandidateQuery {
  page?: number;
  limit?: number;
  search?: string;
}

interface CandidateActivityQuery {
  page?: number;
  limit?: number;
}

const getCandidateScope = (userId: string, role: string) => {
  if (role === "ADMIN") {
    return {};
  }

  return {
    assessment: {
      recruiterId: userId,
    },
  };
};

const getCandidateListScope = (
  userId: string,
  role: string,
) => {
  if (role === "ADMIN") {
    return {};
  }

  return {
    OR: [
      {
        invitations: {
          some: {
            assessment: {
              recruiterId: userId,
            },
          },
        },
      },
      {
        attempts: {
          some: {
            assessment: {
              recruiterId: userId,
            },
          },
        },
      },
    ],
  };
};

const getCandidates = async (
  currentUserId: string,
  currentUserRole: string,
  query: CandidateQuery,
) => {
  const page = query.page ?? 1;
  const limit = query.limit ?? 10;
  const search = query.search?.trim();

  const skip = (page - 1) * limit;

  const scope = getCandidateListScope(
    currentUserId,
    currentUserRole,
  );

  const searchFilter = search
    ? {
        OR: [
          {
            name: {
              contains: search,
              mode: "insensitive" as const,
            },
          },
          {
            email: {
              contains: search,
              mode: "insensitive" as const,
            },
          },
        ],
      }
    : {};

  const where = {
    role: "CANDIDATE" as const,
    isActive: true,
    ...scope,
    ...searchFilter,
  };

  const [candidates, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    }),

    prisma.user.count({
      where,
    }),
  ]);

  return {
    candidates,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getCandidateById = async (
  candidateId: string,
  currentUserId: string,
  currentUserRole: string,
) => {
  const candidate = await prisma.user.findFirst({
    where: {
      id: candidateId,
      role: "CANDIDATE",
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,

      _count: {
        select: {
          invitations: true,
          attempts: true,
        },
      },
    },
  });

  if (!candidate) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Candidate not found",
    );
  }

  if (currentUserRole === "ADMIN") {
    return candidate;
  }

  const hasAccess = await prisma.attempt.findFirst({
    where: {
      candidateId,
      assessment: {
        recruiterId: currentUserId,
      },
    },
    select: {
      id: true,
    },
  });

  const hasInvitationAccess =
    await prisma.invitation.findFirst({
      where: {
        candidateId,
        assessment: {
          recruiterId: currentUserId,
        },
      },
      select: {
        id: true,
      },
    });

  if (!hasAccess && !hasInvitationAccess) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Candidate not found",
    );
  }

  return candidate;
};

const getCandidateActivities = async (
  candidateId: string,
  currentUserId: string,
  currentUserRole: string,
  query: CandidateActivityQuery,
) => {
  const page = query.page ?? 1;
  const limit = query.limit ?? 10;
  const skip = (page - 1) * limit;

  const candidate = await prisma.user.findFirst({
    where: {
      id: candidateId,
      role: "CANDIDATE",
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  if (!candidate) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Candidate not found",
    );
  }

  const assessmentScope =
    currentUserRole === "ADMIN"
      ? {}
      : {
          recruiterId: currentUserId,
        };

  const where = {
    candidateId,
    assessment: assessmentScope,
  };

  const [invitations, total] = await Promise.all([
    prisma.invitation.findMany({
      where,
      include: {
        assessment: {
          select: {
            id: true,
            title: true,
            duration: true,
            totalMarks: true,
            status: true,

            recruiter: {
              select: {
                id: true,
                name: true,
                email: true,

                company: {
                  select: {
                    id: true,
                    name: true,
                    logo: true,
                  },
                },
              },
            },
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

      orderBy: {
        createdAt: "desc",
      },

      skip,
      take: limit,
    }),

    prisma.invitation.count({
      where,
    }),
  ]);

  const attemptIds = invitations.map(
    (invitation) => ({
      assessmentId: invitation.assessmentId,
      candidateId: invitation.candidateId,
    }),
  );

  const attempts =
    attemptIds.length > 0
      ? await prisma.attempt.findMany({
          where: {
            OR: attemptIds,
          },

          select: {
            id: true,
            assessmentId: true,
            candidateId: true,
            status: true,
            startedAt: true,
            submittedAt: true,
            expiresAt: true,
            score: true,

            result: {
              select: {
                id: true,
                totalMarks: true,
                obtainedMarks: true,
                percentage: true,
                status: true,
              },
            },
          },
        })
      : [];

  const attemptMap = new Map(
    attempts.map((attempt) => [
      `${attempt.assessmentId}:${attempt.candidateId}`,
      attempt,
    ]),
  );

  const activities = invitations.map(
    (invitation) => {
      const attempt = attemptMap.get(
        `${invitation.assessmentId}:${invitation.candidateId}`,
      );

      return {
        assessment: invitation.assessment,

        invitation: {
          id: invitation.id,
          status: invitation.status,
          expiresAt: invitation.expiresAt,
          createdAt: invitation.createdAt,
        },

        attempt: attempt
          ? {
              id: attempt.id,
              status: attempt.status,
              startedAt: attempt.startedAt,
              submittedAt: attempt.submittedAt,
              expiresAt: attempt.expiresAt,
              score: attempt.score,
            }
          : null,

        result: attempt?.result ?? null,
      };
    },
  );

  return {
    candidate,

    activities,

    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getCandidateAssessments = async (
  candidateId: string,
  currentUserId: string,
  currentUserRole: string,
  query: CandidateActivityQuery,
) => {
  const page = query.page ?? 1;
  const limit = query.limit ?? 10;
  const skip = (page - 1) * limit;

  const candidate = await prisma.user.findFirst({
    where: {
      id: candidateId,
      role: "CANDIDATE",
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  if (!candidate) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Candidate not found",
    );
  }

  const assessmentScope =
    currentUserRole === "ADMIN"
      ? {}
      : {
          recruiterId: currentUserId,
        };

  const where = {
    candidateId,
    assessment: assessmentScope,
  };

  const [attempts, total] = await Promise.all([
    prisma.attempt.findMany({
      where,

      select: {
        id: true,
        status: true,
        startedAt: true,
        submittedAt: true,
        expiresAt: true,
        score: true,

        assessment: {
          select: {
            id: true,
            title: true,
            duration: true,
            totalMarks: true,
            status: true,

            recruiter: {
              select: {
                id: true,
                name: true,
                email: true,

                company: {
                  select: {
                    id: true,
                    name: true,
                    logo: true,
                  },
                },
              },
            },
          },
        },

        result: {
          select: {
            id: true,
            totalMarks: true,
            obtainedMarks: true,
            percentage: true,
            status: true,
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },

      skip,
      take: limit,
    }),

    prisma.attempt.count({
      where,
    }),
  ]);

  return {
    candidate,
    assessments: attempts,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const CandidateService = {
  getCandidates,
  getCandidateById,
  getCandidateActivities,
  getCandidateAssessments,
};