-- CreateTable
CREATE TABLE `SalesReturn` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `docId` VARCHAR(191) NOT NULL,
    `docDate` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `createdById` INTEGER NULL,
    `updatedById` INTEGER NULL,
    `branchId` INTEGER NULL,
    `locationId` INTEGER NULL,
    `storeId` INTEGER NULL,
    `customerId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SalesReturnItems` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `salesReturnId` INTEGER NULL,
    `barcode` VARCHAR(191) NULL,
    `styleId` INTEGER NULL,
    `sizeId` INTEGER NULL,
    `stkQty` INTEGER NULL,
    `returnQty` INTEGER NULL,
    `remarks` VARCHAR(191) NULL,
    `styleNo` VARCHAR(191) NULL,
    `fabricId` INTEGER NULL,
    `styleItemId` INTEGER NULL,
    `colorId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `SalesReturn` ADD CONSTRAINT `SalesReturn_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalesReturn` ADD CONSTRAINT `SalesReturn_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalesReturn` ADD CONSTRAINT `SalesReturn_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalesReturn` ADD CONSTRAINT `SalesReturn_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Location`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalesReturn` ADD CONSTRAINT `SalesReturn_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `Party`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalesReturnItems` ADD CONSTRAINT `SalesReturnItems_salesReturnId_fkey` FOREIGN KEY (`salesReturnId`) REFERENCES `SalesReturn`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalesReturnItems` ADD CONSTRAINT `SalesReturnItems_styleId_fkey` FOREIGN KEY (`styleId`) REFERENCES `Style`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalesReturnItems` ADD CONSTRAINT `SalesReturnItems_sizeId_fkey` FOREIGN KEY (`sizeId`) REFERENCES `Size`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalesReturnItems` ADD CONSTRAINT `SalesReturnItems_fabricId_fkey` FOREIGN KEY (`fabricId`) REFERENCES `Fabric`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalesReturnItems` ADD CONSTRAINT `SalesReturnItems_styleItemId_fkey` FOREIGN KEY (`styleItemId`) REFERENCES `StyleItem`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalesReturnItems` ADD CONSTRAINT `SalesReturnItems_colorId_fkey` FOREIGN KEY (`colorId`) REFERENCES `Color`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
