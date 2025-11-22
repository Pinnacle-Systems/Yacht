-- AlterTable
ALTER TABLE `sizedetails` ADD COLUMN `cuttingDeliveryItemsId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `sizeDetails` ADD CONSTRAINT `sizeDetails_cuttingDeliveryItemsId_fkey` FOREIGN KEY (`cuttingDeliveryItemsId`) REFERENCES `CuttingDeliveryItems`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
