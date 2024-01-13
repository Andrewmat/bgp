/*
  Warnings:

  - The primary key for the `Review` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Score` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Review" (
    "userEmail" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "content" TEXT NOT NULL,

    PRIMARY KEY ("userEmail", "gameId")
);
INSERT INTO "new_Review" ("content", "gameId", "userEmail") SELECT "content", "gameId", "userEmail" FROM "Review";
DROP TABLE "Review";
ALTER TABLE "new_Review" RENAME TO "Review";
CREATE TABLE "new_Score" (
    "userEmail" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "value" INTEGER NOT NULL,

    PRIMARY KEY ("userEmail", "gameId")
);
INSERT INTO "new_Score" ("gameId", "userEmail", "value") SELECT "gameId", "userEmail", "value" FROM "Score";
DROP TABLE "Score";
ALTER TABLE "new_Score" RENAME TO "Score";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
