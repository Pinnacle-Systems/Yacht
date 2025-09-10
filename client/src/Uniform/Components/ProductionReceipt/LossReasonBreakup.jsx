import React, { useEffect } from 'react'
import { useGetLossReasonQuery } from '../../../redux/uniformService/LossReasonMasterServices';
import { Loader } from '../../../Basic/components';
import { params } from '../../../Utils/helper';
import { Delete } from '../../../Buttons';
import { PLUS } from '../../../icons';
import { toast } from 'react-toastify';

const LossReasonBreakup = ({ currentIndex, setCurrentSelectedIndex, productionReceiptDetails, setProductionReceiptDetails,
    readOnly, id, productionDeliveryDetailsFillData }) => {
    const handleInputChange = (value, index, field) => {
        const newBlend = structuredClone(productionReceiptDetails);
        newBlend[currentIndex]["lossDetails"][index][field] = value;
        setProductionReceiptDetails(newBlend);
    };
    function removeLotNo(index) {
        setProductionReceiptDetails(prev => {
            let newItem = structuredClone(prev);
            newItem[currentIndex]["lossDetails"] = newItem[currentIndex]["lossDetails"].filter((_, i) => i !== index)
            return newItem
        })
    }
    function addReason() {
        setProductionReceiptDetails(prev => {
            let newItem = structuredClone(prev);
            newItem[currentIndex]["lossDetails"] = [...newItem[currentIndex]["lossDetails"], { lossReasonId: "", lossQty: "" }]
            return newItem
        })
    }
    useEffect(() => {
        setProductionReceiptDetails(prev => {
            let newItem = structuredClone(prev);
            if (newItem[currentIndex]["lossDetails"] && newItem[currentIndex]["lossDetail"]?.length !== 0) return prev
            newItem[currentIndex]["lossDetails"] = [{ lossReasonId: "", lossQty: 0 }]
            return newItem
        })
    }, [])

    const currentConsumption = productionReceiptDetails[currentIndex]
    let productionDeliveryItem = productionDeliveryDetailsFillData.find(i => parseInt(i.id) === parseInt(currentConsumption.productionDeliveryDetailsId))

    const delQty = productionDeliveryItem?.delQty ? productionDeliveryItem?.delQty : 0
    const alreadyConsumedQty = productionDeliveryItem?.alreadyUsedQty ? productionDeliveryItem?.alreadyUsedQty : 0
    const alreadyReturnExcessQty = productionDeliveryItem?.alreadyReturnExcessQty ? productionDeliveryItem?.alreadyReturnExcessQty : 0

    const balanceQty = delQty - alreadyConsumedQty - alreadyReturnExcessQty;

    const { data: lossReason, isFetching: isReasonFetching,
        isLoading: isReasonLoading, } = useGetLossReasonQuery({ params });
    if (!lossReason) return <Loader />
    return (
        <div className={`${(Number.isInteger(currentIndex)) ? "block" : "hidden"} bg-gray-200 z-50 overflow-auto `}>
            <div className=" flex text-sm justify-around text-center border-t border-r border-l border-gray-500 bo font-bold p-1">
                <span>
                    Loss Details
                </span>
            </div>
            <table className="border border-gray-500 w-full text-xs text-start">
                <thead className="border border-gray-500">
                    <tr>
                        <th className="w-52 border border-gray-500">Loss</th>
                        <th className="w-28 border border-gray-500">Qty</th>
                        {!readOnly &&
                            <th className="border border-gray-500 text-green-600" onClick={addReason}>{PLUS}</th>
                        }
                    </tr>
                </thead>
                <tbody>
                    {(currentConsumption?.lossDetails ? currentConsumption?.lossDetails : []).map((item, lotIndex) =>
                        <tr className='table-row' key={lotIndex}>
                            <td className='text-center table-data '>
                                <select
                                    onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", lotIndex, "uomId") } }}
                                    disabled={readOnly} className='text-left rounded py-1 table-data-input'
                                    value={item.lossReasonId} onChange={(e) => handleInputChange(e.target.value, lotIndex, "lossReasonId")}
                                    onBlur={(e) => {
                                        handleInputChange((e.target.value), lotIndex, "lossReasonId")
                                    }
                                    }
                                >
                                    <option hidden>
                                    </option>
                                    {(id ? lossReason.data : lossReason.data.filter(item => item.active)).map((blend) =>
                                        <option value={blend.id} key={blend.id}>
                                            {blend.reason}
                                        </option>
                                    )}
                                </select>
                            </td>
                            <td className='text-center table-data'>
                                <input
                                    onKeyDown={e => {
                                        if (e.code === "Minus" || e.code === "NumpadSubtract") e.preventDefault()

                                        if (e.key === "Delete") { handleInputChange("", lotIndex, "lossQty"); }
                                    }}
                                    min={"0"}
                                    type="number"
                                    className="text-right rounded py-1   w-full table-data-input"
                                    value={item.lossQty}
                                    disabled={readOnly}
                                    onChange={(event) => {
                                        if (!event.target.value) {
                                            handleInputChange(event.target.value, lotIndex, "lossQty");
                                            return
                                        }
                                        const totalLossQty = (currentConsumption?.lossDetails ? currentConsumption?.lossDetails : []).filter(((_, i) => parseInt(i) !== parseInt(lotIndex))).reduce((a, c) => a + parseFloat(c.lossQty), 0)
                                        if ((parseFloat(event.target.value) + parseFloat(currentConsumption.receivedQty) + totalLossQty) > balanceQty) {
                                            toast.info("Loss Cannot Be More than Bal. Qty", { position: "top-center" })
                                            return
                                        }
                                        handleInputChange(event.target.value, lotIndex, "lossQty");
                                    }}
                                />
                            </td>
                            {!readOnly &&
                                <th className='table-data text-center'>
                                    <Delete onClick={() => { removeLotNo(lotIndex) }} />
                                </th>
                            }
                        </tr>
                    )}
                </tbody>
            </table>
            {!readOnly &&
                <div className='flex justify-end'><button className='bg-sky-300 p-1 rounded-md' onClick={() => { setCurrentSelectedIndex("") }}>Done</button></div>}
        </div>
    )
}

export default LossReasonBreakup