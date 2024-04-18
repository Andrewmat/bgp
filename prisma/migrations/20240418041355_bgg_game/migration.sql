-- CreateTable
CREATE TABLE "BggGame" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "externalId" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "thumbnail" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "minPlayers" INTEGER NOT NULL,
    "maxPlayers" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "BggGame_externalId_key" ON "BggGame"("externalId");

-- CreateIndex
CREATE INDEX "BggGame_externalId_idx" ON "BggGame"("externalId");
