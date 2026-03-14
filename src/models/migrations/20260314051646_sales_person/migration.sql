-- AlterTable
ALTER TABLE `purchasreturnitemssr` ADD COLUMN `billNo` VARCHAR(191) NULL,
    ADD COLUMN `supplierId` INTEGER NULL;

-- AlterTable
ALTER TABLE `salesbill` ADD COLUMN `referenceId` INTEGER NULL,
    ADD COLUMN `salesPersonId` INTEGER NULL;

-- AlterTable
ALTER TABLE `salesreturnitems` ADD COLUMN `billNo` VARCHAR(191) NULL,
    ADD COLUMN `customerId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `SalesReturnItems` ADD CONSTRAINT `SalesReturnItems_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `Party`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchasReturnItemsSR` ADD CONSTRAINT `PurchasReturnItemsSR_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `Party`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalesBill` ADD CONSTRAINT `SalesBill_salesPersonId_fkey` FOREIGN KEY (`salesPersonId`) REFERENCES `Employee`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalesBill` ADD CONSTRAINT `SalesBill_referenceId_fkey` FOREIGN KEY (`referenceId`) REFERENCES `Reference`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
