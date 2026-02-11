-- CreateTable
CREATE TABLE `BarcodeSequence` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `prefix` VARCHAR(191) NULL,
    `code` INTEGER NULL,
    `digits` INTEGER NULL,
    `seqStart` INTEGER NULL,
    `barcodeNo` INTEGER NULL,
    `active` BOOLEAN NULL DEFAULT true,
    `companyId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `BarcodeSequence` ADD CONSTRAINT `BarcodeSequence_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
