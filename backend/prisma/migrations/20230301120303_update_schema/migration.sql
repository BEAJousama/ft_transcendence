/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Channel` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Channel` table. All the data in the column will be lost.
  - The primary key for the `ChannelMember` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `createdAt` on the `ChannelMember` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `ChannelMember` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `ChannelMember` table. All the data in the column will be lost.
  - You are about to drop the column `authorId` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `channelId` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `username` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[login]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[nickname]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `avatar` to the `Channel` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Channel` table without a default value. This is not possible if the table is not empty.
  - Added the required column `receiverId` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `senderId` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `avatar` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `login` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nickname` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tfaSecret` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ONLINE', 'INGAME', 'OFFLINE');

-- CreateEnum
CREATE TYPE "Ladder" AS ENUM ('BEGINNER', 'AMATEUR', 'SEMI_PROFESSIONAL', 'PROFESSIONAL', 'WORLD_CLASS', 'LEGENDARY');

-- CreateEnum
CREATE TYPE "Visiblity" AS ENUM ('PUBLIC', 'PRIVATE', 'PROTECTED');

-- CreateEnum
CREATE TYPE "ChannelType" AS ENUM ('GROUP', 'CONVERSATION');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('MEMEBER', 'ADMIN');

-- CreateEnum
CREATE TYPE "MemberStatus" AS ENUM ('MUTED', 'BANNED', 'ACTIVE');

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_authorId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_channelId_fkey";

-- DropIndex
DROP INDEX "User_email_key";

-- DropIndex
DROP INDEX "User_username_key";

-- AlterTable
ALTER TABLE "Channel" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "avatar" TEXT NOT NULL,
ADD COLUMN     "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "password" TEXT,
ADD COLUMN     "type" "ChannelType" NOT NULL DEFAULT 'GROUP',
ADD COLUMN     "userId" INTEGER NOT NULL,
ADD COLUMN     "visiblity" "Visiblity" NOT NULL DEFAULT 'PUBLIC';

-- AlterTable
ALTER TABLE "ChannelMember" DROP CONSTRAINT "ChannelMember_pkey",
DROP COLUMN "createdAt",
DROP COLUMN "id",
DROP COLUMN "updatedAt",
ADD COLUMN     "banDuration" INTEGER,
ADD COLUMN     "banStartTime" TIMESTAMP(3),
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'MEMEBER',
ADD COLUMN     "status" "MemberStatus" NOT NULL DEFAULT 'ACTIVE',
ADD CONSTRAINT "ChannelMember_pkey" PRIMARY KEY ("userId", "channelId");

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "authorId",
DROP COLUMN "channelId",
DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "receiverId" INTEGER NOT NULL,
ADD COLUMN     "senderId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "email",
DROP COLUMN "name",
DROP COLUMN "password",
DROP COLUMN "username",
ADD COLUMN     "avatar" TEXT NOT NULL,
ADD COLUMN     "ladder" "Ladder" NOT NULL DEFAULT 'BEGINNER',
ADD COLUMN     "login" TEXT NOT NULL,
ADD COLUMN     "losses" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "nickname" TEXT NOT NULL,
ADD COLUMN     "rating" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "status" "UserStatus" NOT NULL DEFAULT 'OFFLINE',
ADD COLUMN     "tfaSecret" TEXT NOT NULL,
ADD COLUMN     "twoFactorAuth" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "wins" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "Achievement" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "image" TEXT,

    CONSTRAINT "Achievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Block" (
    "blockerId" INTEGER NOT NULL,
    "blockingId" INTEGER NOT NULL,

    CONSTRAINT "Block_pkey" PRIMARY KEY ("blockerId","blockingId")
);

-- CreateTable
CREATE TABLE "_AchievementPlayers" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_AchievementPlayers_AB_unique" ON "_AchievementPlayers"("A", "B");

-- CreateIndex
CREATE INDEX "_AchievementPlayers_B_index" ON "_AchievementPlayers"("B");

-- CreateIndex
CREATE UNIQUE INDEX "User_login_key" ON "User"("login");

-- CreateIndex
CREATE UNIQUE INDEX "User_nickname_key" ON "User"("nickname");

-- AddForeignKey
ALTER TABLE "Block" ADD CONSTRAINT "Block_blockerId_fkey" FOREIGN KEY ("blockerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Block" ADD CONSTRAINT "Block_blockingId_fkey" FOREIGN KEY ("blockingId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Channel" ADD CONSTRAINT "Channel_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "Channel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AchievementPlayers" ADD CONSTRAINT "_AchievementPlayers_A_fkey" FOREIGN KEY ("A") REFERENCES "Achievement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AchievementPlayers" ADD CONSTRAINT "_AchievementPlayers_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
