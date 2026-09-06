import type { Request, Response } from "express";
import httpStatus from "http-status";

import { catchAsync } from "../../utils/catchAsync.js";
import { adminService } from "./admin.service.js";

const getAllUsers = catchAsync(
  async (req: Request, res: Response) => {
    const role = req.query.role as
      | "CANDIDATE"
      | "RECRUITER"
      | "CREATOR"
      | "EVALUATOR"
      | "ADMIN"
      | undefined;

    const isActiveQuery =
      req.query.isActive as
        | "true"
        | "false"
        | undefined;

    const search =
      req.query.search as string | undefined;

    const users =
      await adminService.getAllUsers({
        role,

        isActive:
          isActiveQuery === undefined
            ? undefined
            : isActiveQuery === "true",

        search,
      });

    res.status(httpStatus.OK).json({
      success: true,
      message: "Users retrieved successfully",
      data: users,
    });
  },
);

const getUserById = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.params.userId as string;

    const user =
      await adminService.getUserById(
        userId,
      );

    res.status(httpStatus.OK).json({
      success: true,
      message: "User retrieved successfully",
      data: user,
    });
  },
);

const updateUserRole = catchAsync(
  async (req: Request, res: Response) => {
    const adminId = req.user!.userId;
    const userId = req.params.userId as string;

    const user =
      await adminService.updateUserRole(
        adminId,
        userId,
        req.body.role,
      );

    res.status(httpStatus.OK).json({
      success: true,
      message: "User role updated successfully",
      data: user,
    });
  },
);

const updateUserStatus = catchAsync(
  async (req: Request, res: Response) => {
    const adminId = req.user!.userId;
    const userId = req.params.userId as string;

    const user =
      await adminService.updateUserStatus(
        adminId,
        userId,
        req.body.isActive,
      );

    res.status(httpStatus.OK).json({
      success: true,
      message: "User status updated successfully",
      data: user,
    });
  },
);

const deleteUser = catchAsync(
  async (req: Request, res: Response) => {
    const adminId = req.user!.userId;
    const userId = req.params.userId as string;

    await adminService.deleteUser(
      adminId,
      userId,
    );

    res.status(httpStatus.OK).json({
      success: true,
      message: "User deleted successfully",
    });
  },
);

const getAllCompanies = catchAsync(
  async (
    req: Request,
    res: Response,
  ) => {
    const status =
      req.query.status as
        | "ACTIVE"
        | "SUSPENDED"
        | undefined;

    const search =
      req.query.search as
        | string
        | undefined;

    const companies =
      await adminService.getAllCompanies({
        status,
        search,
      });

    res.status(httpStatus.OK).json({
      success: true,
      message:
        "Companies retrieved successfully",
      data: companies,
    });
  },
);

const getCompanyById = catchAsync(
  async (
    req: Request,
    res: Response,
  ) => {
    const companyId =
      req.params.companyId as string;

    const company =
      await adminService.getCompanyById(
        companyId,
      );

    res.status(httpStatus.OK).json({
      success: true,
      message:
        "Company retrieved successfully",
      data: company,
    });
  },
);

const updateCompanyStatus = catchAsync(
  async (
    req: Request,
    res: Response,
  ) => {
    const companyId =
      req.params.companyId as string;

    const company =
      await adminService.updateCompanyStatus(
        companyId,
        req.body.status,
      );

    res.status(httpStatus.OK).json({
      success: true,
      message:
        "Company status updated successfully",
      data: company,
    });
  },
);

const deleteCompany = catchAsync(
  async (
    req: Request,
    res: Response,
  ) => {
    const companyId =
      req.params.companyId as string;

    await adminService.deleteCompany(
      companyId,
    );

    res.status(httpStatus.OK).json({
      success: true,
      message:
        "Company deleted successfully",
    });
  },
);


const getAllProblems = catchAsync(
  async (
    req: Request,
    res: Response,
  ) => {
    const type =
      req.query.type as
        | "CODING"
        | "MCQ"
        | "WRITTEN"
        | undefined;

    const difficulty =
      req.query.difficulty as
        | "EASY"
        | "MEDIUM"
        | "HARD"
        | undefined;

    const search =
      req.query.search as
        | string
        | undefined;

    const problems =
      await adminService.getAllProblems({
        type,
        difficulty,
        search,
      });

    res.status(httpStatus.OK).json({
      success: true,
      message:
        "Problems retrieved successfully",
      data: problems,
    });
  },
);


const getProblemById = catchAsync(
  async (
    req: Request,
    res: Response,
  ) => {
    const problemId =
      req.params.problemId as string;

    const problem =
      await adminService.getProblemById(
        problemId,
      );

    res.status(httpStatus.OK).json({
      success: true,
      message:
        "Problem retrieved successfully",
      data: problem,
    });
  },
);

const deleteProblem = catchAsync(
  async (
    req: Request,
    res: Response,
  ) => {
    const problemId =
      req.params.problemId as string;

    await adminService.deleteProblem(
      problemId,
    );

    res.status(httpStatus.OK).json({
      success: true,
      message:
        "Problem deleted successfully",
    });
  },
);


const getAllAssessments = catchAsync(
  async (
    req: Request,
    res: Response,
  ) => {
    const status =
      req.query.status as
        | "DRAFT"
        | "PUBLISHED"
        | "ACTIVE"
        | "CLOSED"
        | undefined;

    const search =
      req.query.search as
        | string
        | undefined;

    const assessments =
      await adminService.getAllAssessments({
        status,
        search,
      });

    res.status(httpStatus.OK).json({
      success: true,
      message:
        "Assessments retrieved successfully",
      data: assessments,
    });
  },
);

const getAssessmentById = catchAsync(
  async (
    req: Request,
    res: Response,
  ) => {
    const assessmentId =
      req.params.assessmentId as string;

    const assessment =
      await adminService.getAssessmentById(
        assessmentId,
      );

    res.status(httpStatus.OK).json({
      success: true,
      message:
        "Assessment retrieved successfully",
      data: assessment,
    });
  },
);

const closeAssessment = catchAsync(
  async (
    req: Request,
    res: Response,
  ) => {
    const assessmentId =
      req.params.assessmentId as string;

    const assessment =
      await adminService.closeAssessment(
        assessmentId,
      );

    res.status(httpStatus.OK).json({
      success: true,
      message:
        "Assessment closed successfully",
      data: assessment,
    });
  },
);


const getPlatformStatistics = catchAsync(
  async (
    _req: Request,
    res: Response,
  ) => {
    const statistics =
      await adminService.getPlatformStatistics();

    res.status(httpStatus.OK).json({
      success: true,
      message:
        "Platform statistics retrieved successfully",
      data: statistics,
    });
  },
);


export const adminController = {
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
  getPlatformStatistics
};