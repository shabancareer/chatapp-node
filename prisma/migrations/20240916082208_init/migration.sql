/*
  Warnings:

  - You are about to drop the column `verified` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "verified",
ADD COLUMN     "tokenEmailVerifiedId" INTEGER;

-- CreateTable
CREATE TABLE "tokenEmailVerified" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,

    CONSTRAINT "tokenEmailVerified_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_tokenEmailVerifiedId_fkey" FOREIGN KEY ("tokenEmailVerifiedId") REFERENCES "tokenEmailVerified"("id") ON DELETE SET NULL ON UPDATE CASCADE;
