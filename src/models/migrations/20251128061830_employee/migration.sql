-- AlterTable
ALTER TABLE `productionstock` ADD COLUMN `employeeId` INTEGER NULL;

-- AlterTable
ALTER TABLE `sizedetails` ADD COLUMN `employeeId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `sizeDetails` ADD CONSTRAINT `sizeDetails_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `Employee`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductionStock` ADD CONSTRAINT `ProductionStock_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `Employee`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
