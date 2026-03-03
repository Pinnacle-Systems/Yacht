-- AlterTable
ALTER TABLE `salesreturn` ADD COLUMN `salesType` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `salesreturnitems` ADD COLUMN `barcodeId` INTEGER NULL,
    ADD COLUMN `barcodeNo` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `SalesReturnItems` ADD CONSTRAINT `SalesReturnItems_barcodeId_fkey` FOREIGN KEY (`barcodeId`) REFERENCES `Barcode`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
