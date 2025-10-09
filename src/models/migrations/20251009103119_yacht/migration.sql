-- AlterTable
ALTER TABLE `salesentry` ADD COLUMN `taxTemplateId` INTEGER NULL;

-- AlterTable
ALTER TABLE `salesentryitems` ADD COLUMN `discountType` VARCHAR(191) NULL,
    ADD COLUMN `discountValue` INTEGER NULL,
    ADD COLUMN `taxPercent` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `SalesEntry` ADD CONSTRAINT `SalesEntry_taxTemplateId_fkey` FOREIGN KEY (`taxTemplateId`) REFERENCES `TaxTemplate`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
