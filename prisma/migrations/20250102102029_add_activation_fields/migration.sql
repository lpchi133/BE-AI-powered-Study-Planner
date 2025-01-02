-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "activationToken" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT false;
