-- CreateEnum
CREATE TYPE "ResultStatus" AS ENUM ('PASS', 'FAIL');

-- CreateTable
CREATE TABLE "Result" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "totalMarks" INTEGER NOT NULL,
    "obtainedMarks" INTEGER NOT NULL,
    "percentage" DOUBLE PRECISION NOT NULL,
    "status" "ResultStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Result_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResultItem" (
    "id" TEXT NOT NULL,
    "resultId" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "maximumMarks" INTEGER NOT NULL,
    "obtainedMarks" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ResultItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Result_attemptId_key" ON "Result"("attemptId");

-- CreateIndex
CREATE INDEX "Result_status_idx" ON "Result"("status");

-- CreateIndex
CREATE INDEX "ResultItem_problemId_idx" ON "ResultItem"("problemId");

-- CreateIndex
CREATE UNIQUE INDEX "ResultItem_resultId_problemId_key" ON "ResultItem"("resultId", "problemId");

-- AddForeignKey
ALTER TABLE "Result" ADD CONSTRAINT "Result_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "Attempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResultItem" ADD CONSTRAINT "ResultItem_resultId_fkey" FOREIGN KEY ("resultId") REFERENCES "Result"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResultItem" ADD CONSTRAINT "ResultItem_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
