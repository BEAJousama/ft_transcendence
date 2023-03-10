/*
  Warnings:

  - A unique constraint covering the columns `[senderId]` on the table `Friend` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[receiverId]` on the table `Friend` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Friend_senderId_key" ON "Friend"("senderId");

-- CreateIndex
CREATE UNIQUE INDEX "Friend_receiverId_key" ON "Friend"("receiverId");
