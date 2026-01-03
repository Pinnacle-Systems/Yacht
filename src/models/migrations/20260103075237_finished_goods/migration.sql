-- AlterTable
ALTER TABLE `stock` ADD COLUMN `readyGoodsId` INTEGER NULL;

-- CreateTable
CREATE TABLE `ReadyGoods` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `purchaseInwardId` INTEGER NULL,
    `styleNo` VARCHAR(191) NULL,
    `fabricId` INTEGER NULL,
    `styleId` INTEGER NULL,
    `sizeId` INTEGER NULL,
    `qty` INTEGER NULL,
    `styleItemId` INTEGER NULL,
    `colorId` INTEGER NULL,
    `invNo` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_readyGoodsId_fkey` FOREIGN KEY (`readyGoodsId`) REFERENCES `ReadyGoods`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReadyGoods` ADD CONSTRAINT `ReadyGoods_purchaseInwardId_fkey` FOREIGN KEY (`purchaseInwardId`) REFERENCES `PurchaseInward`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReadyGoods` ADD CONSTRAINT `ReadyGoods_fabricId_fkey` FOREIGN KEY (`fabricId`) REFERENCES `Fabric`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReadyGoods` ADD CONSTRAINT `ReadyGoods_styleId_fkey` FOREIGN KEY (`styleId`) REFERENCES `Style`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReadyGoods` ADD CONSTRAINT `ReadyGoods_sizeId_fkey` FOREIGN KEY (`sizeId`) REFERENCES `Size`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReadyGoods` ADD CONSTRAINT `ReadyGoods_styleItemId_fkey` FOREIGN KEY (`styleItemId`) REFERENCES `StyleItem`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReadyGoods` ADD CONSTRAINT `ReadyGoods_colorId_fkey` FOREIGN KEY (`colorId`) REFERENCES `Color`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
