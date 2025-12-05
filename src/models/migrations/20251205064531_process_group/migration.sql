-- AlterTable
ALTER TABLE `cuttingorder` ADD COLUMN `processGroupId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `CuttingOrder` ADD CONSTRAINT `CuttingOrder_processGroupId_fkey` FOREIGN KEY (`processGroupId`) REFERENCES `ProcessGroup`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
