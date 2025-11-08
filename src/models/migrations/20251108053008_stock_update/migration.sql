-- AlterTable
ALTER TABLE `stock` ADD COLUMN `salesReturnItemsId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_salesReturnItemsId_fkey` FOREIGN KEY (`salesReturnItemsId`) REFERENCES `SalesReturnItems`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
