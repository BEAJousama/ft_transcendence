/*
  Warnings:

  - You are about to drop the column `channelMemberId` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `userMemberId` on the `Message` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_channelMemberId_userMemberId_fkey";

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "channelMemberId",
DROP COLUMN "userMemberId";

-- CreateTable
CREATE TABLE "MessageOnChMembers" (
    "channelId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "messageId" INTEGER NOT NULL,

    CONSTRAINT "MessageOnChMembers_pkey" PRIMARY KEY ("channelId","userId","messageId")
);

-- AddForeignKey
ALTER TABLE "MessageOnChMembers" ADD CONSTRAINT "MessageOnChMembers_channelId_userId_fkey" FOREIGN KEY ("channelId", "userId") REFERENCES "ChannelMember"("channelId", "userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageOnChMembers" ADD CONSTRAINT "MessageOnChMembers_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
