-- AlterTable
ALTER TABLE `stock` ADD COLUMN `OpeningStockItemsId` INTEGER NULL;

-- CreateTable
CREATE TABLE `OpeningStock` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `docId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `createdById` INTEGER NULL,
    `updatedById` INTEGER NULL,
    `branchId` INTEGER NULL,
    `storeId` INTEGER NULL,
    `notes` VARCHAR(191) NULL,
    `term` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OpeningStockItems` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `openingStockId` INTEGER NOT NULL,
    `styleId` INTEGER NULL,
    `sizeId` INTEGER NULL,
    `qty` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_OpeningStockItemsId_fkey` FOREIGN KEY (`OpeningStockItemsId`) REFERENCES `OpeningStockItems`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OpeningStock` ADD CONSTRAINT `OpeningStock_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OpeningStock` ADD CONSTRAINT `OpeningStock_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OpeningStock` ADD CONSTRAINT `OpeningStock_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OpeningStock` ADD CONSTRAINT `OpeningStock_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Location`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OpeningStockItems` ADD CONSTRAINT `OpeningStockItems_openingStockId_fkey` FOREIGN KEY (`openingStockId`) REFERENCES `OpeningStock`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OpeningStockItems` ADD CONSTRAINT `OpeningStockItems_styleId_fkey` FOREIGN KEY (`styleId`) REFERENCES `Style`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OpeningStockItems` ADD CONSTRAINT `OpeningStockItems_sizeId_fkey` FOREIGN KEY (`sizeId`) REFERENCES `Size`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
