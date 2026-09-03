import { Router } from "express";

import { auth } from "../../middleware/auth.js";
import { validateRequest } from "../../middleware/validateRequest.js";

import { invitationController } from "./invitation.controller.js";
import {
  createInvitationSchema,
} from "./invitation.validation.js";

const router = Router();

router.post(
  "/",
  auth("RECRUITER"),
  validateRequest(createInvitationSchema),
  invitationController.createInvitation,
);

router.get(
  "/",
  auth("RECRUITER"),
  invitationController.getMyInvitations,
);

router.get(
  "/my",
  auth("CANDIDATE"),
  invitationController.getMyCandidateInvitations,
);

router.patch(
  "/:id/accept",
  auth("CANDIDATE"),
  invitationController.acceptInvitation,
);

router.patch(
  "/:id/decline",
  auth("CANDIDATE"),
  invitationController.declineInvitation,
);
export const invitationRoutes = router;