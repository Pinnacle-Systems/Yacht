import React from 'react'
import { useGetFabricMasterQuery } from "../../../redux/uniformService/FabricMasterService";
import { useGetUomQuery } from "../../../redux/services/UomMasterService";
import { useGetdesignQuery } from "../../../redux/uniformService/DesignMasterServices";
import { useGetGaugeQuery } from "../../../redux/services/GaugeMasterServices";
import { useGetLoopLengthQuery } from "../../../redux/uniformService/LoopLengthMasterServices";
import { useGetgsmQuery } from "../../../redux/uniformService/GsmMasterServices";
import { useGetDiaQuery } from "../../../redux/uniformService/DiaMasterServices";
import { Loader } from '../../../Basic/components';
import { useGetColorMasterQuery } from '../../../redux/uniformService/ColorMasterService';
import { findFromList, isBetweenRange } from '../../../Utils/helper';
// import { useGetProcessQuery } from '../../../redux/ErpServices/processMasterServices';

import { DELETE } from "../../../icons";
import { toast } from 'react-toastify';
import secureLocalStorage from 'react-secure-storage';
import { useGetStockQuery } from '../../../redux/services/StockService';

const CuttingDeliveryItem = ({ item, index, id, handleInputChange, removeItem, readOnly, storeId }) => {
    const params = {
        companyId: secureLocalStorage.getItem(
            sessionStorage.getItem("sessionId") + "userCompanyId"
        ),
    };
    const branchId = secureLocalStorage.getItem(
        sessionStorage.getItem("sessionId") + "currentBranchId"
    )
    const { data: fabricList, isLoading: fabricListLoading, isFetching: fabricListFetching } = useGetFabricMasterQuery({ params })
    const { data: uomList, isLoading: uomLoading, isFetching: uomFetching } = useGetUomQuery({ params })
    const { data: colorList, isLoading: colorLoading, isFetching: colorFetching } = useGetColorMasterQuery({ params })
    const { data: designList, isLoading: designLoading, isFetching: designFetching } = useGetdesignQuery({ params })
    const { data: gaugeList, isLoading: gaugeLoading, isFetching: gaugeFetching } = useGetGaugeQuery({ params })
    const { data: loopList, isLoading: loopLoading, isFetching: loopFetching } = useGetLoopLengthQuery({ params })
    const { data: gsmList, isLoading: gsmLoading, isFetching: gsmFetching } = useGetgsmQuery({ params })
    const { data: diaList, isLoading: diaLoading, isFetching: diaFetching } = useGetDiaQuery({ params })
    // const { data: processList, isLoading: isProcessLoading, isFetching: isProcessFetching } = useGetProcessQuery({ params });


    const { data: stockResponse, isLoading, isFetching
    } = useGetStockQuery({
        params: {
            itemType: "DyedFabric",
            storeId,
            fabricId: item?.fabricId,
            uomId: item?.uomId,
            colorId: item?.colorId,
            designId: item?.desingId,
            loopLengthId: item?.loopLengthId,
            gsmId: item?.gsmId,
            diaId: item?.diaId,
            processId: item?.processId,
            lotNo: item?.lotNo,
            stockId: item?.Stock?.id
        }
    });
    let stockData = stockResponse?.data ? stockResponse.data : false

    // const stockQty = id ? (stockData && stockData.length === 1 ? stockData[0]?._sum?.qty : 0) : item._sum.qty;
    // const stockRolls = id ? (stockData && stockData.length === 1 ? stockData[0]?._sum?.noOfRolls : 0) : item._sum.noOfRolls;
    if (fabricListLoading || fabricListFetching || uomFetching || uomLoading || colorFetching || colorLoading || designLoading || designFetching ||
        gaugeLoading || gaugeFetching || loopLoading || loopFetching || gsmLoading || gsmFetching || diaLoading || diaFetching
    ) {
        return <tr>
            <td>
                <Loader />
            </td>
        </tr>
    }
    return (
        <tr key={index} className='py-2 table-row'>
            <td className='  table-data   shadow-xl'>
                {index + 1}
            </td>

            <td className='  table-data   shadow-xl'>
                {findFromList(item.fabricId, fabricList.data, "name")}
            </td>
            <td className='  table-data   shadow-xl'>
                {findFromList(item.colorId, colorList.data, "name")}
            </td>
            <td className='   table-data  shadow-xl'>
                {findFromList(item.designId, designList.data, "name")}
            </td>
            <td className='  table-data   shadow-xl'>
                {findFromList(item.gsmId, gsmList.data, "name")}
            </td>
            <td className='   table-data  shadow-xl'>
                {findFromList(item.gaugeId, gaugeList.data, "name")}
            </td>
            <td className='  table-data   shadow-xl'>
                {findFromList(item.loopLengthId, loopList.data, "name")}
            </td>

            <td className='   table-data  shadow-xl'>
                {findFromList(item.kDiaId, diaList.data, "name")}
            </td>
            <td className='  table-data   shadow-xl'>
                {findFromList(item.fDiaId, diaList.data, "name")}
            </td>
            <td className='  table-data   shadow-xl'>
                {findFromList(item.uomId, uomList.data, "name")}
            </td>
            <td className='  table-data   shadow-xl'>
                {item.lotNo}
            </td>
            <td className=' table-data  text-right'>
                {item?.stockRolls}
            </td>
            <td className=' table-data  text-right'>
                {item?.stockQty}
            </td>
            <td className='table-data'>
                <input
                    type="number"
                    onKeyDown={e => { if (e.key === "Delete") { handleInputChange("0.000", index, "delRolls") } }}
                    onFocus={(e) => e.target.select()}
                    className="text-right rounded py-1 px-1 w-full table-data-input"
                    value={(!item.delRolls) ? 0 : item.delRolls}
                    readOnly={readOnly}
                    onChange={(e) => {
                        if (isBetweenRange(0, item?.stockRolls, e.target.value)) {
                            handleInputChange(e.target.value, index, "delRolls")
                        } else {
                            toast.info("Issue Rolls Cannot be more than Stock Rolls", { position: 'top-center' })
                        }
                    }
                    }
                    onBlur={(e) =>
                        handleInputChange(parseInt(e.target.value), index, "delRolls")
                    }
                />
            </td>
            <td className='table-data'>
                <input
                    type="number"
                    onKeyDown={e => { if (e.key === "Delete") { handleInputChange("0.000", index, "delQty") } }}
                    onFocus={(e) => e.target.select()}
                    className="text-right rounded py-1 px-1 w-full table-data-input"
                    value={(!item.delQty) ? 0 : item.delQty}
                    readOnly={readOnly}
                    onChange={(e) => {
                        if (isBetweenRange(0, item?.stockQty, e.target.value)) {
                            handleInputChange(e.target.value, index, "delQty")
                        } else {
                            toast.info("Issue Qty Cannot be more than Stock Qty", { position: 'top-center' })
                        }
                    }
                    }
                    onBlur={(e) =>
                        handleInputChange(parseFloat(e.target.value).toFixed(3), index, "delQty")
                    }
                />
            </td>
            {!readOnly &&
                <td className='table-data w-12'>
                    <div tabIndex={-1} onClick={() => removeItem(item)} className='flex justify-center px-2 py-1.5 items-center cursor-pointer bg-gray-300'>
                        {DELETE}
                    </div>
                </td>
            }
        </tr>
    )
}

export default CuttingDeliveryItem