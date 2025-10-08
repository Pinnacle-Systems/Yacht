-- AlterTable
ALTER TABLE `stock` ADD COLUMN `styleItemId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_styleItemId_fkey` FOREIGN KEY (`styleItemId`) REFERENCES `StyleItem`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
