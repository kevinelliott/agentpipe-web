-- CreateEnum
CREATE TYPE "ConversationStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'INTERRUPTED', 'ERROR');

-- CreateTable
CREATE TABLE "conversations" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "status" "ConversationStatus" NOT NULL DEFAULT 'ACTIVE',
    "name" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "maxTurns" INTEGER,
    "initialPrompt" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'web',
    "agentpipeVersion" TEXT,
    "systemOS" TEXT,
    "systemOSVersion" TEXT,
    "systemGoVersion" TEXT,
    "systemArchitecture" TEXT,
    "containerId" TEXT,
    "containerStatus" TEXT,
    "errorMessage" TEXT,
    "errorStack" TEXT,
    "totalMessages" INTEGER NOT NULL DEFAULT 0,
    "totalTokens" INTEGER NOT NULL DEFAULT 0,
    "totalCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalDuration" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "agentName" TEXT NOT NULL,
    "agentType" TEXT NOT NULL,
    "agentVersion" TEXT,
    "content" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sequenceNumber" INTEGER,
    "turnNumber" INTEGER,
    "duration" INTEGER,
    "inputTokens" INTEGER,
    "outputTokens" INTEGER,
    "totalTokens" INTEGER,
    "model" TEXT,
    "cost" DOUBLE PRECISION,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversation_agents" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "agentType" TEXT NOT NULL,
    "agentName" TEXT NOT NULL,
    "agentVersion" TEXT,
    "model" TEXT,
    "prompt" TEXT,
    "announcement" TEXT,
    "cliVersion" TEXT,
    "settings" JSONB,

    CONSTRAINT "conversation_agents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" TEXT NOT NULL,
    "conversationId" TEXT,
    "data" JSONB NOT NULL,
    "errorMessage" TEXT,
    "errorStack" TEXT,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "settings" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "dataType" TEXT NOT NULL DEFAULT 'string',
    "userId" TEXT,
    "isValid" BOOLEAN NOT NULL DEFAULT true,
    "validatedAt" TIMESTAMP(3),

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "conversations_createdAt_idx" ON "conversations"("createdAt");

-- CreateIndex
CREATE INDEX "conversations_status_idx" ON "conversations"("status");

-- CreateIndex
CREATE INDEX "conversations_mode_idx" ON "conversations"("mode");

-- CreateIndex
CREATE INDEX "conversations_containerId_idx" ON "conversations"("containerId");

-- CreateIndex
CREATE INDEX "messages_conversationId_timestamp_idx" ON "messages"("conversationId", "timestamp");

-- CreateIndex
CREATE INDEX "messages_conversationId_sequenceNumber_idx" ON "messages"("conversationId", "sequenceNumber");

-- CreateIndex
CREATE INDEX "messages_agentType_idx" ON "messages"("agentType");

-- CreateIndex
CREATE INDEX "messages_model_idx" ON "messages"("model");

-- CreateIndex
CREATE INDEX "messages_timestamp_idx" ON "messages"("timestamp");

-- CreateIndex
CREATE INDEX "conversation_agents_agentType_idx" ON "conversation_agents"("agentType");

-- CreateIndex
CREATE INDEX "conversation_agents_model_idx" ON "conversation_agents"("model");

-- CreateIndex
CREATE INDEX "conversation_agents_agentVersion_idx" ON "conversation_agents"("agentVersion");

-- CreateIndex
CREATE UNIQUE INDEX "conversation_agents_conversationId_agentId_key" ON "conversation_agents"("conversationId", "agentId");

-- CreateIndex
CREATE INDEX "events_createdAt_idx" ON "events"("createdAt");

-- CreateIndex
CREATE INDEX "events_type_idx" ON "events"("type");

-- CreateIndex
CREATE INDEX "events_conversationId_idx" ON "events"("conversationId");

-- CreateIndex
CREATE INDEX "settings_category_idx" ON "settings"("category");

-- CreateIndex
CREATE INDEX "settings_userId_idx" ON "settings"("userId");

-- CreateIndex
CREATE INDEX "settings_key_idx" ON "settings"("key");

-- CreateIndex
CREATE UNIQUE INDEX "settings_key_userId_key" ON "settings"("key", "userId");

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_agents" ADD CONSTRAINT "conversation_agents_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
