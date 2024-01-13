-- CreateTable
CREATE TABLE "Review" (
    "userEmail" TEXT NOT NULL PRIMARY KEY,
    "gameId" TEXT NOT NULL,
    "content" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Score" (
    "userEmail" TEXT NOT NULL PRIMARY KEY,
    "gameId" TEXT NOT NULL,
    "value" INTEGER NOT NULL
);
