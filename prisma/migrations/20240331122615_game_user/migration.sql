/*
  Warnings:

  - You are about to drop the `Review` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "Score" ADD COLUMN "review" TEXT;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Review";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "GameUser" (
    "userId" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "ignored" BOOLEAN NOT NULL,
    "bookmarked" BOOLEAN NOT NULL,

    PRIMARY KEY ("userId", "gameId"),
    CONSTRAINT "GameUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "GameUser_gameId_idx" ON "GameUser"("gameId");

-- CreateIndex
CREATE INDEX "Score_gameId_idx" ON "Score"("gameId");
