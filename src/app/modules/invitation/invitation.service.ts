import httpStatus from "http-status";

import { AppError } from "../../utils/AppError.js";
import { prisma } from "../../lib/prisma.js";
import { sendEmail } from "../../utils/sendEmail.js";
import { invitationEmailTemplate } from "../../templates/invitationEmail.js";

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
    throw new AppError(httpStatus.NOT_FOUND, "Assessment not found");
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
    throw new AppError(httpStatus.NOT_FOUND, "Candidate not found");
  }

  // 4. Candidate must have CANDIDATE role
  if (candidate.role !== "CANDIDATE") {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Selected user is not a candidate",
    );
  }

  // 5. Prevent duplicate invitation
  const existingInvitation = await prisma.invitation.findUnique({
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
  const invitation = await prisma.invitation.create({
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


  //send Elmail
  await sendEmail({
    to: invitation.candidate.email,

    subject: `Invitation: ${invitation.assessment.title}`,

    html: invitationEmailTemplate({
      candidateName: invitation.candidate.name,

      assessmentTitle: invitation.assessment.title,

      duration: invitation.assessment.duration,

      totalMarks: invitation.assessment.totalMarks,

      expiresAt: payload.expiresAt,
    }),
  });

  return invitation;
};

const getMyInvitations = async (recruiterId: string) => {
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

const getMyCandidateInvitations = async (candidateId: string) => {
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

const acceptInvitation = async (candidateId: string, invitationId: string) => {
  const invitation = await prisma.invitation.findFirst({
    where: {
      id: invitationId,
      candidateId,
    },

    include: {
      assessment: true,
    },
  });

  if (!invitation) {
    throw new AppError(httpStatus.NOT_FOUND, "Invitation not found");
  }

  if (invitation.status !== "INVITED") {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Invitation is already ${invitation.status.toLowerCase()}`,
    );
  }

  // Check expiration
  if (invitation.expiresAt && invitation.expiresAt < new Date()) {
    await prisma.invitation.update({
      where: {
        id: invitation.id,
      },
      data: {
        status: "EXPIRED",
      },
    });

    throw new AppError(httpStatus.BAD_REQUEST, "Invitation has expired");
  }

  // Assessment must still be published
  if (invitation.assessment.status !== "PUBLISHED") {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "This assessment is not currently available",
    );
  }

  const result = await prisma.$transaction(async (tx) => {
    const updatedInvitation = await tx.invitation.update({
      where: {
        id: invitation.id,
      },

      data: {
        status: "ACCEPTED",
      },
    });

    const attempt = await tx.attempt.create({
      data: {
        assessmentId: invitation.assessmentId,
        candidateId,
        status: "NOT_STARTED",
      },
    });

    return {
      invitation: updatedInvitation,
      attempt,
    };
  });

  return result;
};

const declineInvitation = async (candidateId: string, invitationId: string) => {
  const invitation = await prisma.invitation.findFirst({
    where: {
      id: invitationId,
      candidateId,
    },
  });

  if (!invitation) {
    throw new AppError(httpStatus.NOT_FOUND, "Invitation not found");
  }

  if (invitation.status !== "INVITED") {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Only pending invitations can be declined",
    );
  }

  return prisma.invitation.update({
    where: {
      id: invitationId,
    },

    data: {
      status: "DECLINED",
    },
  });
};

export const invitationService = {
  createInvitation,
  getMyInvitations,
  getMyCandidateInvitations,
  acceptInvitation,
  declineInvitation,
};
