-- AlterTable
ALTER TABLE `stockledger` ADD COLUMN `salesReturnSRItemsId` INTEGER NULL;

-- CreateTable
CREATE TABLE `SalesReturnSR` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `docId` VARCHAR(191) NOT NULL,
    `docDate` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `createdById` INTEGER NULL,
    `updatedById` INTEGER NULL,
    `branchId` INTEGER NULL,
    `customerId` INTEGER NULL,
    `remarks` VARCHAR(191) NULL,
    `termsAndCondition` VARCHAR(191) NULL,
    `billNo` VARCHAR(191) NULL,
    `mobileNo` VARCHAR(191) NULL,
    `customerName` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SalesReturnSRItems` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `salesReturnSRId` INTEGER NULL,
    `barcodeNo` VARCHAR(191) NULL,
    `styleId` INTEGER NULL,
    `sizeId` INTEGER NULL,
    `returnQty` INTEGER NULL,
    `styleItemId` INTEGER NULL,
    `colorId` INTEGER NULL,
    `uomId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `StockLedger` ADD CONSTRAINT `StockLedger_salesReturnSRItemsId_fkey` FOREIGN KEY (`salesReturnSRItemsId`) REFERENCES `SalesReturnSRItems`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalesReturnSR` ADD CONSTRAINT `SalesReturnSR_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalesReturnSR` ADD CONSTRAINT `SalesReturnSR_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalesReturnSR` ADD CONSTRAINT `SalesReturnSR_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalesReturnSR` ADD CONSTRAINT `SalesReturnSR_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `Customer`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalesReturnSRItems` ADD CONSTRAINT `SalesReturnSRItems_salesReturnSRId_fkey` FOREIGN KEY (`salesReturnSRId`) REFERENCES `SalesReturnSR`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalesReturnSRItems` ADD CONSTRAINT `SalesReturnSRItems_styleId_fkey` FOREIGN KEY (`styleId`) REFERENCES `Style`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalesReturnSRItems` ADD CONSTRAINT `SalesReturnSRItems_sizeId_fkey` FOREIGN KEY (`sizeId`) REFERENCES `Size`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalesReturnSRItems` ADD CONSTRAINT `SalesReturnSRItems_styleItemId_fkey` FOREIGN KEY (`styleItemId`) REFERENCES `StyleItem`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalesReturnSRItems` ADD CONSTRAINT `SalesReturnSRItems_colorId_fkey` FOREIGN KEY (`colorId`) REFERENCES `Color`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalesReturnSRItems` ADD CONSTRAINT `SalesReturnSRItems_uomId_fkey` FOREIGN KEY (`uomId`) REFERENCES `UnitOfMeasurement`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
