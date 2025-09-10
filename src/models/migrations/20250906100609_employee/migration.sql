-- DropForeignKey
ALTER TABLE `employeebankdetails` DROP FOREIGN KEY `EmployeeBankDetails_employeeId_fkey`;

-- DropForeignKey
ALTER TABLE `employeeeducationdetails` DROP FOREIGN KEY `EmployeeEducationDetails_employeeId_fkey`;

-- DropForeignKey
ALTER TABLE `employeefamilydetails` DROP FOREIGN KEY `EmployeeFamilyDetails_employeeId_fkey`;

-- AddForeignKey
ALTER TABLE `EmployeeBankDetails` ADD CONSTRAINT `EmployeeBankDetails_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `Employee`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EmployeeEducationDetails` ADD CONSTRAINT `EmployeeEducationDetails_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `Employee`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EmployeeFamilyDetails` ADD CONSTRAINT `EmployeeFamilyDetails_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `Employee`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
