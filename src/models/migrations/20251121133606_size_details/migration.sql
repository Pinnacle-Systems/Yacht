-- DropForeignKey
ALTER TABLE `sizedetails` DROP FOREIGN KEY `sizeDetails_cuttingOrderItemsId_fkey`;

-- AddForeignKey
ALTER TABLE `sizeDetails` ADD CONSTRAINT `sizeDetails_cuttingOrderItemsId_fkey` FOREIGN KEY (`cuttingOrderItemsId`) REFERENCES `CuttingOrderItems`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
