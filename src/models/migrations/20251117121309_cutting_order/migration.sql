-- AlterTable
ALTER TABLE `materialstock` ADD COLUMN `cuttingOrderItemsId` INTEGER NULL,
    ADD COLUMN `portionId` INTEGER NULL;

-- CreateTable
CREATE TABLE `CuttingOrder` (
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
    `styleNo` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CuttingOrderItems` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `cuttingOrderId` INTEGER NULL,
    `styleNo` VARCHAR(191) NULL,
    `fabricId` INTEGER NULL,
    `styleItemId` INTEGER NULL,
    `styleId` INTEGER NULL,
    `colorId` INTEGER NULL,
    `sizeId` INTEGER NULL,
    `fabWidth` DOUBLE NULL,
    `fabMeter` DOUBLE NULL,
    `portionId` INTEGER NULL,
    `orderQty` DOUBLE NULL,
    `remarks` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `MaterialStock` ADD CONSTRAINT `MaterialStock_portionId_fkey` FOREIGN KEY (`portionId`) REFERENCES `Portion`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MaterialStock` ADD CONSTRAINT `MaterialStock_cuttingOrderItemsId_fkey` FOREIGN KEY (`cuttingOrderItemsId`) REFERENCES `CuttingOrderItems`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CuttingOrder` ADD CONSTRAINT `CuttingOrder_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CuttingOrder` ADD CONSTRAINT `CuttingOrder_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CuttingOrder` ADD CONSTRAINT `CuttingOrder_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CuttingOrder` ADD CONSTRAINT `CuttingOrder_locationId_fkey` FOREIGN KEY (`locationId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CuttingOrder` ADD CONSTRAINT `CuttingOrder_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Location`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CuttingOrderItems` ADD CONSTRAINT `CuttingOrderItems_cuttingOrderId_fkey` FOREIGN KEY (`cuttingOrderId`) REFERENCES `CuttingOrder`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CuttingOrderItems` ADD CONSTRAINT `CuttingOrderItems_fabricId_fkey` FOREIGN KEY (`fabricId`) REFERENCES `Fabric`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CuttingOrderItems` ADD CONSTRAINT `CuttingOrderItems_styleItemId_fkey` FOREIGN KEY (`styleItemId`) REFERENCES `StyleItem`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CuttingOrderItems` ADD CONSTRAINT `CuttingOrderItems_styleId_fkey` FOREIGN KEY (`styleId`) REFERENCES `Style`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CuttingOrderItems` ADD CONSTRAINT `CuttingOrderItems_colorId_fkey` FOREIGN KEY (`colorId`) REFERENCES `Color`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CuttingOrderItems` ADD CONSTRAINT `CuttingOrderItems_sizeId_fkey` FOREIGN KEY (`sizeId`) REFERENCES `Size`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CuttingOrderItems` ADD CONSTRAINT `CuttingOrderItems_portionId_fkey` FOREIGN KEY (`portionId`) REFERENCES `Portion`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
