-- AlterTable
ALTER TABLE "User" ADD COLUMN     "resetpasswordtoken" TEXT,
ADD COLUMN     "resetpasswordtokenexpiry" TIMESTAMP(3);
