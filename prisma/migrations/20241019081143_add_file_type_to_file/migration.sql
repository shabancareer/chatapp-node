/*
  Warnings:

  - You are about to drop the column `type` on the `File` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `File` table. All the data in the column will be lost.
  - Added the required column `fileType` to the `File` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "File" DROP CONSTRAINT "File_chatId_fkey";

-- AlterTable
ALTER TABLE "File" DROP COLUMN "type",
DROP COLUMN "updatedAt",
ADD COLUMN     "fileSize" INTEGER,
ADD COLUMN     "fileType" TEXT NOT NULL,
ALTER COLUMN "chatId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE SET NULL ON UPDATE CASCADE;
