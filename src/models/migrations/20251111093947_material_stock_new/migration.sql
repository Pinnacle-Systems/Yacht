-- AlterTable
ALTER TABLE `fabricinwarditems` ADD COLUMN `accessoryGroupId` INTEGER NULL,
    ADD COLUMN `accessoryId` INTEGER NULL,
    ADD COLUMN `accessoryItemId` INTEGER NULL,
    ADD COLUMN `price` DOUBLE NULL,
    ADD COLUMN `qty` DOUBLE NULL,
    ADD COLUMN `sizeId` INTEGER NULL,
    ADD COLUMN `uomId` INTEGER NULL;

-- AlterTable
ALTER TABLE `materialstock` ADD COLUMN `fabMeter` DOUBLE NULL,
    ADD COLUMN `fabWidth` DOUBLE NULL,
    ADD COLUMN `fabricInwardItemsId` INTEGER NULL,
    ADD COLUMN `noOfPcs` INTEGER NULL,
    ADD COLUMN `styleItemId` INTEGER NULL,
    ADD COLUMN `styleNo` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `FabricInwardItems` ADD CONSTRAINT `FabricInwardItems_accessoryId_fkey` FOREIGN KEY (`accessoryId`) REFERENCES `Accessory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FabricInwardItems` ADD CONSTRAINT `FabricInwardItems_accessoryGroupId_fkey` FOREIGN KEY (`accessoryGroupId`) REFERENCES `AccessoryGroup`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FabricInwardItems` ADD CONSTRAINT `FabricInwardItems_accessoryItemId_fkey` FOREIGN KEY (`accessoryItemId`) REFERENCES `AccessoryItem`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FabricInwardItems` ADD CONSTRAINT `FabricInwardItems_sizeId_fkey` FOREIGN KEY (`sizeId`) REFERENCES `Size`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FabricInwardItems` ADD CONSTRAINT `FabricInwardItems_uomId_fkey` FOREIGN KEY (`uomId`) REFERENCES `UnitOfMeasurement`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MaterialStock` ADD CONSTRAINT `MaterialStock_fabricInwardItemsId_fkey` FOREIGN KEY (`fabricInwardItemsId`) REFERENCES `FabricInwardItems`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MaterialStock` ADD CONSTRAINT `MaterialStock_styleItemId_fkey` FOREIGN KEY (`styleItemId`) REFERENCES `StyleItem`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
