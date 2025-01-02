/*
  Warnings:

  - A unique constraint covering the columns `[activationToken]` on the table `Users` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Users_activationToken_key" ON "Users"("activationToken");
