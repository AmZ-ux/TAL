-- CreateEnum
CREATE TYPE "public"."Status" AS ENUM ('PENDING', 'PAID', 'OVERDUE');

-- CreateTable
CREATE TABLE "public"."MonthlyFee" (
    "id" TEXT NOT NULL,
    "passengerId" TEXT NOT NULL,
    "referenceMonth" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "status" "public"."Status" NOT NULL DEFAULT 'PENDING',
    "paymentDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MonthlyFee_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MonthlyFee_passengerId_referenceMonth_key" ON "public"."MonthlyFee"("passengerId", "referenceMonth");

-- AddForeignKey
ALTER TABLE "public"."MonthlyFee" ADD CONSTRAINT "MonthlyFee_passengerId_fkey" FOREIGN KEY ("passengerId") REFERENCES "public"."PassengerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
