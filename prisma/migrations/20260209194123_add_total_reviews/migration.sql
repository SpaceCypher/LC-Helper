-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Revision" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "problemId" TEXT NOT NULL,
    "lastReviewed" DATETIME,
    "nextReview" DATETIME NOT NULL,
    "revisionCount" INTEGER NOT NULL DEFAULT 0,
    "totalReviews" INTEGER NOT NULL DEFAULT 0,
    "confidenceScore" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Revision_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Revision" ("confidenceScore", "createdAt", "id", "lastReviewed", "nextReview", "problemId", "revisionCount", "updatedAt") SELECT "confidenceScore", "createdAt", "id", "lastReviewed", "nextReview", "problemId", "revisionCount", "updatedAt" FROM "Revision";
DROP TABLE "Revision";
ALTER TABLE "new_Revision" RENAME TO "Revision";
CREATE UNIQUE INDEX "Revision_problemId_key" ON "Revision"("problemId");
CREATE INDEX "Revision_nextReview_idx" ON "Revision"("nextReview");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
