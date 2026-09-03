import httpStatus from "http-status";

import { AppError } from "../../utils/AppError.js";
import { prisma } from "../../lib/prisma.js";

const createInvitation = async (
  recruiterId: string,
  payload: {
    assessmentId: string;
    candidateId: string;
    expiresAt?: Date;
  },
) => {
  // 1. Check assessment
  const assessment = await prisma.assessment.findFirst({
    where: {
      id: payload.assessmentId,
      recruiterId,
    },
  });

  if (!assessment) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Assessment not found",
    );
  }

  // 2. Assessment must be published
  if (assessment.status !== "PUBLISHED") {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Only published assessments can be sent to candidates",
    );
  }

  // 3. Check candidate
  const candidate = await prisma.user.findUnique({
    where: {
      id: payload.candidateId,
    },
  });

  if (!candidate) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Candidate not found",
    );
  }

  // 4. Candidate must have CANDIDATE role
  if (candidate.role !== "CANDIDATE") {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Selected user is not a candidate",
    );
  }

  // 5. Prevent duplicate invitation
  const existingInvitation =
    await prisma.invitation.findUnique({
      where: {
        assessmentId_candidateId: {
          assessmentId: payload.assessmentId,
          candidateId: payload.candidateId,
        },
      },
    });

  if (existingInvitation) {
    throw new AppError(
      httpStatus.CONFLICT,
      "Candidate has already been invited to this assessment",
    );
  }

  // 6. Create invitation
  return prisma.invitation.create({
    data: {
      assessmentId: payload.assessmentId,
      candidateId: payload.candidateId,
      expiresAt: payload.expiresAt,
    },

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
          duration: true,
          totalMarks: true,
          status: true,
        },
      },
    },
  });
};

const getMyInvitations = async (
  recruiterId: string,
) => {
  return prisma.invitation.findMany({
    where: {
      assessment: {
        recruiterId,
      },
    },

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
          duration: true,
          totalMarks: true,
          status: true,
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });
};


const getMyCandidateInvitations = async (
  candidateId: string,
) => {
  return prisma.invitation.findMany({
    where: {
      candidateId,
    },

    include: {
      assessment: {
        select: {
          id: true,
          title: true,
          description: true,
          duration: true,
          totalMarks: true,
          status: true,
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });
};