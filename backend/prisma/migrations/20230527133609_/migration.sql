/*
  Warnings:

  - You are about to drop the `_bannedChannels` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_bannedChannels" DROP CONSTRAINT "_bannedChannels_A_fkey";

-- DropForeignKey
ALTER TABLE "_bannedChannels" DROP CONSTRAINT "_bannedChannels_B_fkey";

-- DropTable
DROP TABLE "_bannedChannels";

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
CREATE TABLE "_admininChannels" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_bannedinChannels_AB_unique" ON "_bannedinChannels"("A", "B");

-- CreateIndex
CREATE INDEX "_bannedinChannels_B_index" ON "_bannedinChannels"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_mutedinChannels_AB_unique" ON "_mutedinChannels"("A", "B");

-- CreateIndex
CREATE INDEX "_mutedinChannels_B_index" ON "_mutedinChannels"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_admininChannels_AB_unique" ON "_admininChannels"("A", "B");

-- CreateIndex
CREATE INDEX "_admininChannels_B_index" ON "_admininChannels"("B");

-- AddForeignKey
ALTER TABLE "_bannedinChannels" ADD CONSTRAINT "_bannedinChannels_A_fkey" FOREIGN KEY ("A") REFERENCES "Channel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_bannedinChannels" ADD CONSTRAINT "_bannedinChannels_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_mutedinChannels" ADD CONSTRAINT "_mutedinChannels_A_fkey" FOREIGN KEY ("A") REFERENCES "Channel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_mutedinChannels" ADD CONSTRAINT "_mutedinChannels_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_admininChannels" ADD CONSTRAINT "_admininChannels_A_fkey" FOREIGN KEY ("A") REFERENCES "Channel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_admininChannels" ADD CONSTRAINT "_admininChannels_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
