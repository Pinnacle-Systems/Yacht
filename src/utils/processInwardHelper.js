import { getItemFullNameFromShortCode } from "./helper.js";

export async function updateInwardProgramDetails(tx, program, processInward, processInwardDataOld) {
    let processInwardProgramDetails;
    if (!(program?.id)) {
        processInwardProgramDetails = await createInwardProgramDetails(tx, program, processInward)
    } else {
        let deliveryProgramItem = await tx.ProcessDeliveryProgramDetails.findUnique({
            where: {
                id: parseInt(program.processDeliveryProgramDetailsId)
            },
            include: {
                ProcessDelivery: {
                    include: {
                        Process: {
                            select: {
                                io: true
                            }
                        }
                    }
                },
            }
        })
        let currentProgramIndex = processInwardDataOld.ProcessInwardDetails.findIndex(item => parseInt(item.id) === parseInt(program.id))
        let removedItems = processInwardDataOld.ProcessInwardDetails[currentProgramIndex].lotDetails.filter(oldItem => {
            let result = program.lotDetails.find(newItem => newItem.id === oldItem.id)
            if (result) return false
            return true
        }).map(item => parseInt(item.id));
        await tx.programInwardLotDetail.deleteMany({
            where: {
                id: {
                    in: removedItems
                }
            }
        })
        let programDetailsUpdated = await tx.processInwardProgramDetails.update({
            where: {
                id: parseInt(program.id)
            },
            data: {
                processInwardId: parseInt(processInward.id),
                rawMaterials: {
                    deleteMany: {},
                    createMany: {
                        data: program.rawMaterials.map(item => ({
                            rawMaterialsId: parseInt(item.rawMaterialsId),
                            consumptionQty: parseFloat(item.consumptionQty),
                            lossQty: parseFloat(item.lossQty),
                            stockPrice: parseFloat(item.stockPrice)
                        }))
                    }
                }
            }
        })
        await (async function updateLotDetails() {
            let promises = program.lotDetails.map(async (lotItem) => {
                if (lotItem?.id) {
                    return await tx.programInwardLotDetail.update({
                        where: {
                            id: parseInt(lotItem.id)
                        },
                        data: {
                            lotNo: lotItem.lotNo,
                            inwardQty: parseFloat(lotItem.inwardQty),
                            inwardBags: lotItem?.inwardBags ? parseInt(lotItem.inwardBags) : undefined,
                            inwardRolls: lotItem?.inwardRolls ? parseInt(lotItem.inwardRolls) : undefined,
                            Stock: {
                                update: {
                                    itemType: itemName,
                                    inOrOut: "ProcessInward",
                                    branchId: parseInt(processInward.branchId),
                                    yarnId: deliveryProgramItem?.yarnId ? parseInt(deliveryProgramItem.yarnId) : undefined,
                                    fabricId: deliveryProgramItem?.fabricId ? parseInt(deliveryProgramItem.fabricId) : undefined,
                                    colorId: deliveryProgramItem?.colorId ? parseInt(deliveryProgramItem.colorId) : undefined,
                                    uomId: deliveryProgramItem?.uomId ? parseInt(deliveryProgramItem.uomId) : undefined,
                                    designId: deliveryProgramItem?.designId ? parseInt(deliveryProgramItem.designId) : undefined,
                                    gaugeId: deliveryProgramItem?.gaugeId ? parseInt(deliveryProgramItem.gaugeId) : undefined,
                                    loopLengthId: deliveryProgramItem?.loopLengthId ? parseInt(deliveryProgramItem.loopLengthId) : undefined,
                                    gsmId: deliveryProgramItem?.gsmId ? parseInt(deliveryProgramItem.gsmId) : undefined,
                                    sizeId: deliveryProgramItem?.sizeId ? parseInt(deliveryProgramItem.sizeId) : undefined,
                                    kDiaId: deliveryProgramItem?.kDiaId ? parseInt(deliveryProgramItem.kDiaId) : undefined,
                                    fDiaId: deliveryProgramItem?.fDiaId ? parseInt(deliveryProgramItem.fDiaId) : undefined,
                                    noOfBags: lotItem?.inwardBags ? parseInt(lotItem.inwardBags) : undefined,
                                    noOfRolls: lotItem?.inwardRolls ? parseInt(lotItem.inwardRolls) : undefined,
                                    qty: parseFloat(lotItem.inwardQty),
                                    price: parseFloat(deliveryProgramItem.processCost) +
                                        program.rawMaterials.reduce((total, current) => {
                                            return total + parseFloat(current.stockPrice)
                                        }, 0),
                                    storeId: parseInt(processInward.storeId),
                                    lotNo: lotItem?.lotNo ? lotItem.lotNo : undefined,
                                    processId: deliveryProgramItem?.processId ? parseInt(deliveryProgramItem.processId) : undefined,
                                }
                            }
                        }
                    })
                }
                return await tx.programInwardLotDetail.create({
                    data: {
                        lotNo: lotItem.lotNo,
                        inwardQty: parseFloat(lotItem.inwardQty),
                        inwardBags: lotItem?.inwardBags ? parseInt(lotItem.inwardBags) : undefined,
                        inwardRolls: lotItem?.inwardRolls ? parseInt(lotItem.inwardRolls) : undefined,
                        processInwardProgramDetailsId: parseInt(programDetailsUpdated.id),
                        Stock: {
                            create: {
                                itemType: itemName,
                                inOrOut: "ProcessInward",
                                branchId: parseInt(processInward.branchId),
                                yarnId: deliveryProgramItem?.yarnId ? parseInt(deliveryProgramItem.yarnId) : undefined,
                                fabricId: deliveryProgramItem?.fabricId ? parseInt(deliveryProgramItem.fabricId) : undefined,
                                colorId: deliveryProgramItem?.colorId ? parseInt(deliveryProgramItem.colorId) : undefined,
                                uomId: deliveryProgramItem?.uomId ? parseInt(deliveryProgramItem.uomId) : undefined,
                                designId: deliveryProgramItem?.designId ? parseInt(deliveryProgramItem.designId) : undefined,
                                gaugeId: deliveryProgramItem?.gaugeId ? parseInt(deliveryProgramItem.gaugeId) : undefined,
                                loopLengthId: deliveryProgramItem?.loopLengthId ? parseInt(deliveryProgramItem.loopLengthId) : undefined,
                                gsmId: deliveryProgramItem?.gsmId ? parseInt(deliveryProgramItem.gsmId) : undefined,
                                sizeId: deliveryProgramItem?.sizeId ? parseInt(deliveryProgramItem.sizeId) : undefined,
                                kDiaId: deliveryProgramItem?.kDiaId ? parseInt(deliveryProgramItem.kDiaId) : undefined,
                                fDiaId: deliveryProgramItem?.fDiaId ? parseInt(deliveryProgramItem.fDiaId) : undefined,
                                noOfBags: lotItem?.inwardBags ? parseInt(lotItem.inwardBags) : undefined,
                                noOfRolls: lotItem?.inwardRolls ? parseInt(lotItem.inwardRolls) : undefined,
                                qty: parseFloat(lotItem.inwardQty),
                                price: parseFloat(deliveryProgramItem.processCost) +
                                    program.rawMaterials.reduce((total, current) => {
                                        return total + parseFloat(current.stockPrice)
                                    }, 0),
                                storeId: parseInt(processInward.storeId),
                                lotNo: lotItem?.lotNo ? lotItem.lotNo : undefined,
                                processId: deliveryProgramItem?.processId ? parseInt(deliveryProgramItem.processId) : undefined,
                            }
                        }
                    }
                })
            })
            return Promise.all(promises)
        })()
    }
}




