-- AlterTable
ALTER TABLE `purchasebillitems` ADD COLUMN `barcodeId` INTEGER NULL;

-- AlterTable
ALTER TABLE `purchasreturnitemssr` ADD COLUMN `barcodeId` INTEGER NULL;

-- AlterTable
ALTER TABLE `salesbillitems` ADD COLUMN `barcodeId` INTEGER NULL;

-- AlterTable
ALTER TABLE `salesreturnsritems` ADD COLUMN `barcodeId` INTEGER NULL;

-- AlterTable
ALTER TABLE `stockledger` ADD COLUMN `barcodeId` INTEGER NULL;

-- AlterTable
ALTER TABLE `stocksummary` ADD COLUMN `barcodeId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `PurchaseBillItems` ADD CONSTRAINT `PurchaseBillItems_barcodeId_fkey` FOREIGN KEY (`barcodeId`) REFERENCES `Barcode`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StockLedger` ADD CONSTRAINT `StockLedger_barcodeId_fkey` FOREIGN KEY (`barcodeId`) REFERENCES `Barcode`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StockSummary` ADD CONSTRAINT `StockSummary_barcodeId_fkey` FOREIGN KEY (`barcodeId`) REFERENCES `Barcode`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchasReturnItemsSR` ADD CONSTRAINT `PurchasReturnItemsSR_barcodeId_fkey` FOREIGN KEY (`barcodeId`) REFERENCES `Barcode`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalesBillItems` ADD CONSTRAINT `SalesBillItems_barcodeId_fkey` FOREIGN KEY (`barcodeId`) REFERENCES `Barcode`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalesReturnSRItems` ADD CONSTRAINT `SalesReturnSRItems_barcodeId_fkey` FOREIGN KEY (`barcodeId`) REFERENCES `Barcode`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
