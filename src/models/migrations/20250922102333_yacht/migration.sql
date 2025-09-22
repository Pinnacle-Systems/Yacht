-- DropForeignKey
ALTER TABLE `openingstockitems` DROP FOREIGN KEY `OpeningStockItems_openingStockId_fkey`;

-- AlterTable
ALTER TABLE `openingstock` ADD COLUMN `docDate` DATETIME(3) NULL;

-- AddForeignKey
ALTER TABLE `OpeningStockItems` ADD CONSTRAINT `OpeningStockItems_openingStockId_fkey` FOREIGN KEY (`openingStockId`) REFERENCES `OpeningStock`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
