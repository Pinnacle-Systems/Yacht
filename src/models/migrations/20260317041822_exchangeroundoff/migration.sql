-- AlterTable
ALTER TABLE `salesreturnsr` ADD COLUMN `referenceId` INTEGER NULL,
    ADD COLUMN `roundOffType` VARCHAR(191) NULL,
    ADD COLUMN `roundOffValue` DOUBLE NULL,
    ADD COLUMN `salesPersonId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `SalesReturnSR` ADD CONSTRAINT `SalesReturnSR_salesPersonId_fkey` FOREIGN KEY (`salesPersonId`) REFERENCES `Employee`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalesReturnSR` ADD CONSTRAINT `SalesReturnSR_referenceId_fkey` FOREIGN KEY (`referenceId`) REFERENCES `Reference`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
