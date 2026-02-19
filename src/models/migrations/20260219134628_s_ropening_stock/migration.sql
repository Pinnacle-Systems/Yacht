-- AlterTable
ALTER TABLE `barcode` ADD COLUMN `openingStockItemsSRId` INTEGER NULL;

-- AlterTable
ALTER TABLE `stockledger` ADD COLUMN `openingStockItemsSRId` INTEGER NULL;

-- CreateTable
CREATE TABLE `OpeningStockSR` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `docId` VARCHAR(191) NOT NULL,
    `docDate` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `createdById` INTEGER NULL,
    `updatedById` INTEGER NULL,
    `branchId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OpeningStockItemsSR` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `openingStockSRId` INTEGER NULL,
    `styleId` INTEGER NULL,
    `sizeId` INTEGER NULL,
    `qty` INTEGER NULL,
    `styleItemId` INTEGER NULL,
    `colorId` INTEGER NULL,
    `uomId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `StockLedger` ADD CONSTRAINT `StockLedger_openingStockItemsSRId_fkey` FOREIGN KEY (`openingStockItemsSRId`) REFERENCES `OpeningStockItemsSR`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Barcode` ADD CONSTRAINT `Barcode_openingStockItemsSRId_fkey` FOREIGN KEY (`openingStockItemsSRId`) REFERENCES `OpeningStockItemsSR`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OpeningStockSR` ADD CONSTRAINT `OpeningStockSR_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OpeningStockSR` ADD CONSTRAINT `OpeningStockSR_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OpeningStockSR` ADD CONSTRAINT `OpeningStockSR_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OpeningStockItemsSR` ADD CONSTRAINT `OpeningStockItemsSR_openingStockSRId_fkey` FOREIGN KEY (`openingStockSRId`) REFERENCES `OpeningStockSR`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OpeningStockItemsSR` ADD CONSTRAINT `OpeningStockItemsSR_styleId_fkey` FOREIGN KEY (`styleId`) REFERENCES `Style`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OpeningStockItemsSR` ADD CONSTRAINT `OpeningStockItemsSR_sizeId_fkey` FOREIGN KEY (`sizeId`) REFERENCES `Size`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OpeningStockItemsSR` ADD CONSTRAINT `OpeningStockItemsSR_styleItemId_fkey` FOREIGN KEY (`styleItemId`) REFERENCES `StyleItem`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OpeningStockItemsSR` ADD CONSTRAINT `OpeningStockItemsSR_colorId_fkey` FOREIGN KEY (`colorId`) REFERENCES `Color`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OpeningStockItemsSR` ADD CONSTRAINT `OpeningStockItemsSR_uomId_fkey` FOREIGN KEY (`uomId`) REFERENCES `UnitOfMeasurement`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
