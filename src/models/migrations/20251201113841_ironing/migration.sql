-- AlterTable
ALTER TABLE `process` ADD COLUMN `isIroning` BOOLEAN NULL;

-- AlterTable
ALTER TABLE `stockinwarditems` ADD COLUMN `colorId` INTEGER NULL,
    ADD COLUMN `styleItemId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `StockInwardItems` ADD CONSTRAINT `StockInwardItems_styleItemId_fkey` FOREIGN KEY (`styleItemId`) REFERENCES `StyleItem`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StockInwardItems` ADD CONSTRAINT `StockInwardItems_colorId_fkey` FOREIGN KEY (`colorId`) REFERENCES `Color`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
