-- AlterTable
ALTER TABLE `cuttingdelivery` ADD COLUMN `departmentId` INTEGER NULL,
    ADD COLUMN `productionType` VARCHAR(191) NULL,
    ADD COLUMN `supplierId` INTEGER NULL;

-- AlterTable
ALTER TABLE `cuttingdeliveryitems` ADD COLUMN `employeeId` INTEGER NULL,
    ADD COLUMN `uomId` INTEGER NULL;

-- AlterTable
ALTER TABLE `cuttingorderitems` ADD COLUMN `uomId` INTEGER NULL;

-- AlterTable
ALTER TABLE `productionstock` ADD COLUMN `departmentId` INTEGER NULL;

-- CreateTable
CREATE TABLE `sizeDetails` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sizeId` INTEGER NULL,
    `qty` DOUBLE NULL,
    `cuttingOrderItemsId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `CuttingOrderItems` ADD CONSTRAINT `CuttingOrderItems_uomId_fkey` FOREIGN KEY (`uomId`) REFERENCES `UnitOfMeasurement`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sizeDetails` ADD CONSTRAINT `sizeDetails_sizeId_fkey` FOREIGN KEY (`sizeId`) REFERENCES `Size`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sizeDetails` ADD CONSTRAINT `sizeDetails_cuttingOrderItemsId_fkey` FOREIGN KEY (`cuttingOrderItemsId`) REFERENCES `CuttingOrderItems`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CuttingDelivery` ADD CONSTRAINT `CuttingDelivery_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `Department`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CuttingDelivery` ADD CONSTRAINT `CuttingDelivery_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `Party`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CuttingDeliveryItems` ADD CONSTRAINT `CuttingDeliveryItems_uomId_fkey` FOREIGN KEY (`uomId`) REFERENCES `UnitOfMeasurement`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CuttingDeliveryItems` ADD CONSTRAINT `CuttingDeliveryItems_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `Employee`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductionStock` ADD CONSTRAINT `ProductionStock_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `Department`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
