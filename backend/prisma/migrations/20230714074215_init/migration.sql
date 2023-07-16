/*
  Warnings:

  - Added the required column `updatedAt` to the `Channel` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Channel" ADD COLUMN     "accessPassword" TEXT,
ADD COLUMN     "isacessPassword" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastestMessageDate" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "newMessagesCount" INTEGER DEFAULT 0,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "pinned" BOOLEAN DEFAULT false,
ADD COLUMN     "pinnerId" INTEGER;

-- CreateTable
CREATE TABLE "_pinnedChannels" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_mutedChannels" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_archivedChannels" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_deletedChannels" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_unreadChannels" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_bannedinChannels" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_mutedinChannels" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_kickedinChannels" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_admininChannels" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_pinnedChannels_AB_unique" ON "_pinnedChannels"("A", "B");

-- CreateIndex
CREATE INDEX "_pinnedChannels_B_index" ON "_pinnedChannels"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_mutedChannels_AB_unique" ON "_mutedChannels"("A", "B");

-- CreateIndex
CREATE INDEX "_mutedChannels_B_index" ON "_mutedChannels"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_archivedChannels_AB_unique" ON "_archivedChannels"("A", "B");

-- CreateIndex
CREATE INDEX "_archivedChannels_B_index" ON "_archivedChannels"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_deletedChannels_AB_unique" ON "_deletedChannels"("A", "B");

-- CreateIndex
CREATE INDEX "_deletedChannels_B_index" ON "_deletedChannels"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_unreadChannels_AB_unique" ON "_unreadChannels"("A", "B");

-- CreateIndex
CREATE INDEX "_unreadChannels_B_index" ON "_unreadChannels"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_bannedinChannels_AB_unique" ON "_bannedinChannels"("A", "B");

-- CreateIndex
CREATE INDEX "_bannedinChannels_B_index" ON "_bannedinChannels"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_mutedinChannels_AB_unique" ON "_mutedinChannels"("A", "B");

-- CreateIndex
CREATE INDEX "_mutedinChannels_B_index" ON "_mutedinChannels"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_kickedinChannels_AB_unique" ON "_kickedinChannels"("A", "B");

-- CreateIndex
CREATE INDEX "_kickedinChannels_B_index" ON "_kickedinChannels"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_admininChannels_AB_unique" ON "_admininChannels"("A", "B");

-- CreateIndex
CREATE INDEX "_admininChannels_B_index" ON "_admininChannels"("B");

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_pinnerId_fkey" FOREIGN KEY ("pinnerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_pinnedChannels" ADD CONSTRAINT "_pinnedChannels_A_fkey" FOREIGN KEY ("A") REFERENCES "Channel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_pinnedChannels" ADD CONSTRAINT "_pinnedChannels_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_mutedChannels" ADD CONSTRAINT "_mutedChannels_A_fkey" FOREIGN KEY ("A") REFERENCES "Channel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_mutedChannels" ADD CONSTRAINT "_mutedChannels_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_archivedChannels" ADD CONSTRAINT "_archivedChannels_A_fkey" FOREIGN KEY ("A") REFERENCES "Channel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_archivedChannels" ADD CONSTRAINT "_archivedChannels_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_deletedChannels" ADD CONSTRAINT "_deletedChannels_A_fkey" FOREIGN KEY ("A") REFERENCES "Channel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_deletedChannels" ADD CONSTRAINT "_deletedChannels_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_unreadChannels" ADD CONSTRAINT "_unreadChannels_A_fkey" FOREIGN KEY ("A") REFERENCES "Channel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_unreadChannels" ADD CONSTRAINT "_unreadChannels_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_bannedinChannels" ADD CONSTRAINT "_bannedinChannels_A_fkey" FOREIGN KEY ("A") REFERENCES "Channel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_bannedinChannels" ADD CONSTRAINT "_bannedinChannels_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_mutedinChannels" ADD CONSTRAINT "_mutedinChannels_A_fkey" FOREIGN KEY ("A") REFERENCES "Channel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_mutedinChannels" ADD CONSTRAINT "_mutedinChannels_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_kickedinChannels" ADD CONSTRAINT "_kickedinChannels_A_fkey" FOREIGN KEY ("A") REFERENCES "Channel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_kickedinChannels" ADD CONSTRAINT "_kickedinChannels_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_admininChannels" ADD CONSTRAINT "_admininChannels_A_fkey" FOREIGN KEY ("A") REFERENCES "Channel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_admininChannels" ADD CONSTRAINT "_admininChannels_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
