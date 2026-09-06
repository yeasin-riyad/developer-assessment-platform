import { Router } from "express";

import { auth } from "../../middleware/auth.js";

import { validateRequest } from "../../middleware/validateRequest.js";

import { invitationController } from "./invitation.controller.js";

import { createInvitationSchema } from "./invitation.validation.js";

const router = Router();

/**
 * @swagger
 * /api/v1/invitations:
 *   post:
 *     summary: Create an assessment invitation
 *     description: Send an assessment invitation to a candidate.
 *     tags:
 *       - Invitation
 *
 *     security:
 *       - bearerAuth: []
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - assessmentId
 *               - candidateId
 *             properties:
 *               assessmentId:
 *                 type: string
 *                 format: uuid
 *                 example: 550e8400-e29b-41d4-a716-446655440000
 *               candidateId:
 *                 type: string
 *                 format: uuid
 *                 example: 6ba7b810-9dad-11d1-80b4-00c04fd430c8
 *               expiresAt:
 *                 type: string
 *                 format: date-time
 *                 example: 2026-12-31T23:59:59.000Z
 *
 *     responses:
 *       201:
 *         description: Invitation created successfully
 *
 *       400:
 *         description: Invalid request data
 *
 *       401:
 *         description: Unauthorized
 *
 *       403:
 *         description: Forbidden - only recruiters can create invitations
 *
 *       404:
 *         description: Assessment or candidate not found
 */
router.post(
  "/",
  auth("RECRUITER"),
  validateRequest(createInvitationSchema),
  invitationController.createInvitation,
);


/**
 * @swagger
 * /api/v1/invitations:
 *   get:
 *     summary: Get my invitations
 *     description: Retrieve all assessment invitations created by the authenticated recruiter.
 *     tags:
 *       - Invitation
 *
 *     security:
 *       - bearerAuth: []
 *
 *     responses:
 *       200:
 *         description: Invitations retrieved successfully
 *
 *       401:
 *         description: Unauthorized
 *
 *       403:
 *         description: Forbidden - only recruiters can access their invitations
 */
router.get(
  "/",
  auth("RECRUITER"),
  invitationController.getMyInvitations,
);


/**
 * @swagger
 * /api/v1/invitations/my:
 *   get:
 *     summary: Get my candidate invitations
 *     description: Retrieve all assessment invitations received by the authenticated candidate.
 *     tags:
 *       - Invitation
 *
 *     security:
 *       - bearerAuth: []
 *
 *     responses:
 *       200:
 *         description: Candidate invitations retrieved successfully
 *
 *       401:
 *         description: Unauthorized
 *
 *       403:
 *         description: Forbidden - only candidates can access their invitations
 */
router.get(
  "/my",
  auth("CANDIDATE"),
  invitationController.getMyCandidateInvitations,
);


/**
 * @swagger
 * /api/v1/invitations/{id}/accept:
 *   patch:
 *     summary: Accept an invitation
 *     description: Accept an assessment invitation received by the authenticated candidate.
 *     tags:
 *       - Invitation
 *
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Invitation ID
 *
 *     responses:
 *       200:
 *         description: Invitation accepted successfully
 *
 *       400:
 *         description: Invitation cannot be accepted
 *
 *       401:
 *         description: Unauthorized
 *
 *       403:
 *         description: Forbidden - only candidates can accept invitations
 *
 *       404:
 *         description: Invitation not found
 */
router.patch(
  "/:id/accept",
  auth("CANDIDATE"),
  invitationController.acceptInvitation,
);


/**
 * @swagger
 * /api/v1/invitations/{id}/decline:
 *   patch:
 *     summary: Decline an invitation
 *     description: Decline an assessment invitation received by the authenticated candidate.
 *     tags:
 *       - Invitation
 *
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Invitation ID
 *
 *     responses:
 *       200:
 *         description: Invitation declined successfully
 *
 *       400:
 *         description: Invitation cannot be declined
 *
 *       401:
 *         description: Unauthorized
 *
 *       403:
 *         description: Forbidden - only candidates can decline invitations
 *
 *       404:
 *         description: Invitation not found
 */
router.patch(
  "/:id/decline",
  auth("CANDIDATE"),
  invitationController.declineInvitation,
);

export const invitationRoutes = router;