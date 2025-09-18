/*
  Warnings:

  - Added the required column `locationId` to the `Location` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `location` ADD COLUMN `locationId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Location` ADD CONSTRAINT `Location_locationId_fkey` FOREIGN KEY (`locationId`) REFERENCES `Branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
