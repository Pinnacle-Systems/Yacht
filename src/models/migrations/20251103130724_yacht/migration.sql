-- AlterTable
ALTER TABLE `accessory` ADD COLUMN `accessoryGroupId` INTEGER NULL,
    ADD COLUMN `name` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Accessory` ADD CONSTRAINT `Accessory_accessoryGroupId_fkey` FOREIGN KEY (`accessoryGroupId`) REFERENCES `AccessoryGroup`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
