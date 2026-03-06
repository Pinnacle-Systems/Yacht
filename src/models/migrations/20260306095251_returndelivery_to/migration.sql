-- AlterTable
ALTER TABLE `salesreturnsr` ADD COLUMN `deliveryToId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `SalesBill` ADD CONSTRAINT `SalesBill_deliveryToId_fkey` FOREIGN KEY (`deliveryToId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalesReturnSR` ADD CONSTRAINT `SalesReturnSR_deliveryToId_fkey` FOREIGN KEY (`deliveryToId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
