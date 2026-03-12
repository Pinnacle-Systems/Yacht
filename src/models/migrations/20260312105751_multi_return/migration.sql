-- AlterTable
ALTER TABLE `salesreturnsritems` ADD COLUMN `billNo` VARCHAR(191) NULL,
    ADD COLUMN `deliveryToId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `SalesReturnSRItems` ADD CONSTRAINT `SalesReturnSRItems_deliveryToId_fkey` FOREIGN KEY (`deliveryToId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
