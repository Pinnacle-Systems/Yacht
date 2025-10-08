-- AlterTable
ALTER TABLE `salesentryitems` ADD COLUMN `styleItemId` INTEGER NULL;

-- AlterTable
ALTER TABLE `stockadjustmentitems` ADD COLUMN `styleItemId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `StockAdjustmentItems` ADD CONSTRAINT `StockAdjustmentItems_styleItemId_fkey` FOREIGN KEY (`styleItemId`) REFERENCES `StyleItem`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalesEntryItems` ADD CONSTRAINT `SalesEntryItems_styleItemId_fkey` FOREIGN KEY (`styleItemId`) REFERENCES `StyleItem`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
