# 🚀 Developer Assessment & Coding Platform

A scalable **Developer Assessment & Coding Platform** designed for companies and recruiters to create technical assessments, invite candidates, evaluate coding submissions, and generate detailed results.

The platform supports **coding problems, MCQs, written questions, timed assessments, automated/manual evaluation, candidate invitations, result generation, subscriptions, and bKash payments**.

---

## 📌 Table of Contents

* [Overview](#-overview)
* [Key Features](#-key-features)
* [Application Workflow](#-application-workflow)
* [User Roles](#-user-roles)
* [Tech Stack](#-tech-stack)
* [Architecture](#-architecture)
* [Project Structure](#-project-structure)
* [Prerequisites](#-prerequisites)
* [Installation](#-installation)
* [Environment Variables](#-environment-variables)
* [Database Setup](#-database-setup)
* [Running the Project](#-running-the-project)
* [API Documentation](#-api-documentation)
* [Authentication](#-authentication)
* [Assessment Workflow](#-assessment-workflow)
* [Testing the APIs](#-testing-the-apis)
* [Docker](#-docker)
* [Deployment](#-deployment)
* [Security](#-security)
* [Future Improvements](#-future-improvements)
* [Learning Outcomes](#-learning-outcomes)
* [Author](#-author)

---

# 📖 Overview

The **Developer Assessment & Coding Platform** provides an end-to-end workflow for technical recruitment.

Companies can create assessments and add different types of problems:

* Coding problems
* Multiple-choice questions
* Written questions

Candidates can then receive invitations, start timed assessments, submit their solutions, and receive evaluation results.

### Core Workflow

```text
Company / Recruiter
        │
        ▼
Create Assessment
        │
        ▼
Add Problems
        │
        ▼
Publish Assessment
        │
        ▼
Invite Candidates
        │
        ▼
Candidate Starts Attempt
        │
        ▼
Submit Answers / Code
        │
        ▼
Evaluation
        │
        ▼
Score Calculation
        │
        ▼
Candidate Result
        │
        ▼
Company Report
```

---

# ✨ Key Features

## 🔐 Authentication & Authorization

* User registration
* Email/password authentication
* JWT authentication
* Access token
* Refresh token
* HTTP-only cookies
* Google OAuth
* Role-based authorization
* Protected routes

## 👤 User Management

* Candidate profiles
* Recruiter profiles
* Creator profiles
* Evaluator profiles
* Admin management

## 🏢 Company Management

* Create company
* Update company
* Get company information
* Manage company members
* Recruiter-company relationship

## 🧩 Problem Bank

Supports multiple question types:

### Coding Problems

* Problem description
* Difficulty
* Marks
* Time limit
* Memory limit
* Constraints
* Tags
* Test cases

### MCQ

* Question
* Multiple options
* Correct answer
* Marks

### Written Questions

* Question description
* Marks
* Manual evaluation

## 📝 Assessment Management

* Create assessment
* Update assessment
* Add problems
* Remove problems
* Calculate total marks
* Set assessment duration
* Publish assessment
* Unpublish assessment
* Assessment lifecycle management

### Assessment Lifecycle

```text
DRAFT
  │
  ▼
PUBLISHED
  │
  ▼
ACTIVE
  │
  ▼
CLOSED
```

## 📩 Candidate Invitations

* Invite candidates
* Send invitation emails
* Track invitation status
* Accept/reject invitations

## ⏱️ Assessment Attempts

* Start assessment
* Timed attempts
* Track start time
* Track expiration time
* Prevent unauthorized attempts
* Track attempt status

## 💻 Code Submission

* Submit coding solutions
* Store source code
* Track programming language
* Submission history
* Evaluation status

## 🧪 Evaluation

* Automated coding evaluation
* Manual evaluation
* Score calculation
* Evaluator feedback
* Test-case based evaluation

## 📊 Results

* Total marks
* Obtained marks
* Percentage
* Pass/fail status
* Assessment statistics
* Candidate performance

## 💳 Subscription & Payments

* Basic subscription
* Premium subscription
* Subscription lifecycle
* Payment tracking
* bKash payment integration
* Payment status tracking
* Refund support

## 📚 API Documentation

Interactive API documentation using:

* Swagger
* OpenAPI 3.0

---

# 👥 User Roles

The platform supports multiple roles:

| Role        | Responsibility                            |
| ----------- | ----------------------------------------- |
| `CANDIDATE` | Takes assessments and submits solutions   |
| `RECRUITER` | Creates companies and manages assessments |
| `CREATOR`   | Creates and manages problems              |
| `EVALUATOR` | Evaluates candidate submissions           |
| `ADMIN`     | Manages the entire platform               |

---

# 🛠️ Tech Stack

## Backend

* Node.js
* TypeScript
* Express.js
* Prisma ORM
* PostgreSQL

## Authentication

* JWT
* Google OAuth
* HTTP-only Cookies

## Validation

* Zod

## Email

* Nodemailer
* SMTP

## Documentation

* Swagger
* OpenAPI

## Payment

* bKash Payment Gateway

## Security

* Helmet
* CORS
* JWT
* HTTP-only cookies
* Role-based authorization

---

# 🏗️ Architecture

The backend follows a modular architecture.

```text
Client
  │
  ▼
Express API
  │
  ├── Authentication
  ├── Users
  ├── Companies
  ├── Problems
  ├── Assessments
  ├── Invitations
  ├── Attempts
  ├── Submissions
  ├── Evaluations
  ├── Results
  ├── Subscriptions
  └── Admin
          │
          ▼
       Prisma
          │
          ▼
      PostgreSQL
```

External services:

```text
                    ┌───────────────┐
                    │ Google OAuth  │
                    └───────┬───────┘
                            │
                            ▼
Client ───────► Express API ◄──── SMTP
                    │
                    ├────────► PostgreSQL
                    │
                    └────────► bKash
```

---

# 📂 Project Structure

```text
developer-assessment-platform/
│
├── api/
│   └── index.ts
│
├── src/
│   │
│   ├── app.ts
│   ├── server.ts
│   │
│   └── app/
│       │
│       ├── config/
│       │
│       ├── lib/
│       │   ├── prisma.ts
│       │   └── nodemailer.ts
│       │
│       ├── middleware/
│       │   ├── auth.ts
│       │   ├── validateRequest.ts
│       │   ├── notFound.ts
│       │   └── globalErrorHandler.ts
│       │
│       └── modules/
│           │
│           ├── auth/
│           ├── user/
│           ├── company/
│           ├── problem/
│           ├── assessment/
│           ├── invitation/
│           ├── attempt/
│           ├── submission/
│           ├── evaluation/
│           ├── result/
│           ├── subscription/
│           └── admin/
│
├── prisma/
│   └── schema.prisma
│
├── dist/
│
├── package.json
├── tsconfig.json
├── vercel.json
└── README.md
```

---

# 📋 Prerequisites

Before running the project, make sure you have installed:

* Node.js 20+
* npm
* PostgreSQL
* Git
* A Google OAuth application (for Google login)
* SMTP credentials (for emails)
* bKash sandbox/production credentials (for payments)

Check Node.js:

```bash
node --version
```

Check npm:

```bash
npm --version
```

---

# 🚀 Installation

Clone the repository:

```bash
git clone https://github.com/yeasin-riyad/developer-assessment-platform.git
```

Navigate into the project:

```bash
cd developer-assessment-platform
```

Install dependencies:

```bash
npm install
```

---

# 🔐 Environment Variables

Create a `.env` file in the project root.

```env
# Application
NODE_ENV=development
PORT=7000

# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/developer_assessment"

# JWT
JWT_ACCESS_SECRET="your_access_secret"
JWT_REFRESH_SECRET="your_refresh_secret"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Google OAuth
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"
GOOGLE_CALLBACK_URL="http://localhost:7000/api/v1/auth/google/callback"

# Frontend
FRONTEND_URL="http://localhost:3000"

# SMTP
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your_email@gmail.com"
SMTP_PASS="your_app_password"

# bKash
BKASH_BASE_URL="your_bkash_base_url"
BKASH_USERNAME="your_bkash_username"
BKASH_PASSWORD="your_bkash_password"
BKASH_APP_KEY="your_bkash_app_key"
BKASH_APP_SECRET="your_bkash_app_secret"
BKASH_CALLBACK_URL="your_bkash_callback_url"
```

> ⚠️ Never commit `.env` to GitHub.

Add this to `.gitignore`:

```gitignore
node_modules/
dist/
.env
.env.*
!.env.example
```

---

# 🗄️ Database Setup

This project uses **PostgreSQL + Prisma**.

After configuring `DATABASE_URL`, generate Prisma Client:

```bash
npx prisma generate
```

Run database migrations:

```bash
npx prisma migrate dev
```

If you want to create a new migration:

```bash
npx prisma migrate dev --name init
```

Check the database using Prisma Studio:

```bash
npx prisma studio
```

---

# ▶️ Running the Project

## Development

Run the development server:

```bash
npm run dev
```

The API will run at:

```text
http://localhost:7000
```

Health check:

```text
http://localhost:7000/api/v1/health
```

Expected response:

```json
{
  "success": true,
  "message": "Developer Assessment Platform API is running"
}
```

---

## Production Build

Build the project:

```bash
npm run build
```

Start the compiled server:

```bash
npm start
```

---

# 📚 API Documentation

Swagger UI is available at:

```text
http://localhost:7000/api-docs
```

The Swagger documentation provides an interactive interface for testing the APIs.

---

# 🔑 Authentication

Most protected APIs require a JWT access token.

After login, copy the returned access token.

In Swagger:

```text
Authorize
```

Then enter:

```text
Bearer YOUR_ACCESS_TOKEN
```

Example:

```text
Bearer eyJhbGciOiJIUzI1NiIs...
```

---

# 🧪 API Testing Workflow

For testing the complete application, follow this order.

## 1. Register Users

Create:

```text
Candidate
Recruiter
Creator
Evaluator
```

Example:

```json
{
  "name": "Rahim Ahmed",
  "email": "candidate@test.com",
  "password": "Password123!",
  "role": "CANDIDATE"
}
```

---

## 2. Login

Login with the required account.

Save:

```text
accessToken
userId
```

---

## 3. Create Company

Login as recruiter.

Create:

```json
{
  "name": "TechNova Solutions",
  "description": "A software company focused on scalable web and cloud applications.",
  "website": "https://technova.example.com",
  "industry": "Software Development",
  "location": "Dhaka, Bangladesh"
}
```

Save:

```text
companyId
```

---

## 4. Create Problems

Create several problems.

Recommended test set:

```text
Two Sum
Valid Parentheses
Longest Substring Without Repeating Characters
Binary Search MCQ
FIFO Data Structure MCQ
Explain REST API
```

Save every:

```text
problemId
```

---

## 5. Add Test Cases

For `Two Sum`:

```json
{
  "input": "[2,7,11,15]\n9",
  "expectedOutput": "[0,1]",
  "isHidden": false
}
```

Hidden test:

```json
{
  "input": "[3,2,4]\n6",
  "expectedOutput": "[1,2]",
  "isHidden": true
}
```

---

## 6. Create Assessment

Example:

```json
{
  "title": "Backend Developer Assessment",
  "description": "Technical assessment for backend developer candidates.",
  "companyId": "YOUR_COMPANY_ID",
  "duration": 90
}
```

Save:

```text
assessmentId
```

---

## 7. Add Problems

Add:

```text
Two Sum
Valid Parentheses
Binary Search MCQ
Explain REST API
```

Example:

```json
{
  "problemId": "YOUR_PROBLEM_ID"
}
```

---

## 8. Publish Assessment

Change:

```text
DRAFT
```

to:

```text
PUBLISHED
```

---

## 9. Invite Candidate

Invite:

```text
candidate@test.com
```

Save:

```text
invitationId
```

---

## 10. Candidate Starts Attempt

Login as candidate.

Start the assessment:

```json
{
  "assessmentId": "YOUR_ASSESSMENT_ID"
}
```

Save:

```text
attemptId
```

---

## 11. Submit Coding Solution

Example JavaScript solution:

```javascript
function twoSum(nums, target) {
  const map = new Map();

  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];

    if (map.has(complement)) {
      return [map.get(complement), i];
    }

    map.set(nums[i], i);
  }
}
```

Save:

```text
submissionId
```

---

## 12. Test Wrong Answer

Use an intentionally incorrect solution:

```javascript
function twoSum(nums, target) {
  return [0, 1];
}
```

This is useful for testing:

```text
Accepted
Wrong Answer
Runtime Error
Time Limit Exceeded
```

---

## 13. Evaluate Submission

Login as evaluator.

Submit an evaluation:

```json
{
  "submissionId": "YOUR_SUBMISSION_ID",
  "score": 8,
  "feedback": "Good approach using a hash map with optimal time complexity."
}
```

---

## 14. Check Result

After completing the attempt:

```text
GET /api/v1/results/:attemptId
```

A result may contain:

```json
{
  "attemptId": "attempt-uuid",
  "totalMarks": 25,
  "obtainedMarks": 21,
  "percentage": 84,
  "status": "PASSED"
}
```

---

# 💳 Subscription Testing

Candidate can purchase a subscription.

Example:

```json
{
  "plan": "PREMIUM"
}
```

Expected flow:

```text
Create Subscription
        ↓
PENDING
        ↓
Create bKash Payment
        ↓
Customer Payment
        ↓
Execute Payment
        ↓
Payment Completed
        ↓
Subscription ACTIVE
```

For successful bKash payment, the gateway response should indicate:

```text
transactionStatus = Completed
statusCode = 0000
```

Do not manually fake successful payment responses in production.

---

# 🚢 Deployment

The project can be deployed to Vercel.

The current deployment uses:

```text
vercel.json
      ↓
dist/src/server.js
      ↓
@vercel/node
      ↓
Express Application
```

Build locally:

```bash
npm run build
```

Verify:

```text
dist/src/server.js
```

Then deploy:

```bash
vercel --prod
```

---

# ☁️ Vercel Configuration

Current `vercel.json`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "dist/src/server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "dist/src/server.js"
    }
  ]
}
```

### Important

The Vercel project should not expect a static output directory such as:

```text
public
```

The application is an Express API, not a static frontend application.

---

# 🌐 Production Environment Variables

Before deployment, configure all required environment variables in Vercel.

Important:

```text
DATABASE_URL
JWT_ACCESS_SECRET
JWT_REFRESH_SECRET
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
GOOGLE_CALLBACK_URL
SMTP_HOST
SMTP_PORT
SMTP_USER
SMTP_PASS
BKASH_BASE_URL
BKASH_USERNAME
BKASH_PASSWORD
BKASH_APP_KEY
BKASH_APP_SECRET
BKASH_CALLBACK_URL
FRONTEND_URL
```

### Production Google OAuth

Update:

```text
GOOGLE_CALLBACK_URL
```

from:

```text
http://localhost:7000/api/v1/auth/google/callback
```

to your production callback URL.

Also update the Google Cloud OAuth configuration accordingly.

---

# 🔒 Security

Security considerations implemented in the project include:

* Helmet
* JWT authentication
* HTTP-only cookies
* Password hashing
* Role-based authorization
* Request validation using Zod
* Environment-based secrets
* Protected API routes
* Input validation
* Centralized error handling

Never expose:

```text
JWT secrets
Google client secrets
SMTP passwords
bKash credentials
DATABASE_URL
```

in source code or GitHub.

---

# 📈 Future Improvements

Planned improvements include:

* [ ] Redis caching
* [ ] Rate limiting
* [ ] BullMQ background jobs
* [ ] Real-time assessment monitoring
* [ ] Advanced code execution sandbox
* [ ] Anti-cheating mechanisms
* [ ] Browser monitoring
* [ ] Plagiarism detection
* [ ] AI-assisted evaluation
* [ ] Advanced analytics dashboard
* [ ] Candidate ranking
* [ ] Leaderboards
* [ ] Email notification queues
* [ ] WebSocket-based live updates
* [ ] Microservices architecture
* [ ] AWS deployment
* [ ] CI/CD pipeline
* [ ] Automated testing
* [ ] Integration testing
* [ ] Load testing

---

# 🧠 Learning Outcomes

This project provides practical experience with:

### Backend Development

* REST API design
* Modular architecture
* Express.js
* TypeScript
* Prisma
* PostgreSQL

### Authentication

* JWT
* OAuth 2.0
* Google authentication
* Cookies
* Role-based authorization

### System Design

* Assessment lifecycle
* Attempt management
* Submission processing
* Evaluation workflows
* Result generation
* Subscription management

### Database

* Relational database design
* Prisma ORM
* Relations
* Transactions
* Indexing
* Database migrations

### Third-Party Integrations

* Google OAuth
* SMTP
* bKash Payment Gateway
* Swagger/OpenAPI

---

# 🧪 Recommended Testing Checklist

```text
Authentication
├── Register
├── Login
├── Refresh Token
├── Logout
└── Google OAuth

Users
├── Get Profile
├── Update Profile
└── Role Authorization

Companies
├── Create
├── Get
├── Update
└── Delete

Problems
├── Create Coding Problem
├── Create MCQ
├── Create Written Problem
├── Add Test Cases
├── Update Problem
└── Delete Problem

Assessments
├── Create
├── Add Problems
├── Remove Problems
├── Update
├── Publish
├── Unpublish
└── Get Assessment

Invitations
├── Create
├── Accept
├── Reject
└── Get Invitations

Attempts
├── Start
├── Get Attempt
├── Submit
├── Complete
└── Expiration

Submissions
├── Create
├── Get
├── Update
└── Evaluate

Evaluation
├── Evaluate Coding
├── Evaluate Written
└── Add Feedback

Results
├── Get Result
├── Calculate Score
├── Percentage
└── Statistics

Subscription
├── Create Subscription
├── Create Payment
├── Execute Payment
├── Payment Callback
├── Activate Subscription
└── Refund
```

---

# ⭐ Key Design Principles

The project follows several backend engineering principles:

```text
Separation of Concerns
        +
Modular Architecture
        +
Type Safety
        +
Input Validation
        +
Centralized Error Handling
        +
Role-Based Authorization
        +
Secure Authentication
        +
Database Integrity
```

---

# 🤝 Contributing

Contributions are welcome.

### 1. Fork the repository

```bash
git fork
```

### 2. Create a feature branch

```bash
git checkout -b feature/new-feature
```

### 3. Commit your changes

```bash
git add .
git commit -m "feat: add new feature"
```

### 4. Push the branch

```bash
git push origin feature/new-feature
```

### 5. Open a Pull Request

---

# 👨‍💻 Author

## Md. Yeasin Mazumder

**Backend Developer | Full-Stack Enthusiast**

Passionate about:

* Building Scalable APIs
* Backend Architecture
* System Design
* Clean Code
* Problem Solving
---

## 📫 Connect With Me

* LinkedIn: [Md. Yeasin Mazumder](https://www.linkedin.com/in/mdyeasinmazumder)
* Portfolio: [Portfolio](https://riyad-dev-i3aj.vercel.app/)

---

# ⭐ Support

If you find this project useful, consider giving it a ⭐ on GitHub.

---

## 🚀 Project Status

**Status:** Active Development

This project is continuously evolving with new backend features, performance improvements, security enhancements, and DevOps practices.
