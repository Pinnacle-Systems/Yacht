-- AlterTable
ALTER TABLE `purchasebill` ADD COLUMN `termsAndCondition` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `stockledger` ADD COLUMN `invNo` VARCHAR(191) NULL,
    ADD COLUMN `purchasReturnItemsSRId` INTEGER NULL;

-- CreateTable
CREATE TABLE `PurchaseReturnShowRoom` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `docId` VARCHAR(191) NOT NULL,
    `docDate` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `createdById` INTEGER NULL,
    `updatedById` INTEGER NULL,
    `branchId` INTEGER NULL,
    `contactPerson` VARCHAR(191) NULL,
    `contactNumber` VARCHAR(191) NULL,
    `supplierId` INTEGER NULL,
    `invNo` VARCHAR(191) NULL,
    `remarks` VARCHAR(191) NULL,
    `termsAndCondition` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PurchasReturnItemsSR` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `purchaseReturnShowRoomId` INTEGER NULL,
    `styleId` INTEGER NULL,
    `sizeId` INTEGER NULL,
    `returnQty` INTEGER NULL,
    `styleItemId` INTEGER NULL,
    `colorId` INTEGER NULL,
    `uomId` INTEGER NULL,
    `invNo` VARCHAR(191) NULL,
    `barcodeNo` VARCHAR(191) NULL,
    `purchaseBillId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `StockLedger` ADD CONSTRAINT `StockLedger_purchasReturnItemsSRId_fkey` FOREIGN KEY (`purchasReturnItemsSRId`) REFERENCES `PurchasReturnItemsSR`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseReturnShowRoom` ADD CONSTRAINT `PurchaseReturnShowRoom_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseReturnShowRoom` ADD CONSTRAINT `PurchaseReturnShowRoom_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseReturnShowRoom` ADD CONSTRAINT `PurchaseReturnShowRoom_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseReturnShowRoom` ADD CONSTRAINT `PurchaseReturnShowRoom_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `Party`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchasReturnItemsSR` ADD CONSTRAINT `PurchasReturnItemsSR_purchaseReturnShowRoomId_fkey` FOREIGN KEY (`purchaseReturnShowRoomId`) REFERENCES `PurchaseReturnShowRoom`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchasReturnItemsSR` ADD CONSTRAINT `PurchasReturnItemsSR_styleId_fkey` FOREIGN KEY (`styleId`) REFERENCES `Style`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchasReturnItemsSR` ADD CONSTRAINT `PurchasReturnItemsSR_sizeId_fkey` FOREIGN KEY (`sizeId`) REFERENCES `Size`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchasReturnItemsSR` ADD CONSTRAINT `PurchasReturnItemsSR_styleItemId_fkey` FOREIGN KEY (`styleItemId`) REFERENCES `StyleItem`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchasReturnItemsSR` ADD CONSTRAINT `PurchasReturnItemsSR_colorId_fkey` FOREIGN KEY (`colorId`) REFERENCES `Color`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchasReturnItemsSR` ADD CONSTRAINT `PurchasReturnItemsSR_uomId_fkey` FOREIGN KEY (`uomId`) REFERENCES `UnitOfMeasurement`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchasReturnItemsSR` ADD CONSTRAINT `PurchasReturnItemsSR_purchaseBillId_fkey` FOREIGN KEY (`purchaseBillId`) REFERENCES `PurchaseBill`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
