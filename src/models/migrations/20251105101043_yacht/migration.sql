-- AlterTable
ALTER TABLE `openingstockitems` ADD COLUMN `price` DOUBLE NULL;

-- AlterTable
ALTER TABLE `salesentry` ADD COLUMN `salesType` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `style` ADD COLUMN `price` DOUBLE NULL;
