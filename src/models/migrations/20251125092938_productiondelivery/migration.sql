-- AlterTable
ALTER TABLE `productionstock` ADD COLUMN `prevProcessId` INTEGER NULL,
    ADD COLUMN `productionEntryItemsId` INTEGER NULL;

-- CreateTable
CREATE TABLE `ProductionEntry` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `docId` VARCHAR(191) NOT NULL,
    `docDate` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `createdById` INTEGER NULL,
    `updatedById` INTEGER NULL,
    `branchId` INTEGER NULL,
    `storeId` INTEGER NULL,
    `styleId` INTEGER NULL,
    `productionType` VARCHAR(191) NULL,
    `departmentId` INTEGER NULL,
    `fromProcessId` INTEGER NULL,
    `toProcessId` INTEGER NULL,
    `supplierId` INTEGER NULL,
    `sizeTemplateId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProductionEntryItems` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `productionEntryId` INTEGER NULL,
    `fabricId` INTEGER NULL,
    `styleItemId` INTEGER NULL,
    `styleId` INTEGER NULL,
    `colorId` INTEGER NULL,
    `sizeId` INTEGER NULL,
    `portionId` INTEGER NULL,
    `orderQty` DOUBLE NULL,
    `issueQty` DOUBLE NULL,
    `remarks` VARCHAR(191) NULL,
    `uomId` INTEGER NULL,
    `employeeId` INTEGER NULL,
    `prevProcessId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PcsSizeDetails` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sizeId` INTEGER NULL,
    `qty` DOUBLE NULL,
    `productionEntryItemsId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ProductionStock` ADD CONSTRAINT `ProductionStock_prevProcessId_fkey` FOREIGN KEY (`prevProcessId`) REFERENCES `Process`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductionStock` ADD CONSTRAINT `ProductionStock_productionEntryItemsId_fkey` FOREIGN KEY (`productionEntryItemsId`) REFERENCES `ProductionEntryItems`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductionEntry` ADD CONSTRAINT `ProductionEntry_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductionEntry` ADD CONSTRAINT `ProductionEntry_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductionEntry` ADD CONSTRAINT `ProductionEntry_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductionEntry` ADD CONSTRAINT `ProductionEntry_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Location`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductionEntry` ADD CONSTRAINT `ProductionEntry_styleId_fkey` FOREIGN KEY (`styleId`) REFERENCES `Style`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductionEntry` ADD CONSTRAINT `ProductionEntry_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `Department`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductionEntry` ADD CONSTRAINT `ProductionEntry_fromProcessId_fkey` FOREIGN KEY (`fromProcessId`) REFERENCES `Process`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductionEntry` ADD CONSTRAINT `ProductionEntry_toProcessId_fkey` FOREIGN KEY (`toProcessId`) REFERENCES `Process`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductionEntry` ADD CONSTRAINT `ProductionEntry_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `Party`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductionEntry` ADD CONSTRAINT `ProductionEntry_sizeTemplateId_fkey` FOREIGN KEY (`sizeTemplateId`) REFERENCES `SizeTemplate`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductionEntryItems` ADD CONSTRAINT `ProductionEntryItems_productionEntryId_fkey` FOREIGN KEY (`productionEntryId`) REFERENCES `ProductionEntry`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductionEntryItems` ADD CONSTRAINT `ProductionEntryItems_fabricId_fkey` FOREIGN KEY (`fabricId`) REFERENCES `Fabric`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductionEntryItems` ADD CONSTRAINT `ProductionEntryItems_styleItemId_fkey` FOREIGN KEY (`styleItemId`) REFERENCES `StyleItem`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductionEntryItems` ADD CONSTRAINT `ProductionEntryItems_styleId_fkey` FOREIGN KEY (`styleId`) REFERENCES `Style`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductionEntryItems` ADD CONSTRAINT `ProductionEntryItems_colorId_fkey` FOREIGN KEY (`colorId`) REFERENCES `Color`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductionEntryItems` ADD CONSTRAINT `ProductionEntryItems_sizeId_fkey` FOREIGN KEY (`sizeId`) REFERENCES `Size`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductionEntryItems` ADD CONSTRAINT `ProductionEntryItems_portionId_fkey` FOREIGN KEY (`portionId`) REFERENCES `Portion`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductionEntryItems` ADD CONSTRAINT `ProductionEntryItems_uomId_fkey` FOREIGN KEY (`uomId`) REFERENCES `UnitOfMeasurement`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductionEntryItems` ADD CONSTRAINT `ProductionEntryItems_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `Employee`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductionEntryItems` ADD CONSTRAINT `ProductionEntryItems_prevProcessId_fkey` FOREIGN KEY (`prevProcessId`) REFERENCES `Process`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PcsSizeDetails` ADD CONSTRAINT `PcsSizeDetails_sizeId_fkey` FOREIGN KEY (`sizeId`) REFERENCES `Size`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PcsSizeDetails` ADD CONSTRAINT `PcsSizeDetails_productionEntryItemsId_fkey` FOREIGN KEY (`productionEntryItemsId`) REFERENCES `ProductionEntryItems`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
