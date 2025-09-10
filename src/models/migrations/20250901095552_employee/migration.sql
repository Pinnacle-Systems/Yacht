/*
  Warnings:

  - You are about to drop the column `shiftTemplate` on the `employee` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `employee` DROP COLUMN `shiftTemplate`,
    ADD COLUMN `religion` VARCHAR(191) NULL,
    ADD COLUMN `salaryMethod` VARCHAR(191) NULL,
    ADD COLUMN `shiftTemplateId` INTEGER NULL,
    MODIFY `idNumber` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Employee` ADD CONSTRAINT `Employee_shiftTemplateId_fkey` FOREIGN KEY (`shiftTemplateId`) REFERENCES `ShiftTemplate`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
