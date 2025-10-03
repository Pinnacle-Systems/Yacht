-- DropForeignKey
ALTER TABLE `sizetemplatelist` DROP FOREIGN KEY `SizeTemplateList_sizeTemplateId_fkey`;

-- AlterTable
ALTER TABLE `style` ADD COLUMN `sizeTemplateId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Style` ADD CONSTRAINT `Style_sizeTemplateId_fkey` FOREIGN KEY (`sizeTemplateId`) REFERENCES `SizeTemplate`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SizeTemplateList` ADD CONSTRAINT `SizeTemplateList_sizeTemplateId_fkey` FOREIGN KEY (`sizeTemplateId`) REFERENCES `SizeTemplate`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
