-- AlterTable
ALTER TABLE `cuttingorder` ADD COLUMN `sizeTemplateId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `CuttingOrder` ADD CONSTRAINT `CuttingOrder_sizeTemplateId_fkey` FOREIGN KEY (`sizeTemplateId`) REFERENCES `SizeTemplate`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
