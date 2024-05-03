-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Score" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "review" TEXT,
    CONSTRAINT "Score_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Score_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "BggGame" ("externalId") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Score" ("createdAt", "gameId", "id", "review", "updatedAt", "userId", "value") SELECT "createdAt", "gameId", "id", "review", "updatedAt", "userId", "value" FROM "Score";
DROP TABLE "Score";
ALTER TABLE "new_Score" RENAME TO "Score";
CREATE INDEX "Score_gameId_idx" ON "Score"("gameId");
CREATE UNIQUE INDEX "Score_userId_gameId_key" ON "Score"("userId", "gameId");
CREATE TABLE "new_GameUser" (
    "userId" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "ignored" BOOLEAN NOT NULL,
    "bookmarked" BOOLEAN NOT NULL,

    PRIMARY KEY ("userId", "gameId"),
    CONSTRAINT "GameUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "GameUser_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "BggGame" ("externalId") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_GameUser" ("bookmarked", "gameId", "ignored", "userId") SELECT "bookmarked", "gameId", "ignored", "userId" FROM "GameUser";
DROP TABLE "GameUser";
ALTER TABLE "new_GameUser" RENAME TO "GameUser";
CREATE INDEX "GameUser_gameId_idx" ON "GameUser"("gameId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE INDEX "User_username_idx" ON "User"("username");
