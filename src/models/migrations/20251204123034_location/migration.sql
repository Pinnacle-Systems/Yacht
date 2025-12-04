-- AlterTable
ALTER TABLE `productionstock` ADD COLUMN `locationId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `ProductionStock` ADD CONSTRAINT `ProductionStock_locationId_fkey` FOREIGN KEY (`locationId`) REFERENCES `Location`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
