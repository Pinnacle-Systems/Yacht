/*
  Warnings:

  - You are about to drop the column `currentAddress` on the `employee` table. All the data in the column will be lost.
  - You are about to drop the column `currentCityId` on the `employee` table. All the data in the column will be lost.
  - You are about to drop the column `currentCountry` on the `employee` table. All the data in the column will be lost.
  - You are about to drop the column `currentMobile` on the `employee` table. All the data in the column will be lost.
  - You are about to drop the column `currentPincode` on the `employee` table. All the data in the column will be lost.
  - You are about to drop the column `currentState` on the `employee` table. All the data in the column will be lost.
  - You are about to drop the column `currentVillage` on the `employee` table. All the data in the column will be lost.
  - You are about to drop the column `desigination` on the `employee` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `employee` table. All the data in the column will be lost.
  - You are about to drop the column `permanentCity` on the `employee` table. All the data in the column will be lost.
  - You are about to drop the column `permanentCountry` on the `employee` table. All the data in the column will be lost.
  - You are about to drop the column `permanentState` on the `employee` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `employee` DROP FOREIGN KEY `Employee_currentCityId_fkey`;

-- AlterTable
ALTER TABLE `employee` DROP COLUMN `currentAddress`,
    DROP COLUMN `currentCityId`,
    DROP COLUMN `currentCountry`,
    DROP COLUMN `currentMobile`,
    DROP COLUMN `currentPincode`,
    DROP COLUMN `currentState`,
    DROP COLUMN `currentVillage`,
    DROP COLUMN `desigination`,
    DROP COLUMN `name`,
    DROP COLUMN `permanentCity`,
    DROP COLUMN `permanentCountry`,
    DROP COLUMN `permanentState`,
    ADD COLUMN `firstName` VARCHAR(191) NULL,
    ADD COLUMN `permanentCountryId` INTEGER NULL,
    ADD COLUMN `permanentStateId` INTEGER NULL,
    ADD COLUMN `presentAddress` VARCHAR(191) NULL,
    ADD COLUMN `presentCityId` INTEGER NULL,
    ADD COLUMN `presentCountryId` INTEGER NULL,
    ADD COLUMN `presentMobile` VARCHAR(191) NULL,
    ADD COLUMN `presentPincode` VARCHAR(191) NULL,
    ADD COLUMN `presentStateId` INTEGER NULL,
    ADD COLUMN `presentVillage` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Employee` ADD CONSTRAINT `Employee_presentCityId_fkey` FOREIGN KEY (`presentCityId`) REFERENCES `City`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Employee` ADD CONSTRAINT `Employee_presentCountryId_fkey` FOREIGN KEY (`presentCountryId`) REFERENCES `Country`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Employee` ADD CONSTRAINT `Employee_permanentCountryId_fkey` FOREIGN KEY (`permanentCountryId`) REFERENCES `Country`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Employee` ADD CONSTRAINT `Employee_presentStateId_fkey` FOREIGN KEY (`presentStateId`) REFERENCES `State`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Employee` ADD CONSTRAINT `Employee_permanentStateId_fkey` FOREIGN KEY (`permanentStateId`) REFERENCES `State`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
