-- AlterTable
ALTER TABLE `accessorygroup` MODIFY `active` BOOLEAN NULL DEFAULT true;

-- CreateTable
CREATE TABLE `Yarn` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NULL,
    `contentId` INTEGER NULL,
    `aliasName` VARCHAR(191) NULL,
    `hsn` VARCHAR(191) NULL,
    `taxPercent` DOUBLE NULL DEFAULT 0,
    `companyId` INTEGER NULL,
    `active` BOOLEAN NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Accessory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `aliasName` VARCHAR(191) NULL,
    `accessoryItemId` INTEGER NULL,
    `hsn` VARCHAR(191) NULL,
    `companyId` INTEGER NULL,
    `active` BOOLEAN NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AccessoryItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `active` BOOLEAN NULL DEFAULT true,
    `accessoryGroupId` INTEGER NULL,
    `companyId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Stock` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `docId` VARCHAR(191) NOT NULL,
    `docDate` DATETIME(3) NULL,
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
    `notes` VARCHAR(191) NULL,
    `term` VARCHAR(191) NULL,
    `colorId` INTEGER NULL,
    `uomId` INTEGER NULL,
    `styleId` INTEGER NULL,
    `sizeId` INTEGER NULL,
    `qty` DOUBLE NULL,
    `price` DOUBLE NULL,
    `active` BOOLEAN NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Yarn` ADD CONSTRAINT `Yarn_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Accessory` ADD CONSTRAINT `Accessory_accessoryItemId_fkey` FOREIGN KEY (`accessoryItemId`) REFERENCES `AccessoryItem`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Accessory` ADD CONSTRAINT `Accessory_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryItem` ADD CONSTRAINT `AccessoryItem_accessoryGroupId_fkey` FOREIGN KEY (`accessoryGroupId`) REFERENCES `AccessoryGroup`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessoryItem` ADD CONSTRAINT `AccessoryItem_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_fabricId_fkey` FOREIGN KEY (`fabricId`) REFERENCES `Fabric`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_yarnId_fkey` FOREIGN KEY (`yarnId`) REFERENCES `Yarn`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_accessoryId_fkey` FOREIGN KEY (`accessoryId`) REFERENCES `Accessory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_accessoryGroupId_fkey` FOREIGN KEY (`accessoryGroupId`) REFERENCES `AccessoryGroup`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_accessoryItemId_fkey` FOREIGN KEY (`accessoryItemId`) REFERENCES `AccessoryItem`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Location`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_colorId_fkey` FOREIGN KEY (`colorId`) REFERENCES `Color`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_uomId_fkey` FOREIGN KEY (`uomId`) REFERENCES `UnitOfMeasurement`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_styleId_fkey` FOREIGN KEY (`styleId`) REFERENCES `Style`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_sizeId_fkey` FOREIGN KEY (`sizeId`) REFERENCES `Size`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
