/*
  Warnings:

  - You are about to drop the column `tokenEmailVerifiedId` on the `User` table. All the data in the column will be lost.
  - Added the required column `expiresAt` to the `tokenEmailVerified` table without a default value. This is not possible if the table is not empty.
  - Added the required column `token` to the `tokenEmailVerified` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "tokenEmailVerifiedId",
ADD COLUMN     "googleId" TEXT;

-- AlterTable
ALTER TABLE "tokenEmailVerified" ADD COLUMN     "expiresAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "token" TEXT NOT NULL;
