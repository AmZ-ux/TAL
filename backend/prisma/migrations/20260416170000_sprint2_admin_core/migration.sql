-- CreateEnum
CREATE TYPE "public"."InstitutionStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "public"."PassengerStatus" AS ENUM ('PAID', 'PENDING', 'OVERDUE');

-- CreateTable
CREATE TABLE "public"."Institution" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "public"."InstitutionStatus" NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Institution_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "public"."PassengerProfile"
    ALTER COLUMN "userId" DROP NOT NULL,
    ADD COLUMN "phone" TEXT,
    ADD COLUMN "email" TEXT,
    ADD COLUMN "course" TEXT,
    ADD COLUMN "shift" TEXT,
    ADD COLUMN "boardingPoint" TEXT,
    ADD COLUMN "notes" TEXT,
    ADD COLUMN "status" "public"."PassengerStatus" NOT NULL DEFAULT 'PENDING',
    ADD COLUMN "institutionId" TEXT;

-- Backfill defaults for existing rows
UPDATE "public"."PassengerProfile"
SET
  "phone" = COALESCE("phone", '0000000000'),
  "course" = COALESCE("course", 'Not informed'),
  "shift" = COALESCE("shift", 'Not informed'),
  "boardingPoint" = COALESCE("boardingPoint", 'Not informed')
WHERE "phone" IS NULL OR "course" IS NULL OR "shift" IS NULL OR "boardingPoint" IS NULL;

-- Ensure institution exists for backfill relation
INSERT INTO "public"."Institution" ("id", "name", "status", "notes", "createdAt", "updatedAt")
VALUES ('00000000-0000-0000-0000-000000000001', 'Default Institution', 'ACTIVE', 'Auto-created for Sprint 2 migration backfill.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

UPDATE "public"."PassengerProfile"
SET "institutionId" = '00000000-0000-0000-0000-000000000001'
WHERE "institutionId" IS NULL;

-- AlterTable enforce non-null after backfill
ALTER TABLE "public"."PassengerProfile"
    ALTER COLUMN "phone" SET NOT NULL,
    ALTER COLUMN "course" SET NOT NULL,
    ALTER COLUMN "shift" SET NOT NULL,
    ALTER COLUMN "boardingPoint" SET NOT NULL,
    ALTER COLUMN "institutionId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."PassengerProfile" ADD CONSTRAINT "PassengerProfile_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "public"."Institution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
