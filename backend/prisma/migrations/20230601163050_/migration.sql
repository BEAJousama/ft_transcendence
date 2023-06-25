/*
  Warnings:

  - You are about to drop the `MessageOnChMembers` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "MessageOnChMembers" DROP CONSTRAINT "MessageOnChMembers_channelId_userId_fkey";

-- DropForeignKey
ALTER TABLE "MessageOnChMembers" DROP CONSTRAINT "MessageOnChMembers_messageId_fkey";

-- DropTable
DROP TABLE "MessageOnChMembers";
