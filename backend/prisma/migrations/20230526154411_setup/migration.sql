-- CreateTable
CREATE TABLE "_unreadChannels" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_unreadChannels_AB_unique" ON "_unreadChannels"("A", "B");

-- CreateIndex
CREATE INDEX "_unreadChannels_B_index" ON "_unreadChannels"("B");

-- AddForeignKey
ALTER TABLE "_unreadChannels" ADD CONSTRAINT "_unreadChannels_A_fkey" FOREIGN KEY ("A") REFERENCES "Channel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_unreadChannels" ADD CONSTRAINT "_unreadChannels_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
