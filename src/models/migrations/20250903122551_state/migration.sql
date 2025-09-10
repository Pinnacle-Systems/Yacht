/*
  Warnings:

  - Made the column `stateId` on table `city` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `city` DROP FOREIGN KEY `City_stateId_fkey`;

-- AlterTable
ALTER TABLE `city` MODIFY `stateId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `City` ADD CONSTRAINT `City_stateId_fkey` FOREIGN KEY (`stateId`) REFERENCES `State`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
