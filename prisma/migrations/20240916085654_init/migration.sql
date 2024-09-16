/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `tokenEmailVerified` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `tokenEmailVerified` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "emailVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "tokenEmailVerifiedId" INTEGER;

-- AlterTable
ALTER TABLE "tokenEmailVerified" ADD COLUMN     "userId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "tokenEmailVerified_userId_key" ON "tokenEmailVerified"("userId");

-- AddForeignKey
ALTER TABLE "tokenEmailVerified" ADD CONSTRAINT "tokenEmailVerified_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
