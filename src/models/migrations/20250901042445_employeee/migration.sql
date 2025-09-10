/*
  Warnings:

  - You are about to drop the column `accountNo` on the `employee` table. All the data in the column will be lost.
  - You are about to drop the column `active` on the `employee` table. All the data in the column will be lost.
  - You are about to drop the column `branchName` on the `employee` table. All the data in the column will be lost.
  - You are about to drop the column `canRejoin` on the `employee` table. All the data in the column will be lost.
  - You are about to drop the column `chamberNo` on the `employee` table. All the data in the column will be lost.
  - You are about to drop the column `commissionCharges` on the `employee` table. All the data in the column will be lost.
  - You are about to drop the column `consultFee` on the `employee` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `employee` table. All the data in the column will be lost.
  - You are about to drop the column `degree` on the `employee` table. All the data in the column will be lost.
  - You are about to drop the column `ifscNo` on the `employee` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `employee` table. All the data in the column will be lost.
  - You are about to drop the column `leavingDate` on the `employee` table. All the data in the column will be lost.
  - You are about to drop the column `leavingReason` on the `employee` table. All the data in the column will be lost.
  - You are about to drop the column `localAddress` on the `employee` table. All the data in the column will be lost.
  - You are about to drop the column `localCityId` on the `employee` table. All the data in the column will be lost.
  - You are about to drop the column `localPincode` on the `employee` table. All the data in the column will be lost.
  - You are about to drop the column `mobile` on the `employee` table. All the data in the column will be lost.
  - You are about to drop the column `permAddress` on the `employee` table. All the data in the column will be lost.
  - You are about to drop the column `permCityId` on the `employee` table. All the data in the column will be lost.
  - You are about to drop the column `permPincode` on the `employee` table. All the data in the column will be lost.
  - You are about to drop the column `permanent` on the `employee` table. All the data in the column will be lost.
  - You are about to drop the column `regNo` on the `employee` table. All the data in the column will be lost.
  - You are about to drop the column `rejoinReason` on the `employee` table. All the data in the column will be lost.
  - You are about to drop the column `salaryPerMonth` on the `employee` table. All the data in the column will be lost.
  - You are about to drop the column `specialization` on the `employee` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `employee` table. All the data in the column will be lost.
  - You are about to alter the column `gender` on the `employee` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(2))` to `VarChar(191)`.
  - You are about to alter the column `maritalStatus` on the `employee` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(3))` to `VarChar(191)`.
  - You are about to alter the column `bloodGroup` on the `employee` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(5))` to `VarChar(191)`.

*/
-- DropForeignKey
ALTER TABLE `employee` DROP FOREIGN KEY `Employee_localCityId_fkey`;

-- DropForeignKey
ALTER TABLE `employee` DROP FOREIGN KEY `Employee_permCityId_fkey`;

-- DropIndex
DROP INDEX `Employee_regNo_key` ON `employee`;

-- AlterTable
ALTER TABLE `employee` DROP COLUMN `accountNo`,
    DROP COLUMN `active`,
    DROP COLUMN `branchName`,
    DROP COLUMN `canRejoin`,
    DROP COLUMN `chamberNo`,
    DROP COLUMN `commissionCharges`,
    DROP COLUMN `consultFee`,
    DROP COLUMN `createdAt`,
    DROP COLUMN `degree`,
    DROP COLUMN `ifscNo`,
    DROP COLUMN `image`,
    DROP COLUMN `leavingDate`,
    DROP COLUMN `leavingReason`,
    DROP COLUMN `localAddress`,
    DROP COLUMN `localCityId`,
    DROP COLUMN `localPincode`,
    DROP COLUMN `mobile`,
    DROP COLUMN `permAddress`,
    DROP COLUMN `permCityId`,
    DROP COLUMN `permPincode`,
    DROP COLUMN `permanent`,
    DROP COLUMN `regNo`,
    DROP COLUMN `rejoinReason`,
    DROP COLUMN `salaryPerMonth`,
    DROP COLUMN `specialization`,
    DROP COLUMN `updatedAt`,
    ADD COLUMN `aadharNo` VARCHAR(191) NULL,
    ADD COLUMN `currentAddress` VARCHAR(191) NULL,
    ADD COLUMN `currentCityId` INTEGER NULL,
    ADD COLUMN `currentCountry` VARCHAR(191) NULL,
    ADD COLUMN `currentMobile` VARCHAR(191) NULL,
    ADD COLUMN `currentPincode` VARCHAR(191) NULL,
    ADD COLUMN `currentState` VARCHAR(191) NULL,
    ADD COLUMN `currentVillage` VARCHAR(191) NULL,
    ADD COLUMN `desigination` VARCHAR(191) NULL,
    ADD COLUMN `disability` VARCHAR(191) NULL,
    ADD COLUMN `employeeType` VARCHAR(191) NULL,
    ADD COLUMN `esi` VARCHAR(191) NULL,
    ADD COLUMN `esiNo` VARCHAR(191) NULL,
    ADD COLUMN `height` VARCHAR(191) NULL,
    ADD COLUMN `idNumber` INTEGER NULL,
    ADD COLUMN `identificationMark` VARCHAR(191) NULL,
    ADD COLUMN `lastName` VARCHAR(191) NULL,
    ADD COLUMN `middleName` VARCHAR(191) NULL,
    ADD COLUMN `motherName` VARCHAR(191) NULL,
    ADD COLUMN `payCategory` VARCHAR(191) NULL,
    ADD COLUMN `permanentAddress` VARCHAR(191) NULL,
    ADD COLUMN `permanentCity` VARCHAR(191) NULL,
    ADD COLUMN `permanentCityId` INTEGER NULL,
    ADD COLUMN `permanentCountry` VARCHAR(191) NULL,
    ADD COLUMN `permanentMobile` VARCHAR(191) NULL,
    ADD COLUMN `permanentPincode` VARCHAR(191) NULL,
    ADD COLUMN `permanentState` VARCHAR(191) NULL,
    ADD COLUMN `permanentVillage` VARCHAR(191) NULL,
    ADD COLUMN `pf` VARCHAR(191) NULL,
    ADD COLUMN `pfNo` VARCHAR(191) NULL,
    ADD COLUMN `salary` VARCHAR(191) NULL,
    ADD COLUMN `shiftTemplate` INTEGER NULL,
    ADD COLUMN `uanNo` VARCHAR(191) NULL,
    ADD COLUMN `weight` VARCHAR(191) NULL,
    MODIFY `gender` VARCHAR(191) NULL,
    MODIFY `maritalStatus` VARCHAR(191) NULL,
    MODIFY `bloodGroup` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `EmployeeBankDetails` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `employeeId` INTEGER NULL,
    `bankName` VARCHAR(191) NULL,
    `branchName` VARCHAR(191) NULL,
    `accountNumber` VARCHAR(191) NULL,
    `ifscCode` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EmployeeEducationDetails` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `employeeId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EmployeeFamilyDetails` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `employeeId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Employee` ADD CONSTRAINT `Employee_permanentCityId_fkey` FOREIGN KEY (`permanentCityId`) REFERENCES `City`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Employee` ADD CONSTRAINT `Employee_currentCityId_fkey` FOREIGN KEY (`currentCityId`) REFERENCES `City`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EmployeeBankDetails` ADD CONSTRAINT `EmployeeBankDetails_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `Employee`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EmployeeEducationDetails` ADD CONSTRAINT `EmployeeEducationDetails_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `Employee`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EmployeeFamilyDetails` ADD CONSTRAINT `EmployeeFamilyDetails_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `Employee`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
