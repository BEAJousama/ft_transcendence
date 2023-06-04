-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "pinnerId" INTEGER NOT NULL DEFAULT 0;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_pinnerId_fkey" FOREIGN KEY ("pinnerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
