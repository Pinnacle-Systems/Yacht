import { getYearShortCode } from "./helper"

export const dropDownListObject = (data, showKey, valueKey) => {
    const outputData = []

    for (let i of data) {
        outputData.push({ show: i[showKey], value: i[valueKey] })
    }
    return outputData



}

export const dropDownFinYear = (data) => {
    const outputData = [];
    for (let i of data) {
        outputData.push({ show: getYearShortCode(i["from"], i["to"]), value: i["id"] })
    }
    return outputData
}

export const dropDownListMergedObject = (data) => {
    let Data = data ? data : []
    const outputData = []
    for (let i of Data) {
        outputData.push({ show: i.name + " / " + i.state.name, value: i["id"] })
    }
    return outputData
}

export const multiSelectOption = (data, label, value) => {
    console.log(data, label, value,'data, label, value')
    const outputData = []
    for (let i of data) {
        outputData?.push({ label: i[label], value: i[value] })
    }
    return outputData
}

export const multiSelectOptionSelectedApiData = (data) => {
    const outputData = []
    for (let i of data) {
        outputData.push({ id: i["value"] })
    }
    return outputData
}




