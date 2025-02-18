/*
  Warnings:

  - You are about to drop the column `content` on the `Chat` table. All the data in the column will be lost.
  - You are about to drop the column `isRead` on the `Chat` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Chat" DROP COLUMN "content",
DROP COLUMN "isRead";

-- AlterTable
ALTER TABLE "File" ADD COLUMN     "messageId" INTEGER;

-- CreateTable
CREATE TABLE "Message" (
    "id" SERIAL NOT NULL,
    "chatId" INTEGER NOT NULL,
    "senderId" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE SET NULL ON UPDATE CASCADE;
