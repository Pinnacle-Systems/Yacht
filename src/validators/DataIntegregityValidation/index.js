import negativeStockValidation from "./negativeStockValidation.js"
import negativeStockValidationStockForPcs from "./negativeStockValidationStockForPcs.js"

export default async function dataIntegrityValidation(tx, processValid = false) {
    await negativeStockValidation(tx)
    if (processValid) {
        await negativeStockValidationStockForPcs(tx)
    }

    return
}

