-- AlterTable
ALTER TABLE `cuttingdelivery` ADD COLUMN `fromProcessId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `CuttingDelivery` ADD CONSTRAINT `CuttingDelivery_fromProcessId_fkey` FOREIGN KEY (`fromProcessId`) REFERENCES `Process`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
