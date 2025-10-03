-- AlterTable
ALTER TABLE `style` ADD COLUMN `fabricId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Style` ADD CONSTRAINT `Style_fabricId_fkey` FOREIGN KEY (`fabricId`) REFERENCES `Fabric`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
