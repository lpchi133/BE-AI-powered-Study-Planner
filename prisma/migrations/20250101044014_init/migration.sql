-- AlterTable
ALTER TABLE "FocusSession" ALTER COLUMN "startedAt" DROP DEFAULT,
ALTER COLUMN "startedAt" SET DATA TYPE TEXT,
ALTER COLUMN "endedAt" SET DATA TYPE TEXT;
