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
CREATE TABLE "_bannedChannels" (
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

-- CreateIndex
CREATE UNIQUE INDEX "_pinnedChannels_AB_unique" ON "_pinnedChannels"("A", "B");

-- CreateIndex
CREATE INDEX "_pinnedChannels_B_index" ON "_pinnedChannels"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_mutedChannels_AB_unique" ON "_mutedChannels"("A", "B");

-- CreateIndex
CREATE INDEX "_mutedChannels_B_index" ON "_mutedChannels"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_bannedChannels_AB_unique" ON "_bannedChannels"("A", "B");

-- CreateIndex
CREATE INDEX "_bannedChannels_B_index" ON "_bannedChannels"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_archivedChannels_AB_unique" ON "_archivedChannels"("A", "B");

-- CreateIndex
CREATE INDEX "_archivedChannels_B_index" ON "_archivedChannels"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_deletedChannels_AB_unique" ON "_deletedChannels"("A", "B");

-- CreateIndex
CREATE INDEX "_deletedChannels_B_index" ON "_deletedChannels"("B");

-- AddForeignKey
ALTER TABLE "_pinnedChannels" ADD CONSTRAINT "_pinnedChannels_A_fkey" FOREIGN KEY ("A") REFERENCES "Channel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_pinnedChannels" ADD CONSTRAINT "_pinnedChannels_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_mutedChannels" ADD CONSTRAINT "_mutedChannels_A_fkey" FOREIGN KEY ("A") REFERENCES "Channel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_mutedChannels" ADD CONSTRAINT "_mutedChannels_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_bannedChannels" ADD CONSTRAINT "_bannedChannels_A_fkey" FOREIGN KEY ("A") REFERENCES "Channel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_bannedChannels" ADD CONSTRAINT "_bannedChannels_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_archivedChannels" ADD CONSTRAINT "_archivedChannels_A_fkey" FOREIGN KEY ("A") REFERENCES "Channel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_archivedChannels" ADD CONSTRAINT "_archivedChannels_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_deletedChannels" ADD CONSTRAINT "_deletedChannels_A_fkey" FOREIGN KEY ("A") REFERENCES "Channel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_deletedChannels" ADD CONSTRAINT "_deletedChannels_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
