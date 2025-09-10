export const groupByMultipleKeys = (items, keys) =>
    items.reduce((acc, item) => {

        const isExistingItem = acc
            .flatMap(accItem => accItem)
            .find(accItem =>
                keys.every(key => accItem[key] === item[key])
            )

        if (isExistingItem) {
            return acc;
        }

        const allRelatedItems = items.filter(ungroupedItem =>
            keys.every(key => ungroupedItem[key] === item[key])
        )

        acc.push(allRelatedItems)

        return acc

    }, [])

var arr = [
    { shape: 'square', color: 'red', used: 1, instances: 1 },
    { shape: 'square', color: 'red', used: 2, instances: 1 },
    { shape: 'circle', color: 'blue', used: 0, instances: 0 },
    { shape: 'square', color: 'blue', used: 4, instances: 4 },
    { shape: 'circle', color: 'red', used: 1, instances: 1 },
    { shape: 'circle', color: 'red', used: 1, instances: 0 },
    { shape: 'square', color: 'blue', used: 4, instances: 5 },
    { shape: 'square', color: 'red', used: 2, instances: 1 }
];
const groupedItem = groupByMultipleKeys(arr, ['id', 'color'])

export function groupAndSumItems(arr, keys, sumItemProperty) {
    const groupedItems = groupByMultipleKeys(arr, keys);
    const groupedItemsSum = groupedItems.map(item => {
        let newObj = { ...item[0] };
        newObj[sumItemProperty] = item.reduce((a, c) => a + parseFloat(c[sumItemProperty]), 0);
        return newObj
    })
    return groupedItemsSum
}