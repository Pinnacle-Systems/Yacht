-- AlterTable
ALTER TABLE `salesentry` ADD COLUMN `destinationId` INTEGER NULL;

-- CreateTable
CREATE TABLE `PurchaseInward` (
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
    `supplierId` INTEGER NULL,
    `inwardType` VARCHAR(191) NULL,
    `dcNo` VARCHAR(191) NULL,
    `dcDate` DATETIME(3) NULL,
    `remarks` VARCHAR(191) NULL,
    `vehicleNo` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FabricInwardItems` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `purchaseInwardId` INTEGER NULL,
    `styleNo` VARCHAR(191) NULL,
    `fabricId` INTEGER NULL,
    `styleItemId` INTEGER NULL,
    `styleId` INTEGER NULL,
    `colorId` INTEGER NULL,
    `fabWidth` DOUBLE NULL,
    `fabMeter` DOUBLE NULL,
    `noOfPcs` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MaterialStock` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `inOrOut` VARCHAR(191) NULL,
    `fabricId` INTEGER NULL,
    `yarnId` INTEGER NULL,
    `accessoryId` INTEGER NULL,
    `accessoryGroupId` INTEGER NULL,
    `accessoryItemId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,
    `createdById` INTEGER NULL,
    `updatedById` INTEGER NULL,
    `branchId` INTEGER NULL,
    `storeId` INTEGER NULL,
    `colorId` INTEGER NULL,
    `uomId` INTEGER NULL,
    `styleId` INTEGER NULL,
    `sizeId` INTEGER NULL,
    `qty` DOUBLE NULL,
    `price` DOUBLE NULL,
    `active` BOOLEAN NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `SalesEntry` ADD CONSTRAINT `SalesEntry_destinationId_fkey` FOREIGN KEY (`destinationId`) REFERENCES `City`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseInward` ADD CONSTRAINT `PurchaseInward_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseInward` ADD CONSTRAINT `PurchaseInward_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseInward` ADD CONSTRAINT `PurchaseInward_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseInward` ADD CONSTRAINT `PurchaseInward_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Location`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseInward` ADD CONSTRAINT `PurchaseInward_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `Party`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FabricInwardItems` ADD CONSTRAINT `FabricInwardItems_purchaseInwardId_fkey` FOREIGN KEY (`purchaseInwardId`) REFERENCES `PurchaseInward`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FabricInwardItems` ADD CONSTRAINT `FabricInwardItems_fabricId_fkey` FOREIGN KEY (`fabricId`) REFERENCES `Fabric`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FabricInwardItems` ADD CONSTRAINT `FabricInwardItems_styleItemId_fkey` FOREIGN KEY (`styleItemId`) REFERENCES `StyleItem`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FabricInwardItems` ADD CONSTRAINT `FabricInwardItems_styleId_fkey` FOREIGN KEY (`styleId`) REFERENCES `Style`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FabricInwardItems` ADD CONSTRAINT `FabricInwardItems_colorId_fkey` FOREIGN KEY (`colorId`) REFERENCES `Color`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MaterialStock` ADD CONSTRAINT `MaterialStock_fabricId_fkey` FOREIGN KEY (`fabricId`) REFERENCES `Fabric`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MaterialStock` ADD CONSTRAINT `MaterialStock_yarnId_fkey` FOREIGN KEY (`yarnId`) REFERENCES `Yarn`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MaterialStock` ADD CONSTRAINT `MaterialStock_accessoryId_fkey` FOREIGN KEY (`accessoryId`) REFERENCES `Accessory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MaterialStock` ADD CONSTRAINT `MaterialStock_accessoryGroupId_fkey` FOREIGN KEY (`accessoryGroupId`) REFERENCES `AccessoryGroup`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MaterialStock` ADD CONSTRAINT `MaterialStock_accessoryItemId_fkey` FOREIGN KEY (`accessoryItemId`) REFERENCES `AccessoryItem`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MaterialStock` ADD CONSTRAINT `MaterialStock_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MaterialStock` ADD CONSTRAINT `MaterialStock_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MaterialStock` ADD CONSTRAINT `MaterialStock_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MaterialStock` ADD CONSTRAINT `MaterialStock_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Location`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MaterialStock` ADD CONSTRAINT `MaterialStock_colorId_fkey` FOREIGN KEY (`colorId`) REFERENCES `Color`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MaterialStock` ADD CONSTRAINT `MaterialStock_uomId_fkey` FOREIGN KEY (`uomId`) REFERENCES `UnitOfMeasurement`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MaterialStock` ADD CONSTRAINT `MaterialStock_styleId_fkey` FOREIGN KEY (`styleId`) REFERENCES `Style`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MaterialStock` ADD CONSTRAINT `MaterialStock_sizeId_fkey` FOREIGN KEY (`sizeId`) REFERENCES `Size`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
