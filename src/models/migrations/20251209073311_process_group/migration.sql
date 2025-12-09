-- AlterTable
ALTER TABLE `cuttingdelivery` ADD COLUMN `processGroupId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `CuttingDelivery` ADD CONSTRAINT `CuttingDelivery_processGroupId_fkey` FOREIGN KEY (`processGroupId`) REFERENCES `ProcessGroup`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
