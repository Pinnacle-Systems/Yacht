-- AlterTable
ALTER TABLE `party` ADD COLUMN `alterContactNumber` INTEGER NULL,
    ADD COLUMN `contactNumber` INTEGER NULL,
    ADD COLUMN `contactPersonEmail` VARCHAR(191) NULL,
    ADD COLUMN `department` VARCHAR(191) NULL,
    ADD COLUMN `designation` VARCHAR(191) NULL,
    ADD COLUMN `landMark` VARCHAR(191) NULL;
