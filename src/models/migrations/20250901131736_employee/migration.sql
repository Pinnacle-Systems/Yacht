-- AlterTable
ALTER TABLE `employeeeducationdetails` ADD COLUMN `courseName` VARCHAR(191) NULL,
    ADD COLUMN `institutionName` VARCHAR(191) NULL,
    ADD COLUMN `universityName` VARCHAR(191) NULL,
    ADD COLUMN `yearOfPass` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `employeefamilydetails` ADD COLUMN `age` INTEGER NULL,
    ADD COLUMN `dob` DATETIME(3) NULL,
    ADD COLUMN `name` VARCHAR(191) NULL,
    ADD COLUMN `nominee` VARCHAR(191) NULL,
    ADD COLUMN `occupation` VARCHAR(191) NULL,
    ADD COLUMN `relationShip` VARCHAR(191) NULL;
