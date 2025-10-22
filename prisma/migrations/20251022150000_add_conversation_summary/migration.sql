-- AddConversationSummary
-- Adds AI-generated conversation summary fields to the conversations table

-- Add summary text field
ALTER TABLE "conversations" ADD COLUMN "summaryText" TEXT;

-- Add summary metadata fields
ALTER TABLE "conversations" ADD COLUMN "summaryAgentType" TEXT;
ALTER TABLE "conversations" ADD COLUMN "summaryModel" TEXT;
ALTER TABLE "conversations" ADD COLUMN "summaryInputTokens" INTEGER;
ALTER TABLE "conversations" ADD COLUMN "summaryOutputTokens" INTEGER;
ALTER TABLE "conversations" ADD COLUMN "summaryTotalTokens" INTEGER;
ALTER TABLE "conversations" ADD COLUMN "summaryCost" DOUBLE PRECISION;
ALTER TABLE "conversations" ADD COLUMN "summaryDuration" INTEGER;
ALTER TABLE "conversations" ADD COLUMN "summaryGeneratedAt" TIMESTAMP(3);

-- Add summary data JSON field for full summary object storage
ALTER TABLE "conversations" ADD COLUMN "summaryData" JSONB;
