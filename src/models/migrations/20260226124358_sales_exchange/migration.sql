-- AlterTable
ALTER TABLE `salesbillitems` ADD COLUMN `netAmount` DOUBLE NULL;

-- AlterTable
ALTER TABLE `salesreturnsr` ADD COLUMN `cardAmount` DOUBLE NULL,
    ADD COLUMN `cashAmount` DOUBLE NULL,
    ADD COLUMN `isCard` BOOLEAN NULL DEFAULT false,
    ADD COLUMN `isCash` BOOLEAN NULL DEFAULT false,
    ADD COLUMN `isUpI` BOOLEAN NULL DEFAULT false,
    ADD COLUMN `returnType` VARCHAR(191) NULL,
    ADD COLUMN `taxTemplateId` INTEGER NULL,
    ADD COLUMN `upiAmount` DOUBLE NULL;

-- AlterTable
ALTER TABLE `salesreturnsritems` ADD COLUMN `netAmount` DOUBLE NULL;

-- AlterTable
ALTER TABLE `stockledger` ADD COLUMN `salesExchangeItemsId` INTEGER NULL;

-- CreateTable
CREATE TABLE `SalesExchangeItems` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `salesReturnSRId` INTEGER NULL,
    `styleId` INTEGER NULL,
    `sizeId` INTEGER NULL,
    `exchangeQty` INTEGER NULL,
    `styleItemId` INTEGER NULL,
    `colorId` INTEGER NULL,
    `uomId` INTEGER NULL,
    `barcodeNo` VARCHAR(191) NULL,
    `rate` DOUBLE NULL,
    `discountType` VARCHAR(191) NULL,
    `discountValue` DOUBLE NULL,
    `taxPercent` DOUBLE NULL,
    `barcodeId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `StockLedger` ADD CONSTRAINT `StockLedger_salesExchangeItemsId_fkey` FOREIGN KEY (`salesExchangeItemsId`) REFERENCES `SalesExchangeItems`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalesReturnSR` ADD CONSTRAINT `SalesReturnSR_taxTemplateId_fkey` FOREIGN KEY (`taxTemplateId`) REFERENCES `TaxTemplate`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalesExchangeItems` ADD CONSTRAINT `SalesExchangeItems_salesReturnSRId_fkey` FOREIGN KEY (`salesReturnSRId`) REFERENCES `SalesReturnSR`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalesExchangeItems` ADD CONSTRAINT `SalesExchangeItems_styleId_fkey` FOREIGN KEY (`styleId`) REFERENCES `Style`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalesExchangeItems` ADD CONSTRAINT `SalesExchangeItems_sizeId_fkey` FOREIGN KEY (`sizeId`) REFERENCES `Size`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalesExchangeItems` ADD CONSTRAINT `SalesExchangeItems_styleItemId_fkey` FOREIGN KEY (`styleItemId`) REFERENCES `StyleItem`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalesExchangeItems` ADD CONSTRAINT `SalesExchangeItems_colorId_fkey` FOREIGN KEY (`colorId`) REFERENCES `Color`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalesExchangeItems` ADD CONSTRAINT `SalesExchangeItems_uomId_fkey` FOREIGN KEY (`uomId`) REFERENCES `UnitOfMeasurement`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalesExchangeItems` ADD CONSTRAINT `SalesExchangeItems_barcodeId_fkey` FOREIGN KEY (`barcodeId`) REFERENCES `Barcode`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
