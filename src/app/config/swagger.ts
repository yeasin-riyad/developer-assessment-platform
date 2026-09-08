
import swaggerJSDoc from "swagger-jsdoc";

const swaggerOptions: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.3",

    info: {
      title: "Developer Assessment & Coding Platform API",
      version: "1.0.0",
      description:
        "REST API documentation for the Developer Assessment & Coding Platform",
    },

    servers: [
      {
        url: "http://localhost:7000",
        description: "Local Development Server",
      },
    ],

    tags: [
      {
        name: "Auth",
        description: "Authentication and authorization APIs",
      },
      {
        name: "Assessment",
        description: "Assessment management APIs",
      },
      {
        name: "Result",
        description: "Assessment result and statistics APIs",
      },
    ],

    components: {
      schemas: {
        // =====================================================
        // AUTH SCHEMAS
        // =====================================================

        RegisterRequest: {
          type: "object",
          required: ["name", "email", "password"],

          properties: {
            name: {
              type: "string",
              example: "Yeasin Mazumder",
            },

            email: {
              type: "string",
              format: "email",
              example: "yeasin@example.com",
            },

            password: {
              type: "string",
              format: "password",
              example: "Password123!",
            },

            role: {
              type: "string",
              enum: [
                "CANDIDATE",
                "RECRUITER",
                "CREATOR",
                "EVALUATOR",
                "ADMIN",
              ],
              example: "CANDIDATE",
            },
          },
        },

        LoginRequest: {
          type: "object",
          required: ["email", "password"],

          properties: {
            email: {
              type: "string",
              format: "email",
              example: "yeasin@example.com",
            },

            password: {
              type: "string",
              format: "password",
              example: "Password123!",
            },
          },
        },

        AuthResponse: {
          type: "object",

          properties: {
            success: {
              type: "boolean",
              example: true,
            },

            message: {
              type: "string",
              example: "Login successful",
            },

            data: {
              type: "object",

              properties: {
                accessToken: {
                  type: "string",
                  example:
                    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                },

                user: {
                  type: "object",

                  properties: {
                    id: {
                      type: "string",
                      format: "uuid",
                    },

                    name: {
                      type: "string",
                    },

                    email: {
                      type: "string",
                      format: "email",
                    },

                    role: {
                      type: "string",
                      enum: [
                        "CANDIDATE",
                        "RECRUITER",
                        "CREATOR",
                        "EVALUATOR",
                        "ADMIN",
                      ],
                    },
                  },
                },
              },
            },
          },
        },

        // =====================================================
        // COMMON ERROR RESPONSE
        // =====================================================

        ErrorResponse: {
          type: "object",

          properties: {
            success: {
              type: "boolean",
              example: false,
            },

            statusCode: {
              type: "integer",
              example: 400,
            },

            message: {
              type: "string",
              example: "Invalid credentials",
            },
          },
        },

        // =====================================================
        // ASSESSMENT SCHEMAS
        // =====================================================

        Assessment: {
          type: "object",

          properties: {
            id: {
              type: "string",
              format: "uuid",
            },

            title: {
              type: "string",
              example: "Backend Developer Assessment",
            },

            description: {
              type: "string",
              nullable: true,
              example:
                "Assessment for evaluating backend development skills",
            },

            duration: {
              type: "integer",
              example: 60,
              description: "Assessment duration in minutes",
            },

            totalMarks: {
              type: "integer",
              example: 100,
            },

            status: {
              type: "string",
              enum: [
                "DRAFT",
                "PUBLISHED",
                "ACTIVE",
                "CLOSED",
              ],
              example: "DRAFT",
            },

            recruiterId: {
              type: "string",
              format: "uuid",
            },

            createdAt: {
              type: "string",
              format: "date-time",
            },

            updatedAt: {
              type: "string",
              format: "date-time",
            },
          },
        },

        AssessmentProblemSummary: {
          type: "object",

          properties: {
            id: {
              type: "string",
              format: "uuid",
            },

            assessmentId: {
              type: "string",
              format: "uuid",
            },

            problemId: {
              type: "string",
              format: "uuid",
            },

            order: {
              type: "integer",
              example: 1,
            },

            points: {
              type: "integer",
              example: 10,
            },

            problem: {
              type: "object",

              properties: {
                id: {
                  type: "string",
                  format: "uuid",
                },

                title: {
                  type: "string",
                  example: "Two Sum",
                },

                type: {
                  type: "string",
                  enum: [
                    "CODING",
                    "MCQ",
                    "WRITTEN",
                  ],
                  example: "CODING",
                },

                difficulty: {
                  type: "string",
                  enum: [
                    "EASY",
                    "MEDIUM",
                    "HARD",
                  ],
                  example: "EASY",
                },
              },
            },

            createdAt: {
              type: "string",
              format: "date-time",
            },
          },
        },

        AssessmentProblemDetail: {
          type: "object",

          properties: {
            id: {
              type: "string",
              format: "uuid",
            },

            assessmentId: {
              type: "string",
              format: "uuid",
            },

            problemId: {
              type: "string",
              format: "uuid",
            },

            order: {
              type: "integer",
              example: 1,
            },

            points: {
              type: "integer",
              example: 10,
            },

            problem: {
              type: "object",

              properties: {
                id: {
                  type: "string",
                  format: "uuid",
                },

                title: {
                  type: "string",
                  example: "Two Sum",
                },

                description: {
                  type: "string",
                  example:
                    "Given an array of integers, return indices of the two numbers that add up to a target.",
                },

                type: {
                  type: "string",
                  enum: [
                    "CODING",
                    "MCQ",
                    "WRITTEN",
                  ],
                  example: "CODING",
                },

                difficulty: {
                  type: "string",
                  enum: [
                    "EASY",
                    "MEDIUM",
                    "HARD",
                  ],
                  example: "EASY",
                },

                points: {
                  type: "integer",
                  example: 10,
                },
              },
            },

            createdAt: {
              type: "string",
              format: "date-time",
            },
          },
        },

        AssessmentResponse: {
          type: "object",

          properties: {
            success: {
              type: "boolean",
              example: true,
            },

            message: {
              type: "string",
              example: "Assessment retrieved successfully",
            },

            data: {
              $ref: "#/components/schemas/Assessment",
            },
          },
        },

        AssessmentListResponse: {
          type: "object",

          properties: {
            success: {
              type: "boolean",
              example: true,
            },

            message: {
              type: "string",
              example: "Assessments retrieved successfully",
            },

            data: {
              type: "array",

              items: {
                allOf: [
                  {
                    $ref: "#/components/schemas/Assessment",
                  },

                  {
                    type: "object",

                    properties: {
                      problems: {
                        type: "array",

                        items: {
                          $ref: "#/components/schemas/AssessmentProblemSummary",
                        },
                      },
                    },
                  },
                ],
              },
            },
          },
        },

        AssessmentDetailResponse: {
          type: "object",

          properties: {
            success: {
              type: "boolean",
              example: true,
            },

            message: {
              type: "string",
              example: "Assessment retrieved successfully",
            },

            data: {
              allOf: [
                {
                  $ref: "#/components/schemas/Assessment",
                },

                {
                  type: "object",

                  properties: {
                    problems: {
                      type: "array",

                      items: {
                        $ref: "#/components/schemas/AssessmentProblemDetail",
                      },
                    },
                  },
                },
              ],
            },
          },
        },

        AssessmentProblemResponse: {
          type: "object",

          properties: {
            success: {
              type: "boolean",
              example: true,
            },

            message: {
              type: "string",
              example:
                "Problem added to assessment successfully",
            },

            data: {
              $ref: "#/components/schemas/AssessmentProblemDetail",
            },
          },
        },

        // =====================================================
        // RESULT - REUSABLE PROBLEM SCHEMA
        // =====================================================

        ResultProblemSummary: {
          type: "object",

          properties: {
            id: {
              type: "string",
              format: "uuid",
            },

            title: {
              type: "string",
            },

            type: {
              type: "string",
              enum: [
                "CODING",
                "MCQ",
                "WRITTEN",
              ],
            },

            difficulty: {
              type: "string",
              enum: [
                "EASY",
                "MEDIUM",
                "HARD",
              ],
            },
          },
        },

        ResultProblemDetail: {
          type: "object",

          properties: {
            id: {
              type: "string",
              format: "uuid",
            },

            title: {
              type: "string",
            },

            description: {
              type: "string",
            },

            type: {
              type: "string",
              enum: [
                "CODING",
                "MCQ",
                "WRITTEN",
              ],
            },

            difficulty: {
              type: "string",
              enum: [
                "EASY",
                "MEDIUM",
                "HARD",
              ],
            },
          },
        },

        // =====================================================
        // RESULT ITEM
        // =====================================================

        ResultItem: {
          type: "object",

          properties: {
            id: {
              type: "string",
              format: "uuid",
            },

            resultId: {
              type: "string",
              format: "uuid",
            },

            problemId: {
              type: "string",
              format: "uuid",
            },

            maximumMarks: {
              type: "integer",
            },

            obtainedMarks: {
              type: "integer",
            },

            problem: {
              $ref: "#/components/schemas/ResultProblemSummary",
            },

            createdAt: {
              type: "string",
              format: "date-time",
            },
          },
        },

        ResultItemDetail: {
          type: "object",

          properties: {
            id: {
              type: "string",
              format: "uuid",
            },

            resultId: {
              type: "string",
              format: "uuid",
            },

            problemId: {
              type: "string",
              format: "uuid",
            },

            maximumMarks: {
              type: "integer",
            },

            obtainedMarks: {
              type: "integer",
            },

            problem: {
              $ref: "#/components/schemas/ResultProblemDetail",
            },

            createdAt: {
              type: "string",
              format: "date-time",
            },
          },
        },

        // =====================================================
        // RESULT ATTEMPT - CANDIDATE
        // =====================================================

        ResultAttempt: {
          type: "object",

          properties: {
            id: {
              type: "string",
              format: "uuid",
            },

            candidateId: {
              type: "string",
              format: "uuid",
            },

            status: {
              type: "string",
              enum: [
                "NOT_STARTED",
                "IN_PROGRESS",
                "SUBMITTED",
                "EXPIRED",
              ],
            },

            startedAt: {
              type: "string",
              format: "date-time",
              nullable: true,
            },

            submittedAt: {
              type: "string",
              format: "date-time",
              nullable: true,
            },

            assessment: {
              type: "object",

              properties: {
                id: {
                  type: "string",
                  format: "uuid",
                },

                title: {
                  type: "string",
                },

                description: {
                  type: "string",
                  nullable: true,
                },

                duration: {
                  type: "integer",
                },
              },
            },
          },
        },

        // =====================================================
        // RESULT ATTEMPT - GENERATE RESULT
        // =====================================================

        GeneratedResultAttempt: {
          type: "object",

          properties: {
            id: {
              type: "string",
              format: "uuid",
            },

            status: {
              type: "string",
              enum: [
                "NOT_STARTED",
                "IN_PROGRESS",
                "SUBMITTED",
                "EXPIRED",
              ],
            },

            submittedAt: {
              type: "string",
              format: "date-time",
              nullable: true,
            },

            candidateId: {
              type: "string",
              format: "uuid",
            },

            assessment: {
              type: "object",

              properties: {
                id: {
                  type: "string",
                  format: "uuid",
                },

                title: {
                  type: "string",
                },

                duration: {
                  type: "integer",
                },
              },
            },
          },
        },

        // =====================================================
        // RESULT ATTEMPT - RECRUITER
        // =====================================================

        RecruiterResultAttempt: {
          type: "object",

          properties: {
            id: {
              type: "string",
              format: "uuid",
            },

            candidateId: {
              type: "string",
              format: "uuid",
            },

            status: {
              type: "string",
              enum: [
                "NOT_STARTED",
                "IN_PROGRESS",
                "SUBMITTED",
                "EXPIRED",
              ],
            },

            startedAt: {
              type: "string",
              format: "date-time",
              nullable: true,
            },

            expiresAt: {
              type: "string",
              format: "date-time",
              nullable: true,
            },

            submittedAt: {
              type: "string",
              format: "date-time",
              nullable: true,
            },

            candidate: {
              type: "object",

              properties: {
                id: {
                  type: "string",
                  format: "uuid",
                },

                name: {
                  type: "string",
                },

                email: {
                  type: "string",
                  format: "email",
                },
              },
            },

            assessment: {
              type: "object",

              properties: {
                id: {
                  type: "string",
                  format: "uuid",
                },

                title: {
                  type: "string",
                },

                description: {
                  type: "string",
                  nullable: true,
                },

                duration: {
                  type: "integer",
                },

                recruiterId: {
                  type: "string",
                  format: "uuid",
                },
              },
            },
          },
        },

        // =====================================================
        // GENERATED RESULT RESPONSE
        // =====================================================

        GeneratedResultResponse: {
          type: "object",

          properties: {
            success: {
              type: "boolean",
              example: true,
            },

            message: {
              type: "string",
              example: "Result generated successfully",
            },

            data: {
              type: "object",

              properties: {
                id: {
                  type: "string",
                  format: "uuid",
                },

                attemptId: {
                  type: "string",
                  format: "uuid",
                },

                totalMarks: {
                  type: "integer",
                },

                obtainedMarks: {
                  type: "integer",
                },

                percentage: {
                  type: "number",
                  format: "float",
                },

                status: {
                  type: "string",
                  enum: ["PASS", "FAIL"],
                },

                items: {
                  type: "array",

                  items: {
                    $ref: "#/components/schemas/ResultItem",
                  },
                },

                attempt: {
                  $ref: "#/components/schemas/GeneratedResultAttempt",
                },

                createdAt: {
                  type: "string",
                  format: "date-time",
                },

                updatedAt: {
                  type: "string",
                  format: "date-time",
                },
              },
            },
          },
        },

        // =====================================================
        // MY RESULT RESPONSE
        // =====================================================

        MyResultResponse: {
          type: "object",

          properties: {
            success: {
              type: "boolean",
              example: true,
            },

            message: {
              type: "string",
              example: "Result retrieved successfully",
            },

            data: {
              type: "object",

              properties: {
                id: {
                  type: "string",
                  format: "uuid",
                },

                attemptId: {
                  type: "string",
                  format: "uuid",
                },

                totalMarks: {
                  type: "integer",
                },

                obtainedMarks: {
                  type: "integer",
                },

                percentage: {
                  type: "number",
                  format: "float",
                },

                status: {
                  type: "string",
                  enum: ["PASS", "FAIL"],
                },

                items: {
                  type: "array",

                  items: {
                    $ref: "#/components/schemas/ResultItem",
                  },
                },

                attempt: {
                  $ref: "#/components/schemas/ResultAttempt",
                },

                createdAt: {
                  type: "string",
                  format: "date-time",
                },

                updatedAt: {
                  type: "string",
                  format: "date-time",
                },
              },
            },
          },
        },

        // =====================================================
        // ASSESSMENT RESULTS RESPONSE
        // =====================================================

        AssessmentResultsResponse: {
          type: "object",

          properties: {
            success: {
              type: "boolean",
              example: true,
            },

            message: {
              type: "string",
              example:
                "Assessment results retrieved successfully",
            },

            data: {
              type: "object",

              properties: {
                assessment: {
                  type: "object",

                  properties: {
                    id: {
                      type: "string",
                      format: "uuid",
                    },

                    title: {
                      type: "string",
                    },
                  },
                },

                totalResults: {
                  type: "integer",
                },

                results: {
                  type: "array",

                  items: {
                    type: "object",

                    properties: {
                      id: {
                        type: "string",
                        format: "uuid",
                      },

                      attemptId: {
                        type: "string",
                        format: "uuid",
                      },

                      totalMarks: {
                        type: "integer",
                      },

                      obtainedMarks: {
                        type: "integer",
                      },

                      percentage: {
                        type: "number",
                        format: "float",
                      },

                      status: {
                        type: "string",
                        enum: ["PASS", "FAIL"],
                      },

                      items: {
                        type: "array",

                        items: {
                          $ref: "#/components/schemas/ResultItem",
                        },
                      },

                      attempt: {
                        type: "object",

                        properties: {
                          id: {
                            type: "string",
                            format: "uuid",
                          },

                          status: {
                            type: "string",
                            enum: [
                              "NOT_STARTED",
                              "IN_PROGRESS",
                              "SUBMITTED",
                              "EXPIRED",
                            ],
                          },

                          startedAt: {
                            type: "string",
                            format: "date-time",
                            nullable: true,
                          },

                          submittedAt: {
                            type: "string",
                            format: "date-time",
                            nullable: true,
                          },

                          candidate: {
                            type: "object",

                            properties: {
                              id: {
                                type: "string",
                                format: "uuid",
                              },

                              name: {
                                type: "string",
                              },

                              email: {
                                type: "string",
                                format: "email",
                              },
                            },
                          },
                        },
                      },

                      createdAt: {
                        type: "string",
                        format: "date-time",
                      },

                      updatedAt: {
                        type: "string",
                        format: "date-time",
                      },
                    },
                  },
                },
              },
            },
          },
        },

        // =====================================================
        // RECRUITER RESULT BY ID
        // =====================================================

        RecruiterResultResponse: {
          type: "object",

          properties: {
            success: {
              type: "boolean",
              example: true,
            },

            message: {
              type: "string",
              example: "Result retrieved successfully",
            },

            data: {
              type: "object",

              properties: {
                id: {
                  type: "string",
                  format: "uuid",
                },

                attemptId: {
                  type: "string",
                  format: "uuid",
                },

                totalMarks: {
                  type: "integer",
                },

                obtainedMarks: {
                  type: "integer",
                },

                percentage: {
                  type: "number",
                  format: "float",
                },

                status: {
                  type: "string",
                  enum: ["PASS", "FAIL"],
                },

                items: {
                  type: "array",

                  items: {
                    $ref: "#/components/schemas/ResultItemDetail",
                  },
                },

                attempt: {
                  $ref: "#/components/schemas/RecruiterResultAttempt",
                },

                createdAt: {
                  type: "string",
                  format: "date-time",
                },

                updatedAt: {
                  type: "string",
                  format: "date-time",
                },
              },
            },
          },
        },

        // =====================================================
        // ASSESSMENT STATISTICS RESPONSE
        // =====================================================

        AssessmentStatisticsResponse: {
          type: "object",

          properties: {
            success: {
              type: "boolean",
              example: true,
            },

            message: {
              type: "string",
              example:
                "Assessment statistics retrieved successfully",
            },

            data: {
              type: "object",

              properties: {
                assessment: {
                  type: "object",

                  properties: {
                    id: {
                      type: "string",
                      format: "uuid",
                    },

                    title: {
                      type: "string",
                    },
                  },
                },

                statistics: {
                  type: "object",

                  properties: {
                    totalCandidates: {
                      type: "integer",
                    },

                    completedCandidates: {
                      type: "integer",
                    },

                    pendingCandidates: {
                      type: "integer",
                    },

                    passedCandidates: {
                      type: "integer",
                    },

                    failedCandidates: {
                      type: "integer",
                    },

                    passPercentage: {
                      type: "number",
                      format: "float",
                    },

                    averageScore: {
                      type: "number",
                      format: "float",
                    },

                    averagePercentage: {
                      type: "number",
                      format: "float",
                    },

                    highestScore: {
                      type: "integer",
                    },

                    lowestScore: {
                      type: "integer",
                    },
                  },
                },
              },
            },
          },
        },
      },

      // =====================================================
      // SECURITY
      // =====================================================

      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },

  // =====================================================
  // ROUTE DOCUMENTATION LOCATION
  // =====================================================

  apis: [
  "./src/app/modules/**/*.route.ts",
  "./dist/app/modules/**/*.route.js",
],
};

export const swaggerSpec = swaggerJSDoc(swaggerOptions);

