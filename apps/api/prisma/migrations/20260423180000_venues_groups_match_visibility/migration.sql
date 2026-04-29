-- CreateEnum
CREATE TYPE "MatchVisibility" AS ENUM ('PUBLIC', 'GROUP');

-- CreateTable
CREATE TABLE "Venue" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "locality" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Venue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Group" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupMember" (
    "id" UUID NOT NULL,
    "groupId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GroupMember_pkey" PRIMARY KEY ("id")
);

-- Default venue for existing matches (fixed id for seeds/tests)
INSERT INTO "Venue" ("id", "name", "locality", "createdAt", "updatedAt")
VALUES (
    '00000000-0000-4000-8000-0000000000a0',
    'Sem local',
    NULL,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- AlterTable
ALTER TABLE "Match" ADD COLUMN "venueId" UUID;
ALTER TABLE "Match" ADD COLUMN "visibility" "MatchVisibility" NOT NULL DEFAULT 'PUBLIC';
ALTER TABLE "Match" ADD COLUMN "groupId" UUID;

UPDATE "Match" SET "venueId" = '00000000-0000-4000-8000-0000000000a0' WHERE "venueId" IS NULL;

ALTER TABLE "Match" ALTER COLUMN "venueId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Match" ADD CONSTRAINT "Match_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupMember" ADD CONSTRAINT "GroupMember_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "GroupMember" ADD CONSTRAINT "GroupMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateIndex
CREATE UNIQUE INDEX "GroupMember_groupId_userId_key" ON "GroupMember"("groupId", "userId");

CREATE INDEX "GroupMember_userId_idx" ON "GroupMember"("userId");
