-- CreateTable
CREATE TABLE `CompanyPaycode` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `createdById` INTEGER NULL,
    `updatedById` INTEGER NULL,
    `companyId` INTEGER NULL,
    `branchId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PayDetails` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `companyPayCodeId` INTEGER NOT NULL,
    `payComponentId` INTEGER NOT NULL,
    `lop` VARCHAR(191) NULL,
    `pf` VARCHAR(191) NULL,
    `esi` VARCHAR(191) NULL,
    `pickFrom` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `CompanyPaycode` ADD CONSTRAINT `CompanyPaycode_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CompanyPaycode` ADD CONSTRAINT `CompanyPaycode_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CompanyPaycode` ADD CONSTRAINT `CompanyPaycode_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CompanyPaycode` ADD CONSTRAINT `CompanyPaycode_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PayDetails` ADD CONSTRAINT `PayDetails_companyPayCodeId_fkey` FOREIGN KEY (`companyPayCodeId`) REFERENCES `CompanyPaycode`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PayDetails` ADD CONSTRAINT `PayDetails_payComponentId_fkey` FOREIGN KEY (`payComponentId`) REFERENCES `PayComponents`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
