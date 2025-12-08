-- AlterTable
ALTER TABLE `stockinwarditems` ADD COLUMN `portionId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `StockInwardItems` ADD CONSTRAINT `StockInwardItems_portionId_fkey` FOREIGN KEY (`portionId`) REFERENCES `Portion`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
