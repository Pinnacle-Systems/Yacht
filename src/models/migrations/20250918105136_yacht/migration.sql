-- AlterTable
ALTER TABLE `color` MODIFY `pantone` VARCHAR(191) NULL,
    MODIFY `isGrey` BOOLEAN NULL DEFAULT false,
    MODIFY `number` INTEGER NULL;
