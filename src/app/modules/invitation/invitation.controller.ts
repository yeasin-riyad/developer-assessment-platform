import httpStatus from "http-status";

import { catchAsync } from "../../utils/catchAsync.js";
import { invitationService } from "./invitation.service.js";

const createInvitation = catchAsync(async (req, res) => {
  const invitation =
    await invitationService.createInvitation(
      req.user!.userId,
      req.body,
    );

  res.status(httpStatus.CREATED).json({
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Invitation created successfully",
    data: invitation,
  });
});

const getMyInvitations = catchAsync(async (req, res) => {
  const invitations =
    await invitationService.getMyInvitations(
      req.user!.userId,
    );

  res.status(httpStatus.OK).json({
    success: true,
    statusCode: httpStatus.OK,
    message: "Invitations retrieved successfully",
    data: invitations,
  });
});

const getMyCandidateInvitations = catchAsync(
  async (req, res) => {
    const invitations =
      await invitationService.getMyCandidateInvitations(
        req.user!.userId,
      );

    res.status(httpStatus.OK).json({
      success: true,
      statusCode: httpStatus.OK,
      message: "Invitations retrieved successfully",
      data: invitations,
    });
  },
);

const acceptInvitation = catchAsync(async (req, res) => {
  const result =
    await invitationService.acceptInvitation(
      req.user!.userId,
      req.params.id as string,
    );

  res.status(httpStatus.OK).json({
    success: true,
    statusCode: httpStatus.OK,
    message: "Invitation accepted successfully",
    data: result,
  });
});

const declineInvitation = catchAsync(async (req, res) => {
  const invitation =
    await invitationService.declineInvitation(
      req.user!.userId,
      req.params.id as string,
    );

  res.status(httpStatus.OK).json({
    success: true,
    statusCode: httpStatus.OK,
    message: "Invitation declined successfully",
    data: invitation,
  });
});

export const invitationController = {
  createInvitation,
  getMyInvitations,
  getMyCandidateInvitations,
  acceptInvitation,
  declineInvitation,
};