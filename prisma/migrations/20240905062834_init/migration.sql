/*
  Warnings:

  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "GroupMember" DROP CONSTRAINT "GroupMember_userId_fkey";

-- AlterTable
ALTER TABLE "GroupMember" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'Viewer',
ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "role";

-- AddForeignKey
ALTER TABLE "GroupMember" ADD CONSTRAINT "GroupMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
