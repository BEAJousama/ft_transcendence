/*
  Warnings:

  - You are about to drop the column `duration` on the `Game` table. All the data in the column will be lost.
  - You are about to drop the `Player` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Game" DROP CONSTRAINT "Game_player1Id_fkey";

-- DropForeignKey
ALTER TABLE "Game" DROP CONSTRAINT "Game_player2Id_fkey";

-- DropForeignKey
ALTER TABLE "Player" DROP CONSTRAINT "Player_playerId_fkey";

-- AlterTable
ALTER TABLE "Game" DROP COLUMN "duration",
ADD COLUMN     "player1Score" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "player2Score" INTEGER NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE "Player";

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_player1Id_fkey" FOREIGN KEY ("player1Id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_player2Id_fkey" FOREIGN KEY ("player2Id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
