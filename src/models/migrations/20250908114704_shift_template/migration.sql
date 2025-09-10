/*
  Warnings:

  - Made the column `templateId` on table `shifttemplateitems` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `shifttemplateitems` MODIFY `templateId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `ShiftTemplateItems` ADD CONSTRAINT `ShiftTemplateItems_templateId_fkey` FOREIGN KEY (`templateId`) REFERENCES `ShiftCommonTemplate`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
