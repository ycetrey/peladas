-- AlterTable
ALTER TABLE "User" ADD COLUMN     "email" TEXT,
ADD COLUMN     "passwordHash" TEXT;

-- Backfill existing users (bcrypt hash for password: `password`)
UPDATE "User"
SET
  "email" = "id"::text || '@migrated.peladas',
  "passwordHash" = '$2b$10$6oupqCJIgLYxFbS1bCeaKObpoKWyAPn42/fsWboQr9cgm32yJHQE2'
WHERE "email" IS NULL;

ALTER TABLE "User" ALTER COLUMN "email" SET NOT NULL;
ALTER TABLE "User" ALTER COLUMN "passwordHash" SET NOT NULL;

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
