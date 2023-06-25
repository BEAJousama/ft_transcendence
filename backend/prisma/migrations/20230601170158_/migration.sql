-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_pinnerId_fkey";

-- AlterTable
ALTER TABLE "Message" ALTER COLUMN "pinned" DROP NOT NULL,
ALTER COLUMN "pinnerId" DROP NOT NULL,
ALTER COLUMN "pinnerId" DROP DEFAULT;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_pinnerId_fkey" FOREIGN KEY ("pinnerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
