/*
  Warnings:

  - A unique constraint covering the columns `[branchId,barcodeId]` on the table `StockSummary` will be added. If there are existing duplicate values, this will fail.
  - Made the column `branchId` on table `stocksummary` required. This step will fail if there are existing NULL values in that column.
  - Made the column `barcodeId` on table `stocksummary` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `stocksummary` DROP FOREIGN KEY `StockSummary_barcodeId_fkey`;

-- DropForeignKey
ALTER TABLE `stocksummary` DROP FOREIGN KEY `StockSummary_branchId_fkey`;

-- AlterTable
ALTER TABLE `stocksummary` MODIFY `branchId` INTEGER NOT NULL,
    MODIFY `barcodeId` INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `StockSummary_branchId_barcodeId_key` ON `StockSummary`(`branchId`, `barcodeId`);

-- AddForeignKey
ALTER TABLE `StockSummary` ADD CONSTRAINT `StockSummary_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StockSummary` ADD CONSTRAINT `StockSummary_barcodeId_fkey` FOREIGN KEY (`barcodeId`) REFERENCES `Barcode`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
