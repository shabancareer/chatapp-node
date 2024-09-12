-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('Admin', 'viwer');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "userType" "UserType" NOT NULL DEFAULT 'Admin';
