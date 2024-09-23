/*
  Warnings:

  - A unique constraint covering the columns `[token]` on the table `tokenEmailVerified` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "tokenEmailVerified_token_key" ON "tokenEmailVerified"("token");
