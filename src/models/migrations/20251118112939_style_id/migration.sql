-- AlterTable
ALTER TABLE `cuttingorder` ADD COLUMN `styleId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `CuttingOrder` ADD CONSTRAINT `CuttingOrder_styleId_fkey` FOREIGN KEY (`styleId`) REFERENCES `Style`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
