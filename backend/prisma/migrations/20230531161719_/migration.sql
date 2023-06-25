/*
  Warnings:

  - Added the required column `channelMemberId` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userMemberId` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "channelMemberId" INTEGER NOT NULL,
ADD COLUMN     "userMemberId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_channelMemberId_userMemberId_fkey" FOREIGN KEY ("channelMemberId", "userMemberId") REFERENCES "ChannelMember"("userId", "channelId") ON DELETE RESTRICT ON UPDATE CASCADE;
