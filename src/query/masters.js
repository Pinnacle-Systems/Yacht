
export async function getAllClass(tx) {
    return await tx.class.findMany({})
}

export async function getAllSize(tx) {
    return await tx.size.findMany({})
}

export async function getAllColor(tx) {
    return await tx.color.findMany({})
}


export async function createAllClass(tx, arr) {
    await tx.class.createMany({
        data: arr.map(i => ({ name: i, classNameOnly: (i.split('-')[0]).toString() }))
    })
    return await getAllClass(tx)
}

export async function createAllSize(tx, arr) {
    await tx.size.createMany({
        data: arr.map(i => ({ name: i }))
    })
    return await getAllSize(tx)
}

export async function createAllColor(tx, arr) {
    await tx.color.createMany({
        data: arr.map(i => ({ name: i }))
    })
    return await getAllColor(tx)
}
