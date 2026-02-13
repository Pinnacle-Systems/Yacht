-- AlterTable
ALTER TABLE `barcode` ADD COLUMN `barcodeSeqId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Barcode` ADD CONSTRAINT `Barcode_barcodeSeqId_fkey` FOREIGN KEY (`barcodeSeqId`) REFERENCES `BarcodeSequence`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
