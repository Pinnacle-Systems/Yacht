export async function getTotalQty(data) {
    const promises = data.map(async (item) => {
        let { PoItems, ...newItem } = item
        newItem["poQty"] = item?.PoItems?.reduce((a, c) => a + parseFloat(c.qty), 0);
        // newItem["inwardQty"] = 
        return newItem
    })
    return Promise.all(promises)
}

