/*
  Warnings:

  - Made the column `shiftId` on table `shifttemplateitems` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `shifttemplateitems` MODIFY `shiftId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `ShiftTemplateItems` ADD CONSTRAINT `ShiftTemplateItems_shiftId_fkey` FOREIGN KEY (`shiftId`) REFERENCES `Shift`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
