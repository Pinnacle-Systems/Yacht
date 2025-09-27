-- DropForeignKey
ALTER TABLE `stockadjustmentitems` DROP FOREIGN KEY `StockAdjustmentItems_stockAdjustmentId_fkey`;

-- AddForeignKey
ALTER TABLE `StockAdjustmentItems` ADD CONSTRAINT `StockAdjustmentItems_stockAdjustmentId_fkey` FOREIGN KEY (`stockAdjustmentId`) REFERENCES `StockAdjustment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
