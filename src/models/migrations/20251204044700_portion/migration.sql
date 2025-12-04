-- AlterTable
ALTER TABLE `fabricinwarditems` ADD COLUMN `portionId` INTEGER NULL;

-- AlterTable
ALTER TABLE `purchasereturnitems` ADD COLUMN `portionId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `FabricInwardItems` ADD CONSTRAINT `FabricInwardItems_portionId_fkey` FOREIGN KEY (`portionId`) REFERENCES `Portion`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseReturnItems` ADD CONSTRAINT `PurchaseReturnItems_portionId_fkey` FOREIGN KEY (`portionId`) REFERENCES `Portion`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
