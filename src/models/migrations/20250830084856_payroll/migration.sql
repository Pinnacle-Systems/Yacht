-- CreateTable
CREATE TABLE `Page` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `link` VARCHAR(191) NULL,
    `type` ENUM('Masters', 'Transactions', 'Reports', 'AdminAccess') NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `pageGroupId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Company` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `companyId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NULL,
    `gstNo` VARCHAR(191) NULL,
    `panNo` VARCHAR(191) NULL,
    `contactName` VARCHAR(191) NULL,
    `contactMobile` BIGINT NOT NULL,
    `contactEmail` VARCHAR(191) NULL,
    `bankName` VARCHAR(191) NULL,
    `accNo` VARCHAR(191) NULL,
    `branchName` VARCHAR(191) NULL,
    `ifscCode` VARCHAR(191) NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `Company_companyId_key`(`companyId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Subscription` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `companyId` INTEGER NOT NULL,
    `validFrom` DATETIME(3) NOT NULL,
    `expireAt` DATETIME(3) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `maxUsers` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Branch` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `branchName` VARCHAR(191) NOT NULL,
    `branchCode` VARCHAR(191) NULL,
    `contactName` VARCHAR(191) NULL,
    `contactMobile` BIGINT NOT NULL,
    `contactEmail` VARCHAR(191) NULL,
    `companyId` INTEGER NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `idPrefix` VARCHAR(191) NULL,
    `idSequence` VARCHAR(191) NULL,
    `tempPrefix` VARCHAR(191) NULL,
    `tempSequence` VARCHAR(191) NULL,
    `prefixCategory` ENUM('Default', 'Specific') NULL,
    `address` VARCHAR(191) NULL,
    `gstNo` VARCHAR(191) NULL,
    `panNo` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserOnBranch` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `branchId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Role` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `companyId` INTEGER NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `defaultRole` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `Role_companyId_name_key`(`companyId`, `name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RoleOnPage` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `roleId` INTEGER NOT NULL,
    `pageId` INTEGER NOT NULL,
    `read` BOOLEAN NOT NULL DEFAULT false,
    `create` BOOLEAN NOT NULL DEFAULT false,
    `edit` BOOLEAN NOT NULL DEFAULT false,
    `delete` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `RoleOnPage_roleId_pageId_key`(`roleId`, `pageId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `passKey` VARCHAR(191) NULL,
    `password` VARCHAR(191) NOT NULL,
    `roleId` INTEGER NULL,
    `otp` VARCHAR(191) NULL,
    `active` BOOLEAN NULL DEFAULT true,
    `isAdmin` BOOLEAN NULL DEFAULT false,
    `employeeId` INTEGER NULL,
    `partyType` VARCHAR(191) NULL,
    `userType` VARCHAR(191) NULL,

    UNIQUE INDEX `User_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Employee` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `regNo` VARCHAR(191) NULL,
    `chamberNo` VARCHAR(191) NULL,
    `departmentId` INTEGER NULL,
    `designationId` INTEGER NULL,
    `joiningDate` DATETIME(3) NULL,
    `fatherName` VARCHAR(191) NULL,
    `dob` DATETIME(3) NULL,
    `gender` ENUM('MALE', 'FEMALE', 'OTHER') NULL,
    `maritalStatus` ENUM('SINGLE', 'MARRIED', 'SEPARATED') NULL,
    `bloodGroup` ENUM('AP', 'BP', 'AN', 'BN', 'ABP', 'ABN', 'OP', 'ON') NULL,
    `panNo` VARCHAR(191) NULL,
    `consultFee` VARCHAR(191) NULL,
    `salaryPerMonth` VARCHAR(191) NULL,
    `commissionCharges` VARCHAR(191) NULL,
    `mobile` BIGINT NULL,
    `accountNo` VARCHAR(191) NULL,
    `ifscNo` VARCHAR(191) NULL,
    `branchName` VARCHAR(191) NULL,
    `degree` VARCHAR(191) NULL,
    `specialization` VARCHAR(191) NULL,
    `localAddress` VARCHAR(191) NULL,
    `localCityId` INTEGER NULL,
    `localPincode` INTEGER NULL,
    `permAddress` VARCHAR(191) NULL,
    `permCityId` INTEGER NULL,
    `permPincode` INTEGER NULL,
    `active` BOOLEAN NULL DEFAULT true,
    `image` LONGBLOB NULL,
    `branchId` INTEGER NULL,
    `employeeCategoryId` INTEGER NULL,
    `permanent` BOOLEAN NULL DEFAULT false,
    `leavingReason` VARCHAR(191) NULL,
    `leavingDate` DATETIME(3) NULL,
    `canRejoin` BOOLEAN NULL DEFAULT true,
    `rejoinReason` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,
    `createdById` INTEGER NULL,
    `updatedById` INTEGER NULL,

    UNIQUE INDEX `Employee_email_key`(`email`),
    UNIQUE INDEX `Employee_regNo_key`(`regNo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FinYear` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `from` DATETIME(3) NOT NULL,
    `to` DATETIME(3) NOT NULL,
    `companyId` INTEGER NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `code` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EmployeeCategory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `branchId` INTEGER NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `defaultCategory` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Country` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `companyId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `State` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `gstNo` VARCHAR(191) NOT NULL,
    `countryId` INTEGER NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `City` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NULL,
    `code` VARCHAR(191) NULL,
    `stateId` INTEGER NULL,
    `active` BOOLEAN NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Department` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `companyId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PageGroup` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` ENUM('Masters', 'Transactions', 'Reports', 'AdminAccess') NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PartyCategory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `companyId` INTEGER NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Currency` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NULL,
    `companyId` INTEGER NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Party` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NULL,
    `aliasName` VARCHAR(191) NULL,
    `displayName` VARCHAR(191) NULL,
    `address` TEXT NULL,
    `image` LONGBLOB NULL,
    `cityId` INTEGER NULL,
    `pincode` INTEGER NULL,
    `panNo` VARCHAR(191) NULL,
    `tinNo` VARCHAR(191) NULL,
    `cstNo` VARCHAR(191) NULL,
    `cstDate` DATE NULL,
    `cinNo` VARCHAR(191) NULL,
    `faxNo` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `website` VARCHAR(191) NULL,
    `contactPersonName` VARCHAR(191) NULL,
    `gstNo` VARCHAR(191) NULL,
    `currencyId` INTEGER NULL,
    `costCode` VARCHAR(191) NULL,
    `active` BOOLEAN NULL DEFAULT true,
    `contactMobile` BIGINT NULL DEFAULT 0,
    `companyId` INTEGER NULL,
    `yarn` BOOLEAN NULL DEFAULT false,
    `fabric` BOOLEAN NULL DEFAULT false,
    `accessoryGroup` BOOLEAN NULL DEFAULT false,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,
    `createdById` INTEGER NULL,
    `updatedById` INTEGER NULL,
    `priceTemplateId` INTEGER NULL,
    `isSupplier` BOOLEAN NULL DEFAULT false,
    `isClient` BOOLEAN NULL DEFAULT false,
    `isIgst` BOOLEAN NULL DEFAULT false,
    `isVendor` BOOLEAN NULL DEFAULT false,
    `partyType` VARCHAR(191) NULL,
    `mobileNumber` VARCHAR(191) NULL,
    `mailId` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PartyBranch` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `branchName` VARCHAR(191) NULL,
    `branchCode` VARCHAR(191) NULL,
    `branchContact` VARCHAR(191) NULL,
    `branchEmail` LONGTEXT NULL,
    `partyId` INTEGER NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `branchAddress` LONGTEXT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PartyShippingAddress` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `partyBranchId` INTEGER NULL,
    `address` LONGTEXT NULL,
    `aliasName` LONGTEXT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PartyContactDetails` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `contactPersonName` VARCHAR(191) NULL,
    `mobileNo` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `partyBranchId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PartyBranchContactDetails` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `contactPersonName` VARCHAR(191) NULL,
    `mobileNo` INTEGER NULL,
    `email` VARCHAR(191) NULL,
    `branchName` VARCHAR(191) NULL,
    `branchCode` VARCHAR(191) NULL,
    `branchAddress` VARCHAR(191) NULL,
    `partyId` INTEGER NULL,
    `partyBranchId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Hsn` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `companyId` INTEGER NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PayTerm` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `days` INTEGER NOT NULL,
    `companyId` INTEGER NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TaxTerm` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `isPoWise` BOOLEAN NOT NULL DEFAULT false,
    `companyId` INTEGER NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TaxTemplate` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `companyId` INTEGER NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TaxTemplateDetails` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `taxTemplateId` INTEGER NOT NULL,
    `taxTermId` INTEGER NOT NULL,
    `displayName` VARCHAR(191) NOT NULL,
    `value` VARCHAR(191) NULL,
    `amount` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Location` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `storeName` VARCHAR(191) NOT NULL,
    `isFabric` BOOLEAN NOT NULL DEFAULT true,
    `isYarn` BOOLEAN NOT NULL DEFAULT true,
    `isAccessory` BOOLEAN NOT NULL DEFAULT true,
    `isGarments` BOOLEAN NOT NULL DEFAULT true,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `companyId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TermsAndConditions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `description` LONGTEXT NOT NULL,
    `companyId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `createdById` INTEGER NOT NULL,
    `updatedById` INTEGER NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `isPurchaseOrder` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BillEntry` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `supplierId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `createdById` INTEGER NOT NULL,
    `updatedById` INTEGER NULL,
    `branchId` INTEGER NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `storeId` INTEGER NULL,
    `docId` VARCHAR(191) NOT NULL,
    `payTermId` INTEGER NULL,
    `taxTemplateId` INTEGER NULL,
    `partyBillNo` VARCHAR(191) NULL,
    `netBillValue` INTEGER NULL,
    `discountValue` DOUBLE NULL DEFAULT 0,
    `partyBillDate` DATE NULL,
    `isProcessBillEntry` BOOLEAN NOT NULL DEFAULT false,
    `isDirect` BOOLEAN NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `order` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `branchId` INTEGER NULL,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,
    `createdById` INTEGER NULL,
    `updatedById` INTEGER NULL,
    `docId` VARCHAR(191) NULL,
    `orderdate` DATETIME(3) NULL,
    `customerId` INTEGER NULL,
    `supplierId` INTEGER NULL,
    `customerAddress` VARCHAR(191) NULL,
    `supplierAddress` VARCHAR(191) NULL,
    `poNumber` VARCHAR(191) NULL,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `userId` INTEGER NULL,
    `isApproval` BOOLEAN NOT NULL DEFAULT false,
    `buyerGmail` VARCHAR(191) NULL,
    `manufactureId` INTEGER NULL,
    `vendorId` INTEGER NULL,
    `excelFineName` VARCHAR(191) NULL,
    `isSave` BOOLEAN NULL,
    `excessQty` DOUBLE NULL,
    `netAmount` DOUBLE NULL,
    `deliverydate` DATETIME(3) NULL,
    `isApproved` VARCHAR(191) NULL,
    `isMailSent` BOOLEAN NULL,
    `poSentForApproval` BOOLEAN NULL,
    `docDate` DATETIME(3) NULL,
    `poStatus` VARCHAR(191) NULL,
    `approvalstatusReason` VARCHAR(191) NULL,
    `tagType` VARCHAR(191) NULL,
    `isPurchased` BOOLEAN NULL,
    `userRoleId` INTEGER NULL,
    `manufacturerMailId` VARCHAR(191) NULL,
    `proformaImage` TEXT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `orderBillItems` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orderId` INTEGER NULL,
    `fabCode` VARCHAR(191) NULL,
    `isPurchased` BOOLEAN NULL,
    `styleSheetId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SubGrid` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orderBillItemsId` INTEGER NULL,
    `fabType` VARCHAR(191) NULL,
    `fiberContent` VARCHAR(191) NULL,
    `weightGSM` VARCHAR(191) NULL,
    `widthFinished` VARCHAR(191) NULL,
    `priceFob` DOUBLE NULL,
    `surCharges` DOUBLE NULL,
    `colorId` INTEGER NULL,
    `quantity` DOUBLE NULL,
    `isPurchased` BOOLEAN NULL,
    `uomId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Po` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `createdById` INTEGER NULL,
    `updatedById` INTEGER NULL,
    `branchId` INTEGER NULL,
    `docId` VARCHAR(191) NULL,
    `date` DATETIME(3) NOT NULL,
    `revisedDate` DATETIME(3) NULL,
    `customerPoNumber` VARCHAR(191) NULL,
    `quantityAllowance` VARCHAR(191) NULL,
    `shippingMark` VARCHAR(191) NULL,
    `shipmentMode` VARCHAR(191) NULL,
    `shipDate` DATETIME(3) NULL,
    `deliveryTerm` VARCHAR(191) NULL,
    `portOrigin` VARCHAR(191) NULL,
    `finalDestination` VARCHAR(191) NULL,
    `paymentTerms` VARCHAR(191) NULL,
    `shipName` VARCHAR(191) NULL,
    `shipAddress` VARCHAR(191) NULL,
    `shipMobile` VARCHAR(191) NULL,
    `customerId` INTEGER NOT NULL,
    `supplierId` INTEGER NOT NULL,
    `orderId` INTEGER NULL,
    `proformaImage` JSON NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `poGrid` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `poId` INTEGER NOT NULL,
    `gridId` INTEGER NULL,
    `fabCode` VARCHAR(191) NULL,
    `styleSheetId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `poSubGrid` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `poGridId` INTEGER NOT NULL,
    `subgridId` INTEGER NULL,
    `fabType` VARCHAR(191) NULL,
    `fiberContent` VARCHAR(191) NULL,
    `weightGSM` VARCHAR(191) NULL,
    `widthFinished` VARCHAR(191) NULL,
    `priceFob` DOUBLE NULL,
    `surCharges` DOUBLE NULL,
    `quantity` DOUBLE NULL,
    `colorId` INTEGER NULL,
    `uomId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Email` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orderId` INTEGER NULL,
    `poExcelFileName` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `createdById` INTEGER NULL,
    `updatedById` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `percentage` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `qty` INTEGER NULL,
    `active` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OrderImport` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `docId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `createdById` INTEGER NOT NULL,
    `updatedById` INTEGER NULL,
    `branchId` INTEGER NULL,
    `companyId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OrderImportItems` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orderImportId` INTEGER NOT NULL,
    `department` VARCHAR(191) NULL,
    `class_Subclass` VARCHAR(191) NULL,
    `season_supplier_code` VARCHAR(191) NULL,
    `item_code` VARCHAR(191) NULL,
    `ean_barcode` VARCHAR(191) NULL,
    `style_code_group` VARCHAR(191) NULL,
    `mrp` VARCHAR(191) NULL,
    `month_year` VARCHAR(191) NULL,
    `product` VARCHAR(191) NULL,
    `size_desc` VARCHAR(191) NULL,
    `code` VARCHAR(191) NULL,
    `colour` VARCHAR(191) NULL,
    `qty` VARCHAR(191) NULL,
    `order_qty` VARCHAR(191) NULL,
    `po_number` VARCHAR(191) NULL,
    `class` VARCHAR(191) NULL,
    `manufacturer_mail_id` VARCHAR(191) NULL,
    `vendor_mail_id` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Attachments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `date` DATE NULL,
    `orderId` INTEGER NULL,
    `gridUser` VARCHAR(191) NULL,
    `fileName` VARCHAR(191) NULL,
    `filePath` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `createdById` INTEGER NULL,
    `updatedById` INTEGER NULL,
    `comments` LONGTEXT NULL,
    `log` LONGTEXT NULL,
    `isBuyerAttachments` BOOLEAN NULL DEFAULT false,
    `isVendorAttachments` BOOLEAN NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `controlPanel` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NULL,
    `active` BOOLEAN NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MailTransaction` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `date` DATE NULL,
    `orderId` INTEGER NULL,
    `senderName` VARCHAR(191) NULL,
    `receiverName` VARCHAR(191) NULL,
    `senderId` INTEGER NULL,
    `receiverId` INTEGER NULL,
    `from` LONGTEXT NULL,
    `to` LONGTEXT NULL,
    `cc` LONGTEXT NULL,
    `subject` LONGTEXT NULL,
    `messages` LONGTEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `createdById` INTEGER NULL,
    `updatedById` INTEGER NULL,
    `previousMailId` INTEGER NULL,
    `userName` VARCHAR(191) NULL,
    `userId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MailTransAttachments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `date` DATE NULL,
    `mailTransactionId` INTEGER NULL,
    `fileName` VARCHAR(191) NULL,
    `filePath` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ApprovalDoneBy` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `selectedApprover` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TagType` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NULL,
    `fileName` VARCHAR(191) NULL,
    `active` BOOLEAN NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StyleSheet` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `fdsDate` DATETIME(3) NULL,
    `fabCode` VARCHAR(191) NULL,
    `fabType` VARCHAR(191) NULL,
    `countryOriginFabric` VARCHAR(191) NULL,
    `countryOriginYarn` VARCHAR(191) NULL,
    `countryOriginFiber` VARCHAR(191) NULL,
    `smsMcq` VARCHAR(191) NULL,
    `smsMoq` VARCHAR(191) NULL,
    `smsLeadTime` VARCHAR(191) NULL,
    `bulkMcq` VARCHAR(191) NULL,
    `bulkMoq` VARCHAR(191) NULL,
    `bulkLeadTime` VARCHAR(191) NULL,
    `surCharges` DOUBLE NULL,
    `priceFob` DOUBLE NULL,
    `fabricImage` TEXT NULL,
    `construction` VARCHAR(191) NULL,
    `fiberContent` VARCHAR(191) NULL,
    `yarnDetails` VARCHAR(191) NULL,
    `weightGSM` VARCHAR(191) NULL,
    `weftWalesCount` VARCHAR(191) NULL,
    `widthFinished` VARCHAR(191) NULL,
    `widthCuttale` VARCHAR(191) NULL,
    `wrapCoursesCount` VARCHAR(191) NULL,
    `dyeName` VARCHAR(191) NULL,
    `dyedMethod` VARCHAR(191) NULL,
    `printingMethod` VARCHAR(191) NULL,
    `surfaceFinish` VARCHAR(191) NULL,
    `otherPerformanceFunction` VARCHAR(191) NULL,
    `materialCode` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LineMaster` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `lineNo` VARCHAR(191) NULL,
    `lineName` VARCHAR(191) NULL,
    `sewingMachineQty` VARCHAR(191) NULL,
    `helperQty` VARCHAR(191) NULL,
    `OperationQty` VARCHAR(191) NULL,
    `active` BOOLEAN NOT NULL DEFAULT false,
    `companyId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Fabric` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NULL,
    `number` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Color` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `pantone` VARCHAR(191) NOT NULL,
    `companyId` INTEGER NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `isGrey` BOOLEAN NOT NULL DEFAULT false,
    `number` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UnitOfMeasurement` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `isCutting` BOOLEAN NOT NULL DEFAULT false,
    `companyId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `purchaseInwardEntry` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `createdById` INTEGER NULL,
    `updatedById` INTEGER NULL,
    `branchId` INTEGER NULL,
    `poId` INTEGER NULL,
    `date` DATETIME(3) NULL,
    `isPurchased` BOOLEAN NOT NULL DEFAULT false,
    `orderId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `purchaseInwardEntryGrid` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `purchaseInwardEntryId` INTEGER NULL,
    `styleSheetId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `purchaseInwardEntrySubGrid` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `purchaseInwardEntryGridId` INTEGER NULL,
    `colorId` INTEGER NULL,
    `uomId` INTEGER NULL,
    `fabType` VARCHAR(191) NULL,
    `fiberContent` VARCHAR(191) NULL,
    `quantity` DOUBLE NULL,
    `actualQuantity` DOUBLE NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PartyMasterNew` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,
    `createdById` INTEGER NULL,
    `updatedById` INTEGER NULL,
    `isSupplier` BOOLEAN NULL DEFAULT false,
    `isClient` BOOLEAN NULL DEFAULT false,
    `name` VARCHAR(191) NULL,
    `aliasName` VARCHAR(191) NULL,
    `partyCode` VARCHAR(191) NULL,
    `active` BOOLEAN NULL DEFAULT true,
    `displayName` VARCHAR(191) NULL,
    `address` LONGTEXT NULL,
    `landMark` VARCHAR(191) NULL,
    `cityId` INTEGER NULL,
    `pincode` INTEGER NULL,
    `email` VARCHAR(191) NULL,
    `contact` BIGINT NULL,
    `contactPersonName` VARCHAR(191) NULL,
    `designation` VARCHAR(191) NULL,
    `department` VARCHAR(191) NULL,
    `contactPersonEmail` VARCHAR(191) NULL,
    `contactPersonNumber` BIGINT NULL,
    `alterContactNumber` BIGINT NULL,
    `currencyId` INTEGER NULL,
    `payTermId` INTEGER NULL,
    `panNo` VARCHAR(191) NULL,
    `gstNo` VARCHAR(191) NULL,
    `msmeNo` VARCHAR(191) NULL,
    `cinNo` VARCHAR(191) NULL,
    `bankName` VARCHAR(191) NULL,
    `bankBranchName` VARCHAR(191) NULL,
    `accountNumber` BIGINT NULL,
    `ifscCode` VARCHAR(191) NULL,
    `companyId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SampleEntry` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,
    `createdById` INTEGER NULL,
    `updatedById` INTEGER NULL,
    `branchId` INTEGER NULL,
    `date` DATETIME(3) NULL,
    `submitter` VARCHAR(191) NULL,
    `submittingTo` VARCHAR(191) NULL,
    `supplierId` INTEGER NULL,
    `supplierAddress` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sampleEntryGrid` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sampleEntryId` INTEGER NULL,
    `fabCode` VARCHAR(191) NULL,
    `styleSheetId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sampleEntrySubGrid` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sampleEntryGridId` INTEGER NULL,
    `fabType` VARCHAR(191) NULL,
    `fiberContent` VARCHAR(191) NULL,
    `weightGSM` VARCHAR(191) NULL,
    `widthFinished` VARCHAR(191) NULL,
    `smsMcq` VARCHAR(191) NULL,
    `smsMoq` VARCHAR(191) NULL,
    `smsLeadTime` VARCHAR(191) NULL,
    `fabricImage` TEXT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `poAttachments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,
    `createdById` INTEGER NULL,
    `updatedById` INTEGER NULL,
    `branchId` INTEGER NULL,
    `poId` INTEGER NULL,
    `date` DATETIME(3) NULL,
    `comments` LONGTEXT NULL,
    `fileName` VARCHAR(191) NULL,
    `filePath` VARCHAR(191) NULL,
    `log` LONGTEXT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Designation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NULL,
    `code` VARCHAR(191) NULL,
    `active` BOOLEAN NULL DEFAULT true,
    `departmentId` INTEGER NULL,
    `companyId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Shift` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `createdById` INTEGER NULL,
    `updatedById` INTEGER NULL,
    `companyId` INTEGER NULL,
    `branchId` INTEGER NULL,
    `name` VARCHAR(191) NULL,
    `description` VARCHAR(191) NULL,
    `docId` VARCHAR(191) NULL,
    `active` BOOLEAN NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ShiftCommonTemplate` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `createdById` INTEGER NULL,
    `updatedById` INTEGER NULL,
    `companyId` INTEGER NULL,
    `branchId` INTEGER NULL,
    `employeeCategoryId` INTEGER NULL,
    `docId` VARCHAR(191) NULL,
    `active` BOOLEAN NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ShiftTemplate` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `createdById` INTEGER NULL,
    `updatedById` INTEGER NULL,
    `companyId` INTEGER NULL,
    `branchId` INTEGER NULL,
    `name` VARCHAR(191) NULL,
    `docId` VARCHAR(191) NULL,
    `active` BOOLEAN NULL DEFAULT true,
    `category` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ShiftTemplateItems` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `shiftTemplateId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `createdById` INTEGER NULL,
    `updatedById` INTEGER NULL,
    `name` VARCHAR(191) NULL,
    `docId` VARCHAR(191) NULL,
    `active` BOOLEAN NULL DEFAULT true,
    `templateId` INTEGER NULL,
    `shiftId` INTEGER NULL,
    `inNextDay` VARCHAR(191) NULL,
    `toleranceInBeforeStart` VARCHAR(191) NULL,
    `startTime` VARCHAR(191) NULL,
    `toleranceInAfterEnd` VARCHAR(191) NULL,
    `fbOut` VARCHAR(191) NULL,
    `fbIn` VARCHAR(191) NULL,
    `lunchBst` VARCHAR(191) NULL,
    `lBSNDay` VARCHAR(191) NULL,
    `lunchBET` VARCHAR(191) NULL,
    `lBEnday` VARCHAR(191) NULL,
    `sbOut` VARCHAR(191) NULL,
    `sbIn` VARCHAR(191) NULL,
    `toleranceOutBeforeStart` VARCHAR(191) NULL,
    `endTime` VARCHAR(191) NULL,
    `toleranceOutAfterEnd` VARCHAR(191) NULL,
    `outNxtDay` VARCHAR(191) NULL,
    `shiftTimeHrs` VARCHAR(191) NULL,
    `otHrs` VARCHAR(191) NULL,
    `quater` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PayFrequency` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,
    `createdById` INTEGER NULL,
    `updatedById` INTEGER NULL,
    `name` VARCHAR(191) NULL,
    `active` BOOLEAN NULL DEFAULT true,
    `payFrequencyType` VARCHAR(191) NULL,
    `finYearId` INTEGER NULL,
    `companyId` INTEGER NULL,
    `branchId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PayFrequencyItems` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `payFrequencyId` INTEGER NULL,
    `startDate` DATETIME(3) NULL,
    `endDate` DATETIME(3) NULL,
    `salaryDate` DATETIME(3) NULL,
    `notes` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Page` ADD CONSTRAINT `Page_pageGroupId_fkey` FOREIGN KEY (`pageGroupId`) REFERENCES `PageGroup`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Subscription` ADD CONSTRAINT `Subscription_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Branch` ADD CONSTRAINT `Branch_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserOnBranch` ADD CONSTRAINT `UserOnBranch_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserOnBranch` ADD CONSTRAINT `UserOnBranch_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Role` ADD CONSTRAINT `Role_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RoleOnPage` ADD CONSTRAINT `RoleOnPage_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `Role`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RoleOnPage` ADD CONSTRAINT `RoleOnPage_pageId_fkey` FOREIGN KEY (`pageId`) REFERENCES `Page`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `Employee`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `Role`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Employee` ADD CONSTRAINT `Employee_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `Department`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Employee` ADD CONSTRAINT `Employee_designationId_fkey` FOREIGN KEY (`designationId`) REFERENCES `Designation`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Employee` ADD CONSTRAINT `Employee_localCityId_fkey` FOREIGN KEY (`localCityId`) REFERENCES `City`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Employee` ADD CONSTRAINT `Employee_permCityId_fkey` FOREIGN KEY (`permCityId`) REFERENCES `City`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Employee` ADD CONSTRAINT `Employee_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Employee` ADD CONSTRAINT `Employee_employeeCategoryId_fkey` FOREIGN KEY (`employeeCategoryId`) REFERENCES `EmployeeCategory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Employee` ADD CONSTRAINT `Employee_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Employee` ADD CONSTRAINT `Employee_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FinYear` ADD CONSTRAINT `FinYear_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EmployeeCategory` ADD CONSTRAINT `EmployeeCategory_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Country` ADD CONSTRAINT `Country_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `State` ADD CONSTRAINT `State_countryId_fkey` FOREIGN KEY (`countryId`) REFERENCES `Country`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `City` ADD CONSTRAINT `City_stateId_fkey` FOREIGN KEY (`stateId`) REFERENCES `State`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Department` ADD CONSTRAINT `Department_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PartyCategory` ADD CONSTRAINT `PartyCategory_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Currency` ADD CONSTRAINT `Currency_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Party` ADD CONSTRAINT `Party_cityId_fkey` FOREIGN KEY (`cityId`) REFERENCES `City`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Party` ADD CONSTRAINT `Party_currencyId_fkey` FOREIGN KEY (`currencyId`) REFERENCES `Currency`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Party` ADD CONSTRAINT `Party_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Party` ADD CONSTRAINT `Party_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Party` ADD CONSTRAINT `Party_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PartyBranch` ADD CONSTRAINT `PartyBranch_partyId_fkey` FOREIGN KEY (`partyId`) REFERENCES `Party`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PartyShippingAddress` ADD CONSTRAINT `PartyShippingAddress_partyBranchId_fkey` FOREIGN KEY (`partyBranchId`) REFERENCES `PartyBranch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PartyContactDetails` ADD CONSTRAINT `PartyContactDetails_partyBranchId_fkey` FOREIGN KEY (`partyBranchId`) REFERENCES `PartyBranch`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PartyBranchContactDetails` ADD CONSTRAINT `PartyBranchContactDetails_partyId_fkey` FOREIGN KEY (`partyId`) REFERENCES `Party`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PartyBranchContactDetails` ADD CONSTRAINT `PartyBranchContactDetails_partyBranchId_fkey` FOREIGN KEY (`partyBranchId`) REFERENCES `PartyBranch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Hsn` ADD CONSTRAINT `Hsn_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PayTerm` ADD CONSTRAINT `PayTerm_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TaxTerm` ADD CONSTRAINT `TaxTerm_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TaxTemplate` ADD CONSTRAINT `TaxTemplate_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TaxTemplateDetails` ADD CONSTRAINT `TaxTemplateDetails_taxTemplateId_fkey` FOREIGN KEY (`taxTemplateId`) REFERENCES `TaxTemplate`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TaxTemplateDetails` ADD CONSTRAINT `TaxTemplateDetails_taxTermId_fkey` FOREIGN KEY (`taxTermId`) REFERENCES `TaxTerm`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Location` ADD CONSTRAINT `Location_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TermsAndConditions` ADD CONSTRAINT `TermsAndConditions_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TermsAndConditions` ADD CONSTRAINT `TermsAndConditions_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TermsAndConditions` ADD CONSTRAINT `TermsAndConditions_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BillEntry` ADD CONSTRAINT `BillEntry_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Location`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BillEntry` ADD CONSTRAINT `BillEntry_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `Party`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BillEntry` ADD CONSTRAINT `BillEntry_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BillEntry` ADD CONSTRAINT `BillEntry_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BillEntry` ADD CONSTRAINT `BillEntry_payTermId_fkey` FOREIGN KEY (`payTermId`) REFERENCES `PayTerm`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order` ADD CONSTRAINT `order_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order` ADD CONSTRAINT `order_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order` ADD CONSTRAINT `order_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order` ADD CONSTRAINT `order_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `Party`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order` ADD CONSTRAINT `order_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `Party`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order` ADD CONSTRAINT `order_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order` ADD CONSTRAINT `order_manufactureId_fkey` FOREIGN KEY (`manufactureId`) REFERENCES `Party`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order` ADD CONSTRAINT `order_vendorId_fkey` FOREIGN KEY (`vendorId`) REFERENCES `Party`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order` ADD CONSTRAINT `order_userRoleId_fkey` FOREIGN KEY (`userRoleId`) REFERENCES `Role`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orderBillItems` ADD CONSTRAINT `orderBillItems_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orderBillItems` ADD CONSTRAINT `orderBillItems_styleSheetId_fkey` FOREIGN KEY (`styleSheetId`) REFERENCES `StyleSheet`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SubGrid` ADD CONSTRAINT `SubGrid_orderBillItemsId_fkey` FOREIGN KEY (`orderBillItemsId`) REFERENCES `orderBillItems`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SubGrid` ADD CONSTRAINT `SubGrid_colorId_fkey` FOREIGN KEY (`colorId`) REFERENCES `Color`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SubGrid` ADD CONSTRAINT `SubGrid_uomId_fkey` FOREIGN KEY (`uomId`) REFERENCES `UnitOfMeasurement`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Po` ADD CONSTRAINT `Po_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Po` ADD CONSTRAINT `Po_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Po` ADD CONSTRAINT `Po_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Po` ADD CONSTRAINT `Po_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `Party`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Po` ADD CONSTRAINT `Po_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `Party`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Po` ADD CONSTRAINT `Po_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `order`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `poGrid` ADD CONSTRAINT `poGrid_poId_fkey` FOREIGN KEY (`poId`) REFERENCES `Po`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `poGrid` ADD CONSTRAINT `poGrid_gridId_fkey` FOREIGN KEY (`gridId`) REFERENCES `orderBillItems`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `poGrid` ADD CONSTRAINT `poGrid_styleSheetId_fkey` FOREIGN KEY (`styleSheetId`) REFERENCES `StyleSheet`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `poSubGrid` ADD CONSTRAINT `poSubGrid_subgridId_fkey` FOREIGN KEY (`subgridId`) REFERENCES `SubGrid`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `poSubGrid` ADD CONSTRAINT `poSubGrid_poGridId_fkey` FOREIGN KEY (`poGridId`) REFERENCES `poGrid`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `poSubGrid` ADD CONSTRAINT `poSubGrid_colorId_fkey` FOREIGN KEY (`colorId`) REFERENCES `Color`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `poSubGrid` ADD CONSTRAINT `poSubGrid_uomId_fkey` FOREIGN KEY (`uomId`) REFERENCES `UnitOfMeasurement`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Email` ADD CONSTRAINT `Email_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Email` ADD CONSTRAINT `Email_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Email` ADD CONSTRAINT `Email_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderImport` ADD CONSTRAINT `OrderImport_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderImport` ADD CONSTRAINT `OrderImport_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderImport` ADD CONSTRAINT `OrderImport_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderImport` ADD CONSTRAINT `OrderImport_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderImportItems` ADD CONSTRAINT `OrderImportItems_orderImportId_fkey` FOREIGN KEY (`orderImportId`) REFERENCES `OrderImport`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Attachments` ADD CONSTRAINT `Attachments_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Attachments` ADD CONSTRAINT `Attachments_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Attachments` ADD CONSTRAINT `Attachments_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MailTransaction` ADD CONSTRAINT `MailTransaction_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MailTransaction` ADD CONSTRAINT `MailTransaction_senderId_fkey` FOREIGN KEY (`senderId`) REFERENCES `Party`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MailTransaction` ADD CONSTRAINT `MailTransaction_receiverId_fkey` FOREIGN KEY (`receiverId`) REFERENCES `Party`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MailTransaction` ADD CONSTRAINT `MailTransaction_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MailTransaction` ADD CONSTRAINT `MailTransaction_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MailTransaction` ADD CONSTRAINT `MailTransaction_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MailTransAttachments` ADD CONSTRAINT `MailTransAttachments_mailTransactionId_fkey` FOREIGN KEY (`mailTransactionId`) REFERENCES `MailTransaction`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LineMaster` ADD CONSTRAINT `LineMaster_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Color` ADD CONSTRAINT `Color_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UnitOfMeasurement` ADD CONSTRAINT `UnitOfMeasurement_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `purchaseInwardEntry` ADD CONSTRAINT `purchaseInwardEntry_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `purchaseInwardEntry` ADD CONSTRAINT `purchaseInwardEntry_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `purchaseInwardEntry` ADD CONSTRAINT `purchaseInwardEntry_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `purchaseInwardEntry` ADD CONSTRAINT `purchaseInwardEntry_poId_fkey` FOREIGN KEY (`poId`) REFERENCES `Po`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `purchaseInwardEntry` ADD CONSTRAINT `purchaseInwardEntry_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `order`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `purchaseInwardEntryGrid` ADD CONSTRAINT `purchaseInwardEntryGrid_purchaseInwardEntryId_fkey` FOREIGN KEY (`purchaseInwardEntryId`) REFERENCES `purchaseInwardEntry`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `purchaseInwardEntryGrid` ADD CONSTRAINT `purchaseInwardEntryGrid_styleSheetId_fkey` FOREIGN KEY (`styleSheetId`) REFERENCES `StyleSheet`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `purchaseInwardEntrySubGrid` ADD CONSTRAINT `purchaseInwardEntrySubGrid_purchaseInwardEntryGridId_fkey` FOREIGN KEY (`purchaseInwardEntryGridId`) REFERENCES `purchaseInwardEntryGrid`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `purchaseInwardEntrySubGrid` ADD CONSTRAINT `purchaseInwardEntrySubGrid_colorId_fkey` FOREIGN KEY (`colorId`) REFERENCES `Color`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `purchaseInwardEntrySubGrid` ADD CONSTRAINT `purchaseInwardEntrySubGrid_uomId_fkey` FOREIGN KEY (`uomId`) REFERENCES `UnitOfMeasurement`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PartyMasterNew` ADD CONSTRAINT `PartyMasterNew_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PartyMasterNew` ADD CONSTRAINT `PartyMasterNew_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PartyMasterNew` ADD CONSTRAINT `PartyMasterNew_cityId_fkey` FOREIGN KEY (`cityId`) REFERENCES `City`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PartyMasterNew` ADD CONSTRAINT `PartyMasterNew_currencyId_fkey` FOREIGN KEY (`currencyId`) REFERENCES `Currency`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PartyMasterNew` ADD CONSTRAINT `PartyMasterNew_payTermId_fkey` FOREIGN KEY (`payTermId`) REFERENCES `PayTerm`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PartyMasterNew` ADD CONSTRAINT `PartyMasterNew_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SampleEntry` ADD CONSTRAINT `SampleEntry_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SampleEntry` ADD CONSTRAINT `SampleEntry_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SampleEntry` ADD CONSTRAINT `SampleEntry_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SampleEntry` ADD CONSTRAINT `SampleEntry_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `Party`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sampleEntryGrid` ADD CONSTRAINT `sampleEntryGrid_sampleEntryId_fkey` FOREIGN KEY (`sampleEntryId`) REFERENCES `SampleEntry`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sampleEntryGrid` ADD CONSTRAINT `sampleEntryGrid_styleSheetId_fkey` FOREIGN KEY (`styleSheetId`) REFERENCES `StyleSheet`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sampleEntrySubGrid` ADD CONSTRAINT `sampleEntrySubGrid_sampleEntryGridId_fkey` FOREIGN KEY (`sampleEntryGridId`) REFERENCES `sampleEntryGrid`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `poAttachments` ADD CONSTRAINT `poAttachments_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `poAttachments` ADD CONSTRAINT `poAttachments_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `poAttachments` ADD CONSTRAINT `poAttachments_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `poAttachments` ADD CONSTRAINT `poAttachments_poId_fkey` FOREIGN KEY (`poId`) REFERENCES `Po`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Designation` ADD CONSTRAINT `Designation_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `Department`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Designation` ADD CONSTRAINT `Designation_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Shift` ADD CONSTRAINT `Shift_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Shift` ADD CONSTRAINT `Shift_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Shift` ADD CONSTRAINT `Shift_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Shift` ADD CONSTRAINT `Shift_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ShiftCommonTemplate` ADD CONSTRAINT `ShiftCommonTemplate_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ShiftCommonTemplate` ADD CONSTRAINT `ShiftCommonTemplate_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ShiftCommonTemplate` ADD CONSTRAINT `ShiftCommonTemplate_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ShiftCommonTemplate` ADD CONSTRAINT `ShiftCommonTemplate_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ShiftCommonTemplate` ADD CONSTRAINT `ShiftCommonTemplate_employeeCategoryId_fkey` FOREIGN KEY (`employeeCategoryId`) REFERENCES `EmployeeCategory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ShiftTemplate` ADD CONSTRAINT `ShiftTemplate_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ShiftTemplate` ADD CONSTRAINT `ShiftTemplate_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ShiftTemplate` ADD CONSTRAINT `ShiftTemplate_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ShiftTemplate` ADD CONSTRAINT `ShiftTemplate_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ShiftTemplateItems` ADD CONSTRAINT `ShiftTemplateItems_shiftTemplateId_fkey` FOREIGN KEY (`shiftTemplateId`) REFERENCES `ShiftTemplate`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ShiftTemplateItems` ADD CONSTRAINT `ShiftTemplateItems_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ShiftTemplateItems` ADD CONSTRAINT `ShiftTemplateItems_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PayFrequency` ADD CONSTRAINT `PayFrequency_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PayFrequency` ADD CONSTRAINT `PayFrequency_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PayFrequency` ADD CONSTRAINT `PayFrequency_finYearId_fkey` FOREIGN KEY (`finYearId`) REFERENCES `FinYear`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PayFrequency` ADD CONSTRAINT `PayFrequency_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PayFrequency` ADD CONSTRAINT `PayFrequency_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PayFrequencyItems` ADD CONSTRAINT `PayFrequencyItems_payFrequencyId_fkey` FOREIGN KEY (`payFrequencyId`) REFERENCES `PayFrequency`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
