/*
  Warnings:

  - A unique constraint covering the columns `[userId,gameId]` on the table `Review` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,gameId]` on the table `Score` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Review_userId_gameId_key" ON "Review"("userId", "gameId");

-- CreateIndex
CREATE UNIQUE INDEX "Score_userId_gameId_key" ON "Score"("userId", "gameId");
