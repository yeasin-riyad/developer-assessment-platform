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
    ],

    components: {
      schemas: {
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
              enum: ["CANDIDATE", "RECRUITER", "CREATOR", "EVALUATOR", "ADMIN"],
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
                  example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
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
                    },

                    role: {
                      type: "string",
                    },
                  },
                },
              },
            },
          },
        },

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
      },

      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },

  apis: ["./src/app/modules/**/*.route.ts"],
};

export const swaggerSpec = swaggerJSDoc(swaggerOptions);
