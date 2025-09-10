/*
  Warnings:

  - You are about to drop the column `payFrequencyType` on the `payfrequency` table. All the data in the column will be lost.
  - You are about to drop the column `payFrequencyId` on the `payfrequencyitems` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `payfrequencyitems` DROP FOREIGN KEY `PayFrequencyItems_payFrequencyId_fkey`;

-- DropForeignKey
ALTER TABLE `shifttemplateitems` DROP FOREIGN KEY `ShiftTemplateItems_shiftTemplateId_fkey`;

-- AlterTable
ALTER TABLE `payfrequency` DROP COLUMN `payFrequencyType`;

-- AlterTable
ALTER TABLE `payfrequencyitems` DROP COLUMN `payFrequencyId`,
    ADD COLUMN `payFrequencyTypeId` INTEGER NULL;

-- CreateTable
CREATE TABLE `PayFrequencyType` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `payFrequencyType` VARCHAR(191) NULL,
    `payFrequencyId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EmployeSubCategory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `companyId` INTEGER NULL,
    `branchId` INTEGER NULL,
    `employeeCategoryId` INTEGER NULL,
    `gradeName` VARCHAR(191) NULL,
    `active` BOOLEAN NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ShiftTemplateItems` ADD CONSTRAINT `ShiftTemplateItems_shiftTemplateId_fkey` FOREIGN KEY (`shiftTemplateId`) REFERENCES `ShiftTemplate`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PayFrequencyType` ADD CONSTRAINT `PayFrequencyType_payFrequencyId_fkey` FOREIGN KEY (`payFrequencyId`) REFERENCES `PayFrequency`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EmployeSubCategory` ADD CONSTRAINT `EmployeSubCategory_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EmployeSubCategory` ADD CONSTRAINT `EmployeSubCategory_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EmployeSubCategory` ADD CONSTRAINT `EmployeSubCategory_employeeCategoryId_fkey` FOREIGN KEY (`employeeCategoryId`) REFERENCES `EmployeeCategory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PayFrequencyItems` ADD CONSTRAINT `PayFrequencyItems_payFrequencyTypeId_fkey` FOREIGN KEY (`payFrequencyTypeId`) REFERENCES `PayFrequencyType`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