export async function createInwardProgramDetails(tx, program, processInward) {
    let deliveryProgramItem = await tx.ProcessDeliveryProgramDetails.findUnique({
        where: {
            id: parseInt(program.processDeliveryProgramDetailsId)
        },
        include: {
            ProcessDelivery: {
                include: {
                    Process: {
                        select: {
                            io: true
                        }
                    }
                }
            },
        }
    })
    const itemName = getItemFullNameFromShortCode(deliveryProgramItem.ProcessDelivery.Process.io.split("_")[1])
    let programDetailsCreated = await tx.processInwardProgramDetails.create({
        data: {
            processInwardId: parseInt(processInward.id),
            processDeliveryProgramDetailsId: parseInt(program.processDeliveryProgramDetailsId),
            rawMaterials: {
                createMany: {
                    data: program.rawMaterials.map(item => ({
                        rawMaterialsId: parseInt(item.rawMaterialsId),
                        consumptionQty: parseFloat(item.consumptionQty),
                        lossQty: parseFloat(item.lossQty),
                        stockPrice: parseFloat(item.stockPrice)
                    }))
                }
            }
        }
    })
    await (async function createLotDetails() {
        let promises = program.lotDetails.map(async (lotItem) => {
            return await tx.programInwardLotDetail.create({
                data: {
                    lotNo: lotItem.lotNo,
                    inwardQty: parseFloat(lotItem.inwardQty),
                    inwardBags: lotItem?.inwardBags ? parseInt(lotItem.inwardBags) : undefined,
                    inwardRolls: lotItem?.inwardRolls ? parseInt(lotItem.inwardRolls) : undefined,
                    processInwardProgramDetailsId: parseInt(programDetailsCreated.id),
                    Stock: {
                        create: {
                            itemType: itemName,
                            inOrOut: "ProcessInward",
                            branchId: parseInt(processInward.branchId),
                            yarnId: deliveryProgramItem?.yarnId ? parseInt(deliveryProgramItem.yarnId) : undefined,
                            fabricId: deliveryProgramItem?.fabricId ? parseInt(deliveryProgramItem.fabricId) : undefined,
                            colorId: deliveryProgramItem?.colorId ? parseInt(deliveryProgramItem.colorId) : undefined,
                            uomId: deliveryProgramItem?.uomId ? parseInt(deliveryProgramItem.uomId) : undefined,
                            designId: deliveryProgramItem?.designId ? parseInt(deliveryProgramItem.designId) : undefined,
                            gaugeId: deliveryProgramItem?.gaugeId ? parseInt(deliveryProgramItem.gaugeId) : undefined,
                            loopLengthId: deliveryProgramItem?.loopLengthId ? parseInt(deliveryProgramItem.loopLengthId) : undefined,
                            gsmId: deliveryProgramItem?.gsmId ? parseInt(deliveryProgramItem.gsmId) : undefined,
                            sizeId: deliveryProgramItem?.sizeId ? parseInt(deliveryProgramItem.sizeId) : undefined,
                            kDiaId: deliveryProgramItem?.kDiaId ? parseInt(deliveryProgramItem.kDiaId) : undefined,
                            fDiaId: deliveryProgramItem?.fDiaId ? parseInt(deliveryProgramItem.fDiaId) : undefined,
                            noOfBags: lotItem?.inwardBags ? parseInt(lotItem.inwardBags) : undefined,
                            noOfRolls: lotItem?.inwardRolls ? parseInt(lotItem.inwardRolls) : undefined,
                            qty: parseFloat(lotItem.inwardQty),
                            price: parseFloat(deliveryProgramItem.processCost) +
                                program.rawMaterials.reduce((total, current) => {
                                    return total + parseFloat(current.stockPrice)
                                }, 0),
                            storeId: parseInt(processInward.storeId),
                            lotNo: lotItem?.lotNo ? lotItem.lotNo : undefined,
                            processId: deliveryProgramItem?.processId ? parseInt(deliveryProgramItem.processId) : undefined,
                        }
                    }
                }
            })
        })
        return Promise.all(promises)
    })()
}

