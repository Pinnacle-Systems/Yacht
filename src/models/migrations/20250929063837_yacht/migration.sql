-- AlterTable
ALTER TABLE `stock` ADD COLUMN `salesEntryItemsId` INTEGER NULL;

-- CreateTable
CREATE TABLE `SalesEntry` (
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
    `contactPerson` VARCHAR(191) NULL,
    `contactNumber` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SalesEntryItems` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `salesEntryId` INTEGER NULL,
    `barcode` VARCHAR(191) NULL,
    `styleId` INTEGER NULL,
    `sizeId` INTEGER NULL,
    `qty` INTEGER NULL,
    `remarks` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_salesEntryItemsId_fkey` FOREIGN KEY (`salesEntryItemsId`) REFERENCES `SalesEntryItems`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalesEntry` ADD CONSTRAINT `SalesEntry_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalesEntry` ADD CONSTRAINT `SalesEntry_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalesEntry` ADD CONSTRAINT `SalesEntry_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalesEntry` ADD CONSTRAINT `SalesEntry_locationId_fkey` FOREIGN KEY (`locationId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalesEntry` ADD CONSTRAINT `SalesEntry_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Location`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalesEntry` ADD CONSTRAINT `SalesEntry_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `Party`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalesEntryItems` ADD CONSTRAINT `SalesEntryItems_salesEntryId_fkey` FOREIGN KEY (`salesEntryId`) REFERENCES `SalesEntry`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalesEntryItems` ADD CONSTRAINT `SalesEntryItems_styleId_fkey` FOREIGN KEY (`styleId`) REFERENCES `Style`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalesEntryItems` ADD CONSTRAINT `SalesEntryItems_sizeId_fkey` FOREIGN KEY (`sizeId`) REFERENCES `Size`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
