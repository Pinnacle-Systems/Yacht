-- AlterTable
ALTER TABLE `openingstockitems` ADD COLUMN `styleItemId` INTEGER NULL;

-- AlterTable
ALTER TABLE `style` ADD COLUMN `styleItemId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Style` ADD CONSTRAINT `Style_styleItemId_fkey` FOREIGN KEY (`styleItemId`) REFERENCES `StyleItem`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OpeningStockItems` ADD CONSTRAINT `OpeningStockItems_styleItemId_fkey` FOREIGN KEY (`styleItemId`) REFERENCES `StyleItem`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
