-- AlterTable
ALTER TABLE "ChannelMember" ADD COLUMN     "isKicked" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "_kickedinChannels" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_kickedinChannels_AB_unique" ON "_kickedinChannels"("A", "B");

-- CreateIndex
CREATE INDEX "_kickedinChannels_B_index" ON "_kickedinChannels"("B");

-- AddForeignKey
ALTER TABLE "_kickedinChannels" ADD CONSTRAINT "_kickedinChannels_A_fkey" FOREIGN KEY ("A") REFERENCES "Channel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_kickedinChannels" ADD CONSTRAINT "_kickedinChannels_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
