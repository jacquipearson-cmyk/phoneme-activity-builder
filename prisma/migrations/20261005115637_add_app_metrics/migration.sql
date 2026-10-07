-- CreateTable
CREATE TABLE "ActivityStats" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "activityId" INTEGER NOT NULL,
    "successfulGenerations" INTEGER NOT NULL DEFAULT 0,
    "failedGenerations" INTEGER NOT NULL DEFAULT 0,
    "totalViews" INTEGER NOT NULL DEFAULT 0,
    "totalTimeOnPageMs" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "ActivityStats_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AppMetrics" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "totalActivities" INTEGER NOT NULL DEFAULT 0,
    "totalWordleActivities" INTEGER NOT NULL DEFAULT 0,
    "totalWordSearchActivities" INTEGER NOT NULL DEFAULT 0,
    "totalGeneratedOutputs" INTEGER NOT NULL DEFAULT 0
);

-- CreateIndex
CREATE UNIQUE INDEX "ActivityStats_activityId_key" ON "ActivityStats"("activityId");
