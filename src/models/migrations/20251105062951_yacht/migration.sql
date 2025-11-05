-- AlterTable
ALTER TABLE `openingstockitems` ADD COLUMN `colorId` INTEGER NULL;

-- AlterTable
ALTER TABLE `salesentryitems` ADD COLUMN `colorId` INTEGER NULL;

-- AlterTable
ALTER TABLE `stockadjustmentitems` ADD COLUMN `colorId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `OpeningStockItems` ADD CONSTRAINT `OpeningStockItems_colorId_fkey` FOREIGN KEY (`colorId`) REFERENCES `Color`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StockAdjustmentItems` ADD CONSTRAINT `StockAdjustmentItems_colorId_fkey` FOREIGN KEY (`colorId`) REFERENCES `Color`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalesEntryItems` ADD CONSTRAINT `SalesEntryItems_colorId_fkey` FOREIGN KEY (`colorId`) REFERENCES `Color`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
