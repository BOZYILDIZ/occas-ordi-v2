-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPERADMIN', 'ADMIN');

-- CreateEnum
CREATE TYPE "ComputerType" AS ENUM ('DESKTOP', 'LAPTOP', 'ALL_IN_ONE', 'MINI_PC', 'WORKSTATION');

-- CreateEnum
CREATE TYPE "CpuBrand" AS ENUM ('INTEL', 'AMD', 'APPLE');

-- CreateEnum
CREATE TYPE "RamType" AS ENUM ('DDR3', 'DDR4', 'DDR5', 'LPDDR4', 'LPDDR5', 'UNIFIED');

-- CreateEnum
CREATE TYPE "StorageType" AS ENUM ('HDD', 'SSD_SATA', 'SSD_NVME', 'EMMC');

-- CreateEnum
CREATE TYPE "Condition" AS ENUM ('NEUF', 'RECONDITIONNE', 'OCCASION');

-- CreateEnum
CREATE TYPE "Grade" AS ENUM ('A_PLUS', 'A', 'B', 'C');

-- CreateEnum
CREATE TYPE "OsType" AS ENUM ('WINDOWS_11', 'WINDOWS_11_PRO', 'WINDOWS_10', 'WINDOWS_10_PRO', 'MACOS', 'LINUX', 'SANS_OS');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'ADMIN',
    "mfaEnabled" BOOLEAN NOT NULL DEFAULT false,
    "mfaSecret" TEXT,
    "mfaVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Computer" (
    "id" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "type" "ComputerType" NOT NULL,
    "cpuBrand" "CpuBrand" NOT NULL,
    "cpuModel" TEXT NOT NULL,
    "cpuGen" TEXT,
    "ramSize" INTEGER NOT NULL,
    "ramType" "RamType" NOT NULL,
    "storageSize" INTEGER NOT NULL,
    "storageType" "StorageType" NOT NULL,
    "screenSize" TEXT,
    "screenRes" TEXT,
    "gpuModel" TEXT,
    "condition" "Condition" NOT NULL,
    "grade" "Grade" NOT NULL,
    "price" DECIMAL(8,2) NOT NULL,
    "priceOld" DECIMAL(8,2),
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "os" "OsType",
    "color" TEXT,
    "notes" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Computer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Label" (
    "id" TEXT NOT NULL,
    "computerId" TEXT NOT NULL,
    "posSkuX" DOUBLE PRECISION NOT NULL DEFAULT 5,
    "posSkuY" DOUBLE PRECISION NOT NULL DEFAULT 4,
    "posCpuX" DOUBLE PRECISION NOT NULL DEFAULT 5,
    "posCpuY" DOUBLE PRECISION NOT NULL DEFAULT 14,
    "posRamX" DOUBLE PRECISION NOT NULL DEFAULT 72,
    "posRamY" DOUBLE PRECISION NOT NULL DEFAULT 14,
    "posStorageX" DOUBLE PRECISION NOT NULL DEFAULT 120,
    "posStorageY" DOUBLE PRECISION NOT NULL DEFAULT 14,
    "posPriceX" DOUBLE PRECISION NOT NULL DEFAULT 155,
    "posPriceY" DOUBLE PRECISION NOT NULL DEFAULT 8,
    "posGradeX" DOUBLE PRECISION NOT NULL DEFAULT 5,
    "posGradeY" DOUBLE PRECISION NOT NULL DEFAULT 26,
    "printed" BOOLEAN NOT NULL DEFAULT false,
    "printedAt" TIMESTAMP(3),
    "printCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Label_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Computer_sku_key" ON "Computer"("sku");

-- CreateIndex
CREATE INDEX "Computer_type_condition_idx" ON "Computer"("type", "condition");

-- CreateIndex
CREATE INDEX "Computer_cpuBrand_idx" ON "Computer"("cpuBrand");

-- CreateIndex
CREATE UNIQUE INDEX "Label_computerId_key" ON "Label"("computerId");

-- AddForeignKey
ALTER TABLE "Computer" ADD CONSTRAINT "Computer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Label" ADD CONSTRAINT "Label_computerId_fkey" FOREIGN KEY ("computerId") REFERENCES "Computer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
