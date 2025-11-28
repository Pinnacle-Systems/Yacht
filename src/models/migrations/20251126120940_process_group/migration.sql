-- CreateTable
CREATE TABLE `ProcessGroupSeq` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NULL,
    `active` BOOLEAN NULL DEFAULT true,
    `companyId` INTEGER NULL,
    `sequence` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProcessGroup` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `processGroupSeqsId` INTEGER NULL,
    `active` BOOLEAN NULL DEFAULT true,
    `companyId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProcessGroupList` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `processId` INTEGER NULL,
    `seqNo` INTEGER NULL,
    `isRequired` BOOLEAN NULL,
    `processGroupId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ProcessGroupSeq` ADD CONSTRAINT `ProcessGroupSeq_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProcessGroup` ADD CONSTRAINT `ProcessGroup_processGroupSeqsId_fkey` FOREIGN KEY (`processGroupSeqsId`) REFERENCES `ProcessGroupSeq`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProcessGroup` ADD CONSTRAINT `ProcessGroup_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProcessGroupList` ADD CONSTRAINT `ProcessGroupList_processId_fkey` FOREIGN KEY (`processId`) REFERENCES `Process`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProcessGroupList` ADD CONSTRAINT `ProcessGroupList_processGroupId_fkey` FOREIGN KEY (`processGroupId`) REFERENCES `ProcessGroup`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
