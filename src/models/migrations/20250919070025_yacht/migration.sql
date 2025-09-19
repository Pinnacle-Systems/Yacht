-- AlterTable
ALTER TABLE `fabric` ADD COLUMN `active` BOOLEAN NULL DEFAULT true,
    ADD COLUMN `aliasName` VARCHAR(191) NULL,
    ADD COLUMN `companyId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Fabric` ADD CONSTRAINT `Fabric_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
