-- AlterTable
ALTER TABLE `stock` ADD COLUMN `returnGoodsId` INTEGER NULL;

-- CreateTable
CREATE TABLE `ReturnGoods` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `purchaseReturnId` INTEGER NULL,
    `styleNo` VARCHAR(191) NULL,
    `fabricId` INTEGER NULL,
    `styleId` INTEGER NULL,
    `sizeId` INTEGER NULL,
    `stkQty` INTEGER NULL,
    `returnQty` INTEGER NULL,
    `styleItemId` INTEGER NULL,
    `colorId` INTEGER NULL,
    `invNo` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_returnGoodsId_fkey` FOREIGN KEY (`returnGoodsId`) REFERENCES `ReturnGoods`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReturnGoods` ADD CONSTRAINT `ReturnGoods_purchaseReturnId_fkey` FOREIGN KEY (`purchaseReturnId`) REFERENCES `PurchaseReturn`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReturnGoods` ADD CONSTRAINT `ReturnGoods_fabricId_fkey` FOREIGN KEY (`fabricId`) REFERENCES `Fabric`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReturnGoods` ADD CONSTRAINT `ReturnGoods_styleId_fkey` FOREIGN KEY (`styleId`) REFERENCES `Style`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReturnGoods` ADD CONSTRAINT `ReturnGoods_sizeId_fkey` FOREIGN KEY (`sizeId`) REFERENCES `Size`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReturnGoods` ADD CONSTRAINT `ReturnGoods_styleItemId_fkey` FOREIGN KEY (`styleItemId`) REFERENCES `StyleItem`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReturnGoods` ADD CONSTRAINT `ReturnGoods_colorId_fkey` FOREIGN KEY (`colorId`) REFERENCES `Color`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
