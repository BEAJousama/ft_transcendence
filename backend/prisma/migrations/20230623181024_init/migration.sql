/*
  Warnings:

  - You are about to drop the column `isArchived` on the `ChannelMember` table. All the data in the column will be lost.
  - You are about to drop the column `isBanned` on the `ChannelMember` table. All the data in the column will be lost.
  - You are about to drop the column `isDeleted` on the `ChannelMember` table. All the data in the column will be lost.
  - You are about to drop the column `isKicked` on the `ChannelMember` table. All the data in the column will be lost.
  - You are about to drop the column `isMuted` on the `ChannelMember` table. All the data in the column will be lost.
  - You are about to drop the column `isPinned` on the `ChannelMember` table. All the data in the column will be lost.
  - You are about to drop the column `isUnread` on the `ChannelMember` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Channel" ADD COLUMN     "accessPassword" TEXT;

-- AlterTable
ALTER TABLE "ChannelMember" DROP COLUMN "isArchived",
DROP COLUMN "isBanned",
DROP COLUMN "isDeleted",
DROP COLUMN "isKicked",
DROP COLUMN "isMuted",
DROP COLUMN "isPinned",
DROP COLUMN "isUnread";
