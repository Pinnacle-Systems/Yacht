/*
  Warnings:

  - You are about to drop the column `docId` on the `shifttemplateitems` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `shifttemplateitems` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `shifttemplateitems` DROP COLUMN `docId`,
    DROP COLUMN `name`,
    ADD COLUMN `date` DATETIME(3) NULL;
