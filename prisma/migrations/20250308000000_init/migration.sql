-- CreateEnum
CREATE TYPE "Plan" AS ENUM ('STARTER', 'RETAINER', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "StudyStatus" AS ENUM ('DRAFT', 'ACTIVE', 'CLOSED');

-- CreateEnum
CREATE TYPE "ParticipantMode" AS ENUM ('LIVE_IAT', 'PASSIVE_INTELLIGENCE');

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "plan" "Plan" NOT NULL DEFAULT 'STARTER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "businessType" TEXT,
    "industry" TEXT,
    "targetMarket" TEXT,
    "calendlyUrl" TEXT,
    "slackWebhook" TEXT,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Study" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "StudyStatus" NOT NULL DEFAULT 'DRAFT',
    "shareToken" TEXT NOT NULL,
    "config" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "participantMode" "ParticipantMode" NOT NULL DEFAULT 'LIVE_IAT',
    "passiveJobStatus" TEXT,
    "passiveJobProgress" JSONB,
    "diyToolkitUrl" TEXT,

    CONSTRAINT "Study_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "studyId" TEXT NOT NULL,
    "participantCode" TEXT NOT NULL,
    "deviceInfo" JSONB,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "isValid" BOOLEAN,
    "dScore" DOUBLE PRECISION,
    "dScoreLabel" TEXT,
    "invalidReason" TEXT,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trial" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "blockIndex" INTEGER NOT NULL,
    "trialIndex" INTEGER NOT NULL,
    "stimulus" TEXT NOT NULL,
    "stimulusType" TEXT NOT NULL,
    "correctKey" TEXT NOT NULL,
    "pressedKey" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "reactionTimeMs" INTEGER NOT NULL,
    "hadError" BOOLEAN NOT NULL,
    "errorPenaltyMs" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Trial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PassiveSample" (
    "id" TEXT NOT NULL,
    "studyId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "rawText" TEXT NOT NULL,
    "url" TEXT,
    "collectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "conceptA_score" DOUBLE PRECISION,
    "conceptB_score" DOUBLE PRECISION,
    "valenceScore" DOUBLE PRECISION,
    "linguisticMarkers" JSONB,
    "isValid" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "PassiveSample_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StrategyReport" (
    "id" TEXT NOT NULL,
    "studyId" TEXT NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reportData" JSONB NOT NULL,
    "pdfUrl" TEXT,
    "toolkitUrl" TEXT,
    "diyRequested" BOOLEAN NOT NULL DEFAULT false,
    "dfyRequested" BOOLEAN NOT NULL DEFAULT false,
    "dfyRequestedAt" TIMESTAMP(3),
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "StrategyReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Client_email_key" ON "Client"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Study_shareToken_key" ON "Study"("shareToken");

-- AddForeignKey
ALTER TABLE "Study" ADD CONSTRAINT "Study_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_studyId_fkey" FOREIGN KEY ("studyId") REFERENCES "Study"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trial" ADD CONSTRAINT "Trial_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PassiveSample" ADD CONSTRAINT "PassiveSample_studyId_fkey" FOREIGN KEY ("studyId") REFERENCES "Study"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StrategyReport" ADD CONSTRAINT "StrategyReport_studyId_fkey" FOREIGN KEY ("studyId") REFERENCES "Study"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
