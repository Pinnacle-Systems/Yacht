-- AlterTable
ALTER TABLE `salesentryitems` ADD COLUMN `fabricId` INTEGER NULL,
    ADD COLUMN `styleNo` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `SalesEntryItems` ADD CONSTRAINT `SalesEntryItems_fabricId_fkey` FOREIGN KEY (`fabricId`) REFERENCES `Fabric`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
