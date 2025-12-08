-- AlterTable
ALTER TABLE `cuttingdelivery` ADD COLUMN `employeeId` INTEGER NULL;

-- AlterTable
ALTER TABLE `stockinward` ADD COLUMN `styleId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `StockInward` ADD CONSTRAINT `StockInward_styleId_fkey` FOREIGN KEY (`styleId`) REFERENCES `Style`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CuttingDelivery` ADD CONSTRAINT `CuttingDelivery_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `Employee`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
