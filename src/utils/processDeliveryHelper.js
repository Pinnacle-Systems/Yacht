export async function updateProgramDetails(tx, program, processDelivery) {
    let programDetails;
    if (!(program?.id)) {
        programDetails = await tx.processDeliveryProgramDetails.create({
            data: {
                processDeliveryId: processDelivery.id,
                yarnId: program?.yarnId ? parseInt(program.yarnId) : undefined,
                fabricId: program?.fabricId ? parseInt(program.fabricId) : undefined,
                colorId: program?.colorId ? parseInt(program.colorId) : undefined,
                uomId: program?.uomId ? parseInt(program.uomId) : undefined,
                designId: program?.designId ? parseInt(program.designId) : undefined,
                gaugeId: program?.gaugeId ? parseInt(program.gaugeId) : undefined,
                loopLengthId: program?.loopLengthId ? parseInt(program.loopLengthId) : undefined,
                gsmId: program?.gsmId ? parseInt(program.gsmId) : undefined,
                sizeId: program?.sizeId ? parseInt(program.sizeId) : undefined,
                kDiaId: program?.kDiaId ? parseInt(program.kDiaId) : undefined,
                fDiaId: program?.fDiaId ? parseInt(program.fDiaId) : undefined,
                noOfBags: program?.noOfBags ? parseInt(program.noOfBags) : undefined,
                weightPerBag: program?.weightPerBag ? parseFloat(program.weightPerBag) : undefined,
                qty: program?.qty ? parseFloat(program.qty) : undefined,
                processCost: program?.processCost ? parseFloat(program.processCost) : undefined,
            }
        })
    } else {
        programDetails = await tx.processDeliveryProgramDetails.update({
            where: {
                id: parseInt(program.id)
            },
            data: {
                processDeliveryId: processDelivery.id,
                yarnId: program?.yarnId ? parseInt(program.yarnId) : undefined,
                fabricId: program?.fabricId ? parseInt(program.fabricId) : undefined,
                colorId: program?.colorId ? parseInt(program.colorId) : undefined,
                uomId: program?.uomId ? parseInt(program.uomId) : undefined,
                designId: program?.designId ? parseInt(program.designId) : undefined,
                gaugeId: program?.gaugeId ? parseInt(program.gaugeId) : undefined,
                loopLengthId: program?.loopLengthId ? parseInt(program.loopLengthId) : undefined,
                gsmId: program?.gsmId ? parseInt(program.gsmId) : undefined,
                sizeId: program?.sizeId ? parseInt(program.sizeId) : undefined,
                kDiaId: program?.kDiaId ? parseInt(program.kDiaId) : undefined,
                fDiaId: program?.fDiaId ? parseInt(program.fDiaId) : undefined,
                noOfBags: program?.noOfBags ? parseInt(program.noOfBags) : undefined,
                weightPerBag: program?.weightPerBag ? parseFloat(program.weightPerBag) : undefined,
                qty: program?.qty ? parseFloat(program.qty) : undefined,
                processCost: program?.processCost ? parseFloat(program.processCost) : undefined,
            },
            include:{
                rawMaterials: true
            }
        })

        let removedItems = programDetails.rawMaterials.filter(oldItem => {
            let result = program.rawMaterials.find(newItem => newItem.id === oldItem.id)
            if (result) return false
            return true
        }).map(item => parseInt(item.stockId));
        await tx.stock.deleteMany({
            where: {
                id: {
                    in: removedItems
                }
            }
        })
    }
    await (async function updateRawMaterials() {
        let promises = program.rawMaterials.map(async (item) =>
            await updateRawMaterialWithStock(tx, item, programDetails.id, processDelivery))
        return Promise.all(promises)
    })()
}

async function updateRawMaterialWithStock(tx, item, processDeliveryProgramDetailsId, processDelivery) {
    if (item.stockId) {
        return await tx.stock.update({
            where: {
                id: parseInt(item.stockId)
            },
            data: {
                itemType: processDelivery.itemType,
                inOrOut: "ProcessDelivery",
                branchId: parseInt(processDelivery.branchId),
                yarnId: item?.yarnId ? parseInt(item.yarnId) : undefined,
                fabricId: item?.fabricId ? parseInt(item.fabricId) : undefined,
                colorId: item?.colorId ? parseInt(item.colorId) : undefined,
                uomId: item?.uomId ? parseInt(item.uomId) : undefined,
                designId: item?.designId ? parseInt(item.designId) : undefined,
                gaugeId: item?.gaugeId ? parseInt(item.gaugeId) : undefined,
                loopLengthId: item?.loopLengthId ? parseInt(item.loopLengthId) : undefined,
                gsmId: item?.gsmId ? parseInt(item.gsmId) : undefined,
                sizeId: item?.sizeId ? parseInt(item.sizeId) : undefined,
                kDiaId: item?.kDiaId ? parseInt(item.kDiaId) : undefined,
                fDiaId: item?.fDiaId ? parseInt(item.fDiaId) : undefined,
                noOfBags: item?.noOfBags ? 0 - parseInt(item.noOfBags) : undefined,
                noOfRolls: item?.noOfRolls ? 0 - parseInt(item.noOfRolls) : undefined,
                qty: item?.qty ? 0 - parseFloat(item.qty) : undefined,
                price: item?.stockPrice ? parseFloat(item.stockPrice) : undefined,
                storeId: parseInt(processDelivery.storeId),
                lotNo: item?.lotNo ? item.lotNo : undefined,
                processId: item?.processId ? parseInt(item.processId) : undefined,
                RawMaterials: {
                    update: {
                        processDeliveryProgramDetailsId: parseInt(processDeliveryProgramDetailsId),
                        yarnId: item?.yarnId ? parseInt(item.yarnId) : undefined,
                        fabricId: item?.fabricId ? parseInt(item.fabricId) : undefined,
                        colorId: item?.colorId ? parseInt(item.colorId) : undefined,
                        uomId: item?.uomId ? parseInt(item.uomId) : undefined,
                        designId: item?.designId ? parseInt(item.designId) : undefined,
                        gaugeId: item?.gaugeId ? parseInt(item.gaugeId) : undefined,
                        loopLengthId: item?.loopLengthId ? parseInt(item.loopLengthId) : undefined,
                        gsmId: item?.gsmId ? parseInt(item.gsmId) : undefined,
                        sizeId: item?.sizeId ? parseInt(item.sizeId) : undefined,
                        kDiaId: item?.kDiaId ? parseInt(item.kDiaId) : undefined,
                        fDiaId: item?.fDiaId ? parseInt(item.fDiaId) : undefined,
                        noOfBags: item?.noOfBags ? parseInt(item.noOfBags) : undefined,
                        noOfRolls: item?.noOfRolls ? parseInt(item.noOfRolls) : undefined,
                        weightPerBag: item?.weightPerBag ? parseFloat(item.weightPerBag) : undefined,
                        qty: item?.qty ? parseFloat(item.qty) : undefined,
                        stockQty: item?.stockQty ? parseFloat(item.stockQty) : undefined,
                        stockBags: item?.stockBags ? parseInt(item.stockBags) : undefined,
                        stockRolls: item?.stockRolls ? parseInt(item.stockRolls) : undefined,
                        lotNo: item?.lotNo ? item.lotNo : undefined,
                        processId: item?.processId ? parseInt(item.processId) : undefined,
                    }
                }
            }
        })
    }
    return await tx.stock.create({
        data: {
            itemType: processDelivery.itemType,
            inOrOut: "ProcessDelivery",
            branchId: parseInt(processDelivery.branchId),
            yarnId: item?.yarnId ? parseInt(item.yarnId) : undefined,
            fabricId: item?.fabricId ? parseInt(item.fabricId) : undefined,
            colorId: item?.colorId ? parseInt(item.colorId) : undefined,
            uomId: item?.uomId ? parseInt(item.uomId) : undefined,
            designId: item?.designId ? parseInt(item.designId) : undefined,
            gaugeId: item?.gaugeId ? parseInt(item.gaugeId) : undefined,
            loopLengthId: item?.loopLengthId ? parseInt(item.loopLengthId) : undefined,
            gsmId: item?.gsmId ? parseInt(item.gsmId) : undefined,
            sizeId: item?.sizeId ? parseInt(item.sizeId) : undefined,
            kDiaId: item?.kDiaId ? parseInt(item.kDiaId) : undefined,
            fDiaId: item?.fDiaId ? parseInt(item.fDiaId) : undefined,
            noOfBags: item?.noOfBags ? 0 - parseInt(item.noOfBags) : undefined,
            noOfRolls: item?.noOfRolls ? 0 - parseInt(item.noOfRolls) : undefined,
            qty: item?.qty ? 0 - parseFloat(item.qty) : undefined,
            price: parseFloat(item?.stockPrice),
            storeId: parseInt(processDelivery.storeId),
            lotNo: item?.lotNo ? item.lotNo : undefined,
            processId: item?.processId ? parseInt(item.processId) : undefined,
            RawMaterials: {
                create: {
                    processDeliveryProgramDetailsId: parseInt(processDeliveryProgramDetailsId),
                    yarnId: item?.yarnId ? parseInt(item.yarnId) : undefined,
                    fabricId: item?.fabricId ? parseInt(item.fabricId) : undefined,
                    colorId: item?.colorId ? parseInt(item.colorId) : undefined,
                    uomId: item?.uomId ? parseInt(item.uomId) : undefined,
                    designId: item?.designId ? parseInt(item.designId) : undefined,
                    gaugeId: item?.gaugeId ? parseInt(item.gaugeId) : undefined,
                    loopLengthId: item?.loopLengthId ? parseInt(item.loopLengthId) : undefined,
                    gsmId: item?.gsmId ? parseInt(item.gsmId) : undefined,
                    sizeId: item?.sizeId ? parseInt(item.sizeId) : undefined,
                    kDiaId: item?.kDiaId ? parseInt(item.kDiaId) : undefined,
                    fDiaId: item?.fDiaId ? parseInt(item.fDiaId) : undefined,
                    noOfBags: item?.noOfBags ? parseInt(item.noOfBags) : undefined,
                    noOfRolls: item?.noOfRolls ? parseInt(item.noOfRolls) : undefined,
                    weightPerBag: item?.weightPerBag ? parseFloat(item.weightPerBag) : undefined,
                    qty: item?.qty ? parseFloat(item.qty) : undefined,
                    stockQty: item?.stockQty ? parseFloat(item.stockQty) : undefined,
                    stockBags: item?.stockBags ? parseInt(item.stockBags) : undefined,
                    stockRolls: item?.stockRolls ? parseInt(item.stockRolls) : undefined,
                    stockPrice: parseFloat(item.stockPrice),
                    lotNo: item?.lotNo ? item.lotNo : undefined,
                    processId: item?.processId ? parseInt(item.processId) : undefined,
                }
            }
        }
    })
}


export async function createProgramDetails(tx, program, processDelivery) {
    let programDetails = await tx.processDeliveryProgramDetails.create({
        data: {
            processDeliveryId: processDelivery.id,
            yarnId: program?.yarnId ? parseInt(program.yarnId) : undefined,
            fabricId: program?.fabricId ? parseInt(program.fabricId) : undefined,
            colorId: program?.colorId ? parseInt(program.colorId) : undefined,
            uomId: program?.uomId ? parseInt(program.uomId) : undefined,
            designId: program?.designId ? parseInt(program.designId) : undefined,
            gaugeId: program?.gaugeId ? parseInt(program.gaugeId) : undefined,
            loopLengthId: program?.loopLengthId ? parseInt(program.loopLengthId) : undefined,
            gsmId: program?.gsmId ? parseInt(program.gsmId) : undefined,
            sizeId: program?.sizeId ? parseInt(program.sizeId) : undefined,
            kDiaId: program?.kDiaId ? parseInt(program.kDiaId) : undefined,
            fDiaId: program?.fDiaId ? parseInt(program.fDiaId) : undefined,
            noOfBags: program?.noOfBags ? parseInt(program.noOfBags) : undefined,
            weightPerBag: program?.weightPerBag ? parseFloat(program.weightPerBag) : undefined,
            qty: program?.qty ? parseFloat(program.qty) : undefined,
            processCost: program?.processCost ? parseFloat(program.processCost) : undefined,
        }
    })
    await (async function createRawMaterials() {
        let promises = program.rawMaterials.map(async (item) =>
            await createRawMaterialWithStock(tx, item, programDetails.id, processDelivery))
        return Promise.all(promises)
    })()
}

async function createRawMaterialWithStock(tx, item, processDeliveryProgramDetailsId, processDelivery) {
    return await tx.stock.create({
        data: {
            itemType: processDelivery.itemType,
            inOrOut: "ProcessDelivery",
            branchId: parseInt(processDelivery.branchId),
            yarnId: item?.yarnId ? parseInt(item.yarnId) : undefined,
            fabricId: item?.fabricId ? parseInt(item.fabricId) : undefined,
            colorId: item?.colorId ? parseInt(item.colorId) : undefined,
            uomId: item?.uomId ? parseInt(item.uomId) : undefined,
            designId: item?.designId ? parseInt(item.designId) : undefined,
            gaugeId: item?.gaugeId ? parseInt(item.gaugeId) : undefined,
            loopLengthId: item?.loopLengthId ? parseInt(item.loopLengthId) : undefined,
            gsmId: item?.gsmId ? parseInt(item.gsmId) : undefined,
            sizeId: item?.sizeId ? parseInt(item.sizeId) : undefined,
            kDiaId: item?.kDiaId ? parseInt(item.kDiaId) : undefined,
            fDiaId: item?.fDiaId ? parseInt(item.fDiaId) : undefined,
            noOfBags: item?.noOfBags ? 0 - parseInt(item.noOfBags) : undefined,
            noOfRolls: item?.noOfRolls ? 0 - parseInt(item.noOfRolls) : undefined,
            qty: item?.qty ? 0 - parseFloat(item.qty) : undefined,
            price: parseFloat(item.stockPrice),
            storeId: parseInt(processDelivery.storeId),
            lotNo: item?.lotNo ? item.lotNo : undefined,
            processId: item?.processId ? parseInt(item.processId) : undefined,
            RawMaterials: {
                create: {
                    processDeliveryProgramDetailsId: parseInt(processDeliveryProgramDetailsId),
                    yarnId: item?.yarnId ? parseInt(item.yarnId) : undefined,
                    fabricId: item?.fabricId ? parseInt(item.fabricId) : undefined,
                    colorId: item?.colorId ? parseInt(item.colorId) : undefined,
                    uomId: item?.uomId ? parseInt(item.uomId) : undefined,
                    designId: item?.designId ? parseInt(item.designId) : undefined,
                    gaugeId: item?.gaugeId ? parseInt(item.gaugeId) : undefined,
                    loopLengthId: item?.loopLengthId ? parseInt(item.loopLengthId) : undefined,
                    gsmId: item?.gsmId ? parseInt(item.gsmId) : undefined,
                    sizeId: item?.sizeId ? parseInt(item.sizeId) : undefined,
                    kDiaId: item?.kDiaId ? parseInt(item.kDiaId) : undefined,
                    fDiaId: item?.fDiaId ? parseInt(item.fDiaId) : undefined,
                    noOfBags: item?.noOfBags ? parseInt(item.noOfBags) : undefined,
                    noOfRolls: item?.noOfRolls ? parseInt(item.noOfRolls) : undefined,
                    weightPerBag: item?.weightPerBag ? parseFloat(item.weightPerBag) : undefined,
                    qty: item?.qty ? parseFloat(item.qty) : undefined,
                    stockQty: item?.stockQty ? parseFloat(item.stockQty) : undefined,
                    stockBags: item?.stockBags ? parseInt(item.stockBags) : undefined,
                    stockRolls: item?.stockRolls ? parseInt(item.stockRolls) : undefined,
                    stockPrice: parseFloat(item.stockPrice),
                    lotNo: item?.lotNo ? item.lotNo : undefined,
                    processId: item?.processId ? parseInt(item.processId) : undefined,
                }
            }
        }
    })
}