import React from 'react';
import FabricPoItem from './FabricPoItem';
import { toast } from 'react-toastify';
import { useGetFabricMasterQuery } from '../../../redux/uniformService/FabricMasterService';
import { useGetColorMasterQuery } from '../../../redux/uniformService/ColorMasterService';
import { useGetUomQuery } from '../../../redux/services/UomMasterService';
import { useGetGaugeQuery } from '../../../redux/services/GaugeMasterServices';
import { useGetdesignQuery } from '../../../redux/uniformService/DesignMasterServices';
import { useGetgsmQuery } from '../../../redux/uniformService/GsmMasterServices';
import { useGetLoopLengthQuery } from '../../../redux/uniformService/LoopLengthMasterServices';
import { useGetDiaQuery } from '../../../redux/uniformService/DiaMasterServices';



const FabricCancelItems = ({ inwardItems, setInwardItems, readOnly, removeItem, purchaseInwardId, params }) => {



    const { data: fabricList } =
        useGetFabricMasterQuery({ params });

    const { data: colorList } =
        useGetColorMasterQuery({ params: { ...params } });


    const { data: uomList } =
        useGetUomQuery({ params });

    const { data: gaugeList } =
        useGetGaugeQuery({ params });

    const { data: designList } =
        useGetdesignQuery({ params });

    const { data: gsmList } =
        useGetgsmQuery({ params });

    const { data: loopLengthList } =
        useGetLoopLengthQuery({ params });

    const { data: diaList } =
        useGetDiaQuery({ params });





    const handleInputChange = (value, index, field, balanceQty, poItem = undefined) => {
        const newBlend = structuredClone(inwardItems);
        if (poItem) {
            newBlend[index]["poNo"] = poItem?.Po?.docId

            newBlend[index]["colorId"] = poItem?.colorId
            newBlend[index]["gaugeId"] = poItem?.gaugeId
            newBlend[index]["gsmId"] = poItem?.gsmId
            newBlend[index]["fDiaId"] = poItem?.fDiaId
            newBlend[index]["designId"] = poItem?.designId

            newBlend[index]["kDiaId"] = poItem?.kDiaId
            newBlend[index]["loopLengthId"] = poItem?.loopLengthId
            newBlend[index]["poId"] = poItem?.poId
            newBlend[index]["price"] = poItem?.price

            newBlend[index]["uomId"] = poItem?.uomId
            newBlend[index]["poQty"] = poItem?.qty

            newBlend[index]["alreadyCancelQty"] = poItem?.alreadyCancelData?._sum?.qty ? parseFloat(poItem.alreadyCancelData?._sum?.qty).toFixed(3) : "0.000";
            newBlend[index]["alreadyCancelRolls"] = poItem?.alreadyCancelData?._sum?.noOfRolls ? parseInt(poItem.alreadyCancelData?._sum?.noOfRolls) : "0.000";
            newBlend[index]["alreadyInwardedQty"] = poItem?.alreadyInwardedData?._sum?.qty ? parseFloat(poItem.alreadyInwardedData._sum.qty).toFixed(3) : "0.000";
            newBlend[index]["alreadyInwardedRolls"] = poItem?.alreadyInwardedData?._sum?.noOfRolls ? parseInt(poItem.alreadyInwardedData._sum.noOfRolls) : "0.000";
            newBlend[index]["alreadyReturnedQty"] = poItem?.alreadyReturnedData?._sum?.qty ? parseFloat(poItem.alreadyReturnedData._sum.qty).toFixed(3) : "0.000";
            newBlend[index]["alreadyReturnedRolls"] = poItem?.alreadyReturnedData?._sum?.noOfRolls ? parseInt(poItem.alreadyReturnedData._sum.noOfRolls) : "0.000";
            newBlend[index]["balanceQty"] = poItem?.balanceQty ? parseFloat(poItem.balanceQty).toFixed(3) : "0.000";
        }


        if (field === "qty") {
            if (parseFloat(balanceQty) < parseFloat(value)) {
                toast.info("Cancel Qty Can not be more than balance Qty", { position: 'top-center' })
                return
            }
        }
        newBlend[index][field] = value
        setInwardItems(newBlend);
    };




    // const handleInputChange = (value, index, field, balanceQty) => {
    //     setInwardItems(inwardItems => {
    //         const newBlend = structuredClone(inwardItems);
    //         newBlend[index][field] = value
    //         if (field === "qty") {
    //             if (parseFloat(balanceQty) < parseFloat(value)) {
    //                 toast.info("Cancel Qty Can not be more than balance Qty", { position: 'top-center' })
    //                 return inwardItems
    //             }
    //         }
    //         return newBlend
    //     });
    // };

    return (
        <>
            <div className={`relative w-full overflow-y-auto `}>
                <table className=" text-xs border border-gray-500  w-full">
                    <thead className='bg-gray-300 border border-gray-500 top-0'>
                        <tr className=''>
                            <th className='text-center w-8 table-data '>
                                S.no
                            </th>
                            <th className='text-center table-data'>
                                Po.no
                            </th>
                            <th className='table-data'>
                                Fabric Name
                            </th>
                            <th className='w-16 table-data'>
                                Color
                            </th>
                            <th className='w-16 table-data'>
                                Design
                            </th>
                            <th className=' table-data'>
                                Gauge
                            </th>
                            <th className=' table-data'>
                                LL
                            </th>
                            <th className=' table-data'>
                                Gsm
                            </th>
                            <th className=' table-data'>
                                K-Dia
                            </th>
                            <th className=' table-data'>
                                F-Dia
                            </th>
                            <th className=' table-data'>
                                Uom
                            </th>
                            <th className=' table-data'>
                                Po qty
                            </th>
                            <th className='table-data'>
                                A.Can. qty
                            </th>
                            {/* <th className='table-data'>
                                A.Can. Rolls
                            </th> */}
                            <th className='table-data'>
                                A.In. qty
                            </th>
                            <th className='table-data'>
                                A.In. Rolls
                            </th>
                            <th className='table-data'>
                                A.Rtn. qty
                            </th>
                            <th className='table-data'>
                                A.Rtn Rolls
                            </th>

                            <th className='table-data'>
                                Bal.Qty
                            </th>

                            {/* <th className="table-data  w-16">Bal. Rolls<span className="text-red-500">*</span></th> */}
                            <th className='table-data w-16'><span className="text-red-500">*</span>
                                Can. Qty
                            </th>

                            <th className=' table-data'>
                                Price
                            </th>

                            {!readOnly &&
                                <th className=' table-data'>Del</th>
                            }
                        </tr>
                    </thead>
                    <tbody className='overflow-y-auto  h-full w-full'>{console.log(inwardItems, "inwardItems")}
                        {inwardItems.map((item, index) => <FabricPoItem fabricList={fabricList} uomList={uomList}
                            colorList={colorList} gaugeList={gaugeList} designList={designList} gsmList={gsmList}
                            loopLengthList={loopLengthList} poItemId={item.poItemsId}
                            diaList={diaList} item={item} index={index} handleInputChange={handleInputChange} purchaseInwardId={purchaseInwardId} readOnly={readOnly} />)}
                        {Array.from({ length: 8 - inwardItems.length }).map(i =>
                            <tr className='w-full font-bold h-8 border border-gray-400 table-row'>
                                {Array.from({ length: 20 }).map(i =>
                                    <td className="table-data   "></td>
                                )}
                                {!readOnly &&
                                    <td className="table-data w-10"></td>
                                }
                            </tr>)
                        }
                    </tbody>
                </table>
            </div>
        </>
    )
}

export default FabricCancelItems