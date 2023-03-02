/*
  Warnings:

  - You are about to drop the column `nickname` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "User_nickname_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "nickname";
