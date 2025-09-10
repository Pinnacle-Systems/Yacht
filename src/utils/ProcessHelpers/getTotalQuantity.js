export async function getTotalQty(data) {
    const promises = data.map(async (item) => {
        let { ProcessDeliveryProgramDetails, ...newItem } = item
        newItem["programQty"] = item.ProcessDeliveryProgramDetails.reduce((a, c) => a + parseFloat(c.qty), 0);
        return newItem
    })
    return Promise.all(promises)
}

