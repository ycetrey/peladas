-- AlterTable: Venue
ALTER TABLE "Venue" ADD COLUMN IF NOT EXISTS "googlePlaceId" TEXT;
ALTER TABLE "Venue" ADD COLUMN IF NOT EXISTS "createdByUserId" UUID;

-- AlterTable: Group
ALTER TABLE "Group" ADD COLUMN IF NOT EXISTS "createdByUserId" UUID;

-- Backfill owner: prefer first admin, else any user
UPDATE "Venue" v
SET "createdByUserId" = sub.id
FROM (
  SELECT id FROM "User" WHERE "isAdmin" = true ORDER BY "createdAt" ASC LIMIT 1
) sub
WHERE v."createdByUserId" IS NULL
  AND EXISTS (SELECT 1 FROM "User" WHERE "isAdmin" = true LIMIT 1);

UPDATE "Venue" v
SET "createdByUserId" = sub.id
FROM (SELECT id FROM "User" ORDER BY "createdAt" ASC LIMIT 1) sub
WHERE v."createdByUserId" IS NULL
  AND EXISTS (SELECT 1 FROM "User" LIMIT 1);

UPDATE "Group" g
SET "createdByUserId" = sub.id
FROM (
  SELECT id FROM "User" WHERE "isAdmin" = true ORDER BY "createdAt" ASC LIMIT 1
) sub
WHERE g."createdByUserId" IS NULL
  AND EXISTS (SELECT 1 FROM "User" WHERE "isAdmin" = true LIMIT 1);

UPDATE "Group" g
SET "createdByUserId" = sub.id
FROM (SELECT id FROM "User" ORDER BY "createdAt" ASC LIMIT 1) sub
WHERE g."createdByUserId" IS NULL
  AND EXISTS (SELECT 1 FROM "User" LIMIT 1);

CREATE UNIQUE INDEX IF NOT EXISTS "Venue_createdBy_googlePlaceId_key"
  ON "Venue" ("createdByUserId", "googlePlaceId")
  WHERE "googlePlaceId" IS NOT NULL;

CREATE INDEX IF NOT EXISTS "Venue_createdByUserId_idx" ON "Venue" ("createdByUserId");
CREATE INDEX IF NOT EXISTS "Group_createdByUserId_idx" ON "Group" ("createdByUserId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Venue_createdByUserId_fkey'
  ) THEN
    ALTER TABLE "Venue" ADD CONSTRAINT "Venue_createdByUserId_fkey"
      FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Group_createdByUserId_fkey'
  ) THEN
    ALTER TABLE "Group" ADD CONSTRAINT "Group_createdByUserId_fkey"
      FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;
