import React, { useEffect, useState } from 'react'
import { useGetFabricMasterQuery } from "../../../redux/uniformService/FabricMasterService";
import { useGetUomQuery } from "../../../redux/services/UomMasterService";
import { useGetdesignQuery } from "../../../redux/uniformService/DesignMasterServices";
import { useGetGaugeQuery } from "../../../redux/services/GaugeMasterServices";
import { useGetLoopLengthQuery } from "../../../redux/uniformService/LoopLengthMasterServices";
import { useGetgsmQuery } from "../../../redux/uniformService/GsmMasterServices";
import { useGetDiaQuery } from "../../../redux/uniformService/DiaMasterServices";
import secureLocalStorage from 'react-secure-storage';
import { Loader } from '../../../Basic/components';
import { useGetColorMasterQuery } from '../../../redux/uniformService/ColorMasterService';
import { findFromList, substract } from '../../../Utils/helper';
// import { useGetProcessQuery } from '../../../redux/ErpServices/processMasterServices';


const FabricStockFillGrid = ({ stockItems, addItem, removeItem, isItemChecked, getIssuedQty }) => {
    const [localItems, setLocalItems] = useState([]);
    const [searchFilter, setSearchFilter] = useState([])

    useEffect(() => {
        setLocalItems(stockItems);
    }, [stockItems, setLocalItems, searchFilter])

    function filterRecords(localItems) {
        let newLocalItems = [...localItems]
        newLocalItems = newLocalItems.filter(item => {
            for (let filter of searchFilter) {
                let fieldName = filter.fieldName
                let searchValue = filter.searchValue
                let objTransformFunc = filter.objTransformFunc
                let itemObj = objTransformFunc(item[fieldName])
                if (!(`${itemObj}`.toLowerCase().includes(searchValue.toLowerCase()))) return false
            }
            return true
        })
        return newLocalItems
    }

    useEffect(() => {
        setLocalItems(prev => filterRecords(prev))
    }, [setLocalItems, searchFilter, stockItems])

    const params = {
        companyId: secureLocalStorage.getItem(
            sessionStorage.getItem("sessionId") + "userCompanyId"
        )
    }
    const { data: fabricList, isLoading: fabricListLoading, isFetching: fabricListFetching } = useGetFabricMasterQuery({ params })
    const { data: uomList, isLoading: uomLoading, isFetching: uomFetching } = useGetUnitOfMeasurementMasterQuery({ params })
    const { data: colorList, isLoading: colorLoading, isFetching: colorFetching } = useGetColorMasterQuery({ params })
    const { data: designList, isLoading: designLoading, isFetching: designFetching } = useGetdesignQuery({ params })
    const { data: gaugeList, isLoading: gaugeLoading, isFetching: gaugeFetching } = useGetGaugeQuery({ params })
    const { data: loopList, isLoading: loopLoading, isFetching: loopFetching } = useGetLoopLengthQuery({ params })
    const { data: gsmList, isLoading: gsmLoading, isFetching: gsmFetching } = useGetgsmQuery({ params })
    const { data: diaList, isLoading: diaLoading, isFetching: diaFetching } = useGetDiaQuery({ params })
    // const { data: processList, isLoading: isProcessLoading, isFetching: isProcessFetching } = useGetProcessQuery({ params });

    if (fabricListLoading || fabricListFetching || uomFetching || uomLoading || colorFetching || colorLoading || designLoading || designFetching ||
        gaugeLoading || gaugeFetching || loopLoading || loopFetching || gsmLoading || gsmFetching || diaLoading || diaFetching
        || isProcessFetching || isProcessLoading) {
        return <tr>
            <td>
                <Loader />
            </td>
        </tr>
    }

    function handleCheckBoxChange(value, item) {
        if (value) {
            addItem(item)
        } else {
            removeItem(item)
        }
    }


    function handleSelectAllChange(value) {
        if (value) {
            localItems.forEach(item => addItem(item))
        } else {
            localItems.forEach(item => removeItem(item))
        }
    }

    function getSelectAll() {
        return localItems.every(item => isItemChecked(item))
    }

    function changeSearchFilter(field, value, objTransformFunc) {
        setSearchFilter(prev => {
            if (!value) {
                return prev.filter(item => item.fieldName !== field)
            }
            let newSearchFilter = [...prev]
            let index = newSearchFilter.findIndex(item => item.fieldName === field)
            if (index !== -1) {
                newSearchFilter[index]["searchValue"] = value
            } else {
                newSearchFilter.push({ fieldName: field, searchValue: value, objTransformFunc });
            }
            return newSearchFilter
        })
    }
    function getTotalStock() {
        const total = localItems.filter(item => isItemChecked(item)).reduce((accumulator, current) => {
            return accumulator + parseFloat(current["_sum"]["qty"] ? substract(current["_sum"]["qty"], getIssuedQty(current)) : 0)
        }, 0)
        return parseFloat(total).toFixed(3)
    }
    let count = 1;
    return (
        <div className='table-data bg-gray-200'>
            <table className='w-full text-xs'>
                <thead>
                    <tr className='bg-blue-200'>
                        <th className='w-8 p-5'>
                            Mark All
                            <input type="checkbox" className='w-full' onChange={(e) => handleSelectAllChange(e.target.checked)}
                                checked={getSelectAll()}
                            />
                        </th>
                        <th className=' w-8  table-data  '>
                            S.no
                        </th>
                        <th className='w-24 table-data  '>
                            Fabric
                        </th>
                        <th className='w-16 table-data  '>
                            Color
                        </th>
                        <th className='w-16  table-data '>
                            Design
                        </th>
                        <th className='w-12  table-data '>
                            Gauge
                        </th>
                        <th className='w-12 table-data  '>
                            LL
                        </th>
                        <th className='w-12  table-data '>
                            Gsm
                        </th>
                        <th className='w-12 table-data  '>
                            K-Dia
                        </th>
                        <th className='w-12  table-data '>
                            F-Dia
                        </th>
                        <th className='w-12 table-data  '>
                            Uom
                        </th>
                        {/* <th className='table-data  w-16'>
                            Prev. Process
                        </th> */}
                        <th className='table-data  w-16'>
                            Stock qty
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr className='sticky top-5 table-row'>
                        <td className='table-data  shadow-xl'>
                        </td>
                        <td className='table-data shadow-xl'>
                        </td>
                        <td className='   table-data  shadow-xl'>
                            <input className='w-full p-2' type="text" onFocus={(e) => e.target.select()}
                                onChange={(e) => {
                                    changeSearchFilter("fabricId", e.target.value, (item) => findFromList(item, fabricList.data, "aliasName"))
                                }} />
                        </td>
                        <td className=' table-data  shadow-xl'>
                            <input className='w-full p-2' type="text"
                                onFocus={(e) => e.target.select()}
                                onChange={(e) => {
                                    changeSearchFilter("colorId", e.target.value, (item) => findFromList(item, colorList.data, "name"))
                                }}
                            />
                        </td>
                        <td className='  table-data  shadow-xl'>
                            <input className='w-full p-2' type="text"
                                onFocus={(e) => e.target.select()}
                                onChange={(e) => {
                                    changeSearchFilter("designId", e.target.value, (item) => findFromList(item, designList.data, "name"))
                                }}
                            />
                        </td>
                        <td className='  table-data  shadow-xl'>
                            <input className='w-full p-2' type="text"
                                onFocus={(e) => e.target.select()}
                                onChange={(e) => {
                                    changeSearchFilter("gaugeId", e.target.value, (item) => findFromList(item, gaugeList.data, "name"))
                                }}
                            />
                        </td>
                        <td className='  table-data  shadow-xl'>
                            <input className='w-full p-2' type="text"
                                onFocus={(e) => e.target.select()}
                                onChange={(e) => {
                                    changeSearchFilter("loopLengthId", e.target.value, (item) => findFromList(item, loopList.data, "name"))
                                }}
                            />
                        </td>
                        <td className='  table-data  shadow-xl'>
                            <input className='w-full p-2' type="text"
                                onFocus={(e) => e.target.select()}
                                onChange={(e) => {
                                    changeSearchFilter("gsmId", e.target.value, (item) => findFromList(item, gsmList.data, "name"))
                                }}
                            />
                        </td>
                        <td className='  table-data  shadow-xl'>
                            <input className='w-full p-2' type="text"
                                onFocus={(e) => e.target.select()}
                                onChange={(e) => {
                                    changeSearchFilter("kDiaId", e.target.value, (item) => findFromList(item, diaList.data, "name"))
                                }}
                            />
                        </td>
                        <td className='  table-data  shadow-xl'>
                            <input className='w-full p-2' type="text"
                                onFocus={(e) => e.target.select()}
                                onChange={(e) => {
                                    changeSearchFilter("fDiaId", e.target.value, (item) => findFromList(item, diaList.data, "name"))
                                }}
                            />
                        </td>
                        <td className='  table-data  shadow-xl'>
                            <input className='w-full p-2' type="text"
                                onFocus={(e) => e.target.select()}
                                onChange={(e) => {
                                    changeSearchFilter("uomId", e.target.value, (item) => findFromList(item, uomList.data, "name"))
                                }}
                            />
                        </td>
                        <td className='  table-data  shadow-xl'>
                        </td>
                    </tr>
                    {localItems.map((item, index) =>
                        <tr key={index} className='py-2 table-row'>
                            <td className=' p-1  table-data  shadow-xl'>
                                <input type="checkbox" className='w-full table-data-input' onChange={(e) =>
                                    handleCheckBoxChange(!isItemChecked(item), item)}
                                    checked={isItemChecked(item)} />
                            </td>
                            <td className='  table-data   shadow-xl'>
                                {count++}
                            </td>
                            <td className='  table-data   shadow-xl'>
                                {findFromList(item.itemDetails.fabricId, fabricList.data, "aliasName")}
                            </td>
                            <td className='  table-data   shadow-xl'>
                                {findFromList(item.itemDetails.colorId, colorList.data, "name")}
                            </td>
                            <td className='   table-data  shadow-xl'>
                                {findFromList(item.itemDetails.designId, designList.data, "name")}
                            </td>
                            <td className='   table-data  shadow-xl'>
                                {findFromList(item.itemDetails.gaugeId, gaugeList.data, "name")}
                            </td>
                            <td className='  table-data   shadow-xl'>
                                {findFromList(item.itemDetails.loopLengthId, loopList.data, "name")}
                            </td>
                            <td className='  table-data   shadow-xl'>
                                {findFromList(item.itemDetails.gsmId, gsmList.data, "name")}
                            </td>
                            <td className='   table-data  shadow-xl'>
                                {findFromList(item.itemDetails.kDiaId, diaList.data, "name")}
                            </td>
                            <td className='  table-data   shadow-xl'>
                                {findFromList(item.itemDetails.fDiaId, diaList.data, "name")}
                            </td>
                            <td className='  table-data   shadow-xl'>
                                {findFromList(item.itemDetails.uomId, uomList.data, "name")}
                            </td>
                            {/* <td className=' px-1 table-data shadow-xl '>
                                {findFromList(item.processId, processList.data, "name")}
                            </td> */}
                            <td className=' table-data  text-right'>
                                {substract(item._sum.qty, getIssuedQty(item.itemDetails)).toFixed(3)}
                            </td>
                        </tr>
                    )
                    }
                    <tr className='bg-blue-200 w-full font-bold'>
                        <td className="table-data font-bold text-center" colSpan={12}>Total</td>
                        <td className="table-data w-10 text-right">{getTotalStock()}</td>
                    </tr>
                </tbody>
            </table>
        </div>

    )
}

export default FabricStockFillGrid