/*
  Warnings:

  - You are about to drop the column `userType` on the `User` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'Viewer');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "userType",
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'Viewer';

-- DropEnum
DROP TYPE "UserType";
