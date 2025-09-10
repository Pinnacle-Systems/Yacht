import React from 'react'
import { findFromList, substract } from '../../../Utils/helper'
import { toast } from 'react-toastify';
import { DELETE, VIEW } from '../../../icons';

const FabricConsumptionDetailItem = ({ item, index, id, productionReceiptDetails, setCurrentSelectedIndex, setProductionReceiptDetails, productionDeliveryDetailsFillData, readOnly, isPacking }) => {
    const handleInputChange = (value, index, field) => {
        const newBlend = structuredClone(productionReceiptDetails);
        newBlend[index][field] = value;
        setProductionReceiptDetails(newBlend);
    };
    console.log(productionDeliveryDetailsFillData, "productionDeliveryDetailsFillData")

    console.log(item, "itemm")

    const productionDeliveryItem = productionDeliveryDetailsFillData.find(i => parseInt(i.id) === parseInt(item.productionDeliveryDetailsId))
    const delQty = productionDeliveryItem?.delQty
    const alreadyReceivedQty = productionDeliveryItem?.alreadyReceivedQty ? productionDeliveryItem?.alreadyReceivedQty : 0;
    const balQty = substract(delQty, alreadyReceivedQty);
    const totalLossQty = (item?.lossDetails ? item?.lossDetails : []).reduce((a, c) => a + parseFloat(c?.lossQty), 0)

    const deleteItem = () => {
        setProductionReceiptDetails(prev => {
            return prev.filter(i => parseInt(i.productionDeliveryDetailsId) !== parseInt(item.productionDeliveryDetailsId))
        })
    }
    return (
        <tr key={index} className='py-2 table-row'>
            <td className='table-data   '>
                {index + 1}
            </td>

            <td className='table-data'>
                {productionDeliveryItem?.Item?.name}
            </td>
            <td className='table-data'>
                {productionDeliveryItem?.Panel?.name}
            </td>

            <td className='table-data'>
                {productionDeliveryItem?.Color?.name}
            </td>
            <td className=' table-data text-left px-1'>
                {productionDeliveryItem?.Size?.name}
            </td>
            {/* <td className='  table-data text-left'>
                {productionDeliveryItem?.Uom?.name}
            </td> */}
            {/* <td className='  table-data text-right px-1'>
                {productionDeliveryItem?.processCost}
            </td> */}
            <td className='  table-data text-right px-1'>
                {delQty}
            </td>
            <td className='  table-data text-right px-1'>
                {alreadyReceivedQty}
            </td>
            <td className='  table-data text-right px-1'>
                {balQty}
            </td>
            <td className='table-data'>
                <input
                    type="number"
                    onFocus={(e) => e.target.select()}
                    className="text-right rounded py-1 px-1 w-full table-data-input"

                    value={(!item.consumption) ? 0 : item.consumption}

                    onChange={(e) => {
                        if (parseFloat(e.target.value) + totalLossQty > balQty) {
                            toast.info("Inward Qty Cannot be more than balance Qty", { position: 'top-center' })
                            return
                        }
                        handleInputChange(e.target.value, index, "consumption")
                    }}
                    onBlur={(e) =>
                        handleInputChange(parseFloat(e.target.value).toFixed(3), index, "consumption")
                    }
                />
            </td>
            <td className='table-data'>
                <button
                    className="text-center rounded py-1 w-20"
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            setCurrentSelectedIndex(index);
                        }
                    }}
                    onClick={() => {
                        setCurrentSelectedIndex(index)
                    }}>
                    {VIEW}
                </button>
            </td>
            {/* <td className='  table-data text-right'>
                {totalLossQty?.toFixed(3)}
            </td> */}
            {!readOnly
                &&
                <td className='table-data '>
                    <button className='w-full' onClick={deleteItem}>
                        {DELETE}
                    </button>
                </td>
            }
        </tr>
    )
}

export default FabricConsumptionDetailItem