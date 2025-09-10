import _ from "lodash";

export async function updateProcessDeliveryReturnProgramDetails(tx, program, processDeliveryReturnCreated) {
    let processInwardProgramDetails;
    if (!(program?.id)) {
        processInwardProgramDetails = await createProcessDeliveryReturnProgramDetails(tx, program, processDeliveryReturnCreated)
    } else {
        let deliveryProgramItem = await tx.ProcessDeliveryProgramDetails.findUnique({
            where: {
                id: parseInt(program.processDeliveryProgramDetailsId)
            },
            include: {
                ProcessDelivery: true,
            }
        })
        let programDetailsOld = await tx.processDeliveryReturnProgramDetails.findUnique({
            where: {
                id: parseInt(program.id)
            },
            include: {
                rawMaterials: true
            }
        })
        let removedItems = programDetailsOld.rawMaterials.filter(oldItem => {
            let result = program.rawMaterials.find(newItem => parseInt(newItem.id) === parseInt(oldItem.id))
            if (result) return false
            return true
        }).map(item => parseInt(item.id));
        await tx.processDeliveryReturnRawMaterialDetails.deleteMany({
            where: {
                id: {
                    in: removedItems
                }
            }
        })
        await (async function updateRawMaterials() {
            let promises = program.rawMaterials.map(async (rawMaterial) => {
                let processDeliveryRawMaterial = await tx.rawMaterials.findUnique({
                    where: {
                        id: parseInt(rawMaterial.rawMaterialsId)
                    }
                })

                if (rawMaterial?.id) {
                    return await tx.processDeliveryReturnRawMaterialDetails.update({
                        where: {
                            id: parseInt(rawMaterial.id)
                        },
                        data: {
                            returnQty: parseFloat(rawMaterial.returnQty),
                            returnBags: rawMaterial?.returnBags ? parseInt(rawMaterial.returnBags) : undefined,
                            returnRolls: rawMaterial?.returnRolls ? parseInt(rawMaterial.returnRolls) : undefined,
                            Stock: {
                                update: {
                                    itemType: deliveryProgramItem.ProcessDelivery.itemType,
                                    inOrOut: "ProcessDeliveryReturn",
                                    branchId: parseInt(processDeliveryReturnCreated.branchId),
                                    yarnId: processDeliveryRawMaterial?.yarnId ? parseInt(processDeliveryRawMaterial.yarnId) : undefined,
                                    fabricId: processDeliveryRawMaterial?.fabricId ? parseInt(processDeliveryRawMaterial.fabricId) : undefined,
                                    colorId: processDeliveryRawMaterial?.colorId ? parseInt(processDeliveryRawMaterial.colorId) : undefined,
                                    uomId: processDeliveryRawMaterial?.uomId ? parseInt(processDeliveryRawMaterial.uomId) : undefined,
                                    designId: processDeliveryRawMaterial?.designId ? parseInt(processDeliveryRawMaterial.designId) : undefined,
                                    gaugeId: processDeliveryRawMaterial?.gaugeId ? parseInt(processDeliveryRawMaterial.gaugeId) : undefined,
                                    loopLengthId: processDeliveryRawMaterial?.loopLengthId ? parseInt(processDeliveryRawMaterial.loopLengthId) : undefined,
                                    gsmId: processDeliveryRawMaterial?.gsmId ? parseInt(processDeliveryRawMaterial.gsmId) : undefined,
                                    sizeId: processDeliveryRawMaterial?.sizeId ? parseInt(processDeliveryRawMaterial.sizeId) : undefined,
                                    kDiaId: processDeliveryRawMaterial?.kDiaId ? parseInt(processDeliveryRawMaterial.kDiaId) : undefined,
                                    fDiaId: processDeliveryRawMaterial?.fDiaId ? parseInt(processDeliveryRawMaterial.fDiaId) : undefined,
                                    noOfBags: rawMaterial?.returnBags ? parseInt(rawMaterial.returnBags) : undefined,
                                    noOfRolls: rawMaterial?.returnRolls ? parseInt(rawMaterial.returnRolls) : undefined,
                                    qty: parseFloat(rawMaterial.returnQty),
                                    price: parseFloat(processDeliveryRawMaterial.stockPrice),
                                    storeId: parseInt(processDeliveryReturnCreated.storeId),
                                    lotNo: rawMaterial?.lotNo ? rawMaterial.lotNo : undefined,
                                    processId: processDeliveryReturnCreated?.processId ? parseInt(processDeliveryReturnCreated.processId) : undefined,
                                }
                            }
                        }
                    })
                }
                await tx.processDeliveryReturnRawMaterialDetails.create({
                    data: {
                        processDeliveryReturnProgramDetailsId: parseInt(programDetailsCreated.id),
                        rawMaterialsId: parseInt(rawMaterial.rawMaterialsId),
                        returnQty: parseFloat(rawMaterial.returnQty),
                        returnBags: rawMaterial?.returnBags ? parseInt(rawMaterial.returnBags) : undefined,
                        returnRolls: rawMaterial?.returnRolls ? parseInt(rawMaterial.returnRolls) : undefined,
                        stockPrice,
                        Stock: {
                            create: {
                                itemType: deliveryProgramItem.ProcessDelivery.itemType,
                                inOrOut: "ProcessDeliveryReturn",
                                branchId: parseInt(processDeliveryReturnCreated.branchId),
                                yarnId: processDeliveryRawMaterial?.yarnId ? parseInt(processDeliveryRawMaterial.yarnId) : undefined,
                                fabricId: processDeliveryRawMaterial?.fabricId ? parseInt(processDeliveryRawMaterial.fabricId) : undefined,
                                colorId: processDeliveryRawMaterial?.colorId ? parseInt(processDeliveryRawMaterial.colorId) : undefined,
                                uomId: processDeliveryRawMaterial?.uomId ? parseInt(processDeliveryRawMaterial.uomId) : undefined,
                                designId: processDeliveryRawMaterial?.designId ? parseInt(processDeliveryRawMaterial.designId) : undefined,
                                gaugeId: processDeliveryRawMaterial?.gaugeId ? parseInt(processDeliveryRawMaterial.gaugeId) : undefined,
                                loopLengthId: processDeliveryRawMaterial?.loopLengthId ? parseInt(processDeliveryRawMaterial.loopLengthId) : undefined,
                                gsmId: processDeliveryRawMaterial?.gsmId ? parseInt(processDeliveryRawMaterial.gsmId) : undefined,
                                sizeId: processDeliveryRawMaterial?.sizeId ? parseInt(processDeliveryRawMaterial.sizeId) : undefined,
                                kDiaId: processDeliveryRawMaterial?.kDiaId ? parseInt(processDeliveryRawMaterial.kDiaId) : undefined,
                                fDiaId: processDeliveryRawMaterial?.fDiaId ? parseInt(processDeliveryRawMaterial.fDiaId) : undefined,
                                noOfBags: rawMaterial?.returnBags ? parseInt(rawMaterial.returnBags) : undefined,
                                noOfRolls: rawMaterial?.returnRolls ? parseInt(rawMaterial.returnRolls) : undefined,
                                lotNo: processDeliveryRawMaterial?.lotNo ? processDeliveryRawMaterial.lotNo : undefined,
                                qty: parseFloat(rawMaterial.returnQty),
                                price: parseFloat(processDeliveryRawMaterial.stockPrice),
                                storeId: parseInt(processDeliveryReturnCreated.storeId),
                                processId: processDeliveryReturnCreated?.processId ? parseInt(processDeliveryReturnCreated.processId) : undefined,
                            }
                        }
                    }
                })
            })
            return Promise.all(promises)
        })()
    }
}




export async function createProcessDeliveryReturnProgramDetails(tx, program, processDeliveryReturnCreated) {
    let deliveryProgramItem = await tx.processDeliveryProgramDetails.findUnique({
        where: {
            id: parseInt(program.processDeliveryProgramDetailsId)
        },
        include: {
            ProcessDelivery: true,
            rawMaterials: true
        }
    })
    let programDetailsCreated = await tx.processDeliveryReturnProgramDetails.create({
        data: {
            processDeliveryReturnId: parseInt(processDeliveryReturnCreated.id),
            processDeliveryProgramDetailsId: parseInt(program.processDeliveryProgramDetailsId),
        }
    })
    await (async function createRawMaterials() {
        let promises = program.rawMaterials.map(async (rawMaterial) => {
            let processDeliveryRawMaterial = await tx.rawMaterials.findUnique({
                where: {
                    id: parseInt(rawMaterial.rawMaterialsId)
                }
            })
            return await tx.processDeliveryReturnRawMaterialDetails.create({
                data: {
                    processDeliveryReturnProgramDetailsId: parseInt(programDetailsCreated.id),
                    rawMaterialsId: parseInt(rawMaterial.rawMaterialsId),
                    returnQty: parseFloat(rawMaterial.returnQty),
                    returnBags: rawMaterial?.returnBags ? parseInt(rawMaterial.returnBags) : undefined,
                    returnRolls: rawMaterial?.returnRolls ? parseInt(rawMaterial.returnRolls) : undefined,
                    stockPrice: processDeliveryRawMaterial.stockPrice,
                    Stock: {
                        create: {
                            itemType: deliveryProgramItem.ProcessDelivery.itemType,
                            inOrOut: "ProcessDeliveryReturn",
                            branchId: parseInt(processDeliveryReturnCreated.branchId),
                            yarnId: processDeliveryRawMaterial?.yarnId ? parseInt(processDeliveryRawMaterial.yarnId) : undefined,
                            fabricId: processDeliveryRawMaterial?.fabricId ? parseInt(processDeliveryRawMaterial.fabricId) : undefined,
                            colorId: processDeliveryRawMaterial?.colorId ? parseInt(processDeliveryRawMaterial.colorId) : undefined,
                            uomId: processDeliveryRawMaterial?.uomId ? parseInt(processDeliveryRawMaterial.uomId) : undefined,
                            designId: processDeliveryRawMaterial?.designId ? parseInt(processDeliveryRawMaterial.designId) : undefined,
                            gaugeId: processDeliveryRawMaterial?.gaugeId ? parseInt(processDeliveryRawMaterial.gaugeId) : undefined,
                            loopLengthId: processDeliveryRawMaterial?.loopLengthId ? parseInt(processDeliveryRawMaterial.loopLengthId) : undefined,
                            gsmId: processDeliveryRawMaterial?.gsmId ? parseInt(processDeliveryRawMaterial.gsmId) : undefined,
                            sizeId: processDeliveryRawMaterial?.sizeId ? parseInt(processDeliveryRawMaterial.sizeId) : undefined,
                            kDiaId: processDeliveryRawMaterial?.kDiaId ? parseInt(processDeliveryRawMaterial.kDiaId) : undefined,
                            fDiaId: processDeliveryRawMaterial?.fDiaId ? parseInt(processDeliveryRawMaterial.fDiaId) : undefined,
                            noOfBags: rawMaterial?.returnBags ? parseInt(rawMaterial.returnBags) : undefined,
                            noOfRolls: rawMaterial?.returnRolls ? parseInt(rawMaterial.returnRolls) : undefined,
                            lotNo: processDeliveryRawMaterial?.lotNo ? processDeliveryRawMaterial.lotNo : undefined,
                            qty: parseFloat(rawMaterial.returnQty),
                            price: parseFloat(processDeliveryRawMaterial.stockPrice),
                            storeId: parseInt(processDeliveryReturnCreated.storeId),
                            processId: processDeliveryReturnCreated?.processId ? parseInt(processDeliveryReturnCreated.processId) : undefined,
                        }
                    }
                }
            })
        })
        return Promise.all(promises)
    })()
}

