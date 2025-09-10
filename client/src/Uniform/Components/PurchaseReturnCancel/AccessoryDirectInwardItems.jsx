import { toast } from 'react-toastify';
import AccessoryPoItem from './AccessoryPoItem';
import AccessoryDirectItem from './AccessoryDirectItem';
import { useGetUomQuery } from '../../../redux/services/UomMasterService';
import { useGetColorMasterQuery } from '../../../redux/uniformService/ColorMasterService';
import { useGetAccessoryMasterQuery } from '../../../redux/uniformService/AccessoryMasterServices';
import { useGetSizeMasterQuery } from '../../../redux/uniformService/SizeMasterService';

const AccessoryDirectInwardItems = ({ storeId, inwardItems, setInwardItems, readOnly, removeItem, purchaseInwardId, params }) => {

    const { data: colorList } =
        useGetColorMasterQuery({ params: { ...params } });
    const { data: accessoryList } =
        useGetAccessoryMasterQuery({ params });

    const { data: sizeList } =
        useGetSizeMasterQuery({ params });
    const { data: uomList } =
        useGetUomQuery({ params });

    const handleInputChange = (value, index, field, balanceQty, poItem = undefined) => {
        const newBlend = structuredClone(inwardItems);
        newBlend[index][field] = value;

        if (poItem) {
            newBlend[index]["poNo"] = poItem?.DirectInwardOrReturn?.docId
            newBlend[index]["accessoryGroupId"] = poItem?.accessoryGroupId
            newBlend[index]["accessoryItemId"] = poItem?.accessoryItemId
            newBlend[index]["colorId"] = poItem?.colorId
            newBlend[index]["sizeId"] = poItem?.sizeId
            newBlend[index]["discountAmount"] = poItem?.discountAmount
            newBlend[index]["discountType"] = poItem?.discountType
            newBlend[index]["poId"] = poItem?.poId
            newBlend[index]["price"] = poItem?.price
            newBlend[index]["taxPercent"] = poItem?.taxPercent
            newBlend[index]["uomId"] = poItem?.uomId
            newBlend[index]["poQty"] = poItem?.qty

            newBlend[index]["alreadyInwardedQty"] = poItem?.alreadyInwardedQty ? parseFloat(poItem.alreadyInwardedQty).toFixed(3) : "0.000";
            newBlend[index]["alreadyInwardedRolls"] = poItem?.alreadyInwardedRolls ? parseInt(poItem.alreadyInwardedRolls) : "0";
            newBlend[index]["alreadyReturnedQty"] = poItem?.alreadyReturnedQty ? parseFloat(poItem.alreadyReturnedQty).toFixed(3) : "0.000";
            newBlend[index]["alreadyReturnedRolls"] = poItem?.alreadyReturnedData?._sum?.noOfRolls ? parseInt(poItem.alreadyReturnedData._sum.noOfRolls) : "0";
            newBlend[index]["balanceQty"] = poItem?.balanceQty ? parseFloat(poItem.balanceQty).toFixed(3) : "0.000";
            newBlend[index]["stockQty"] = parseFloat(poItem?.stockQty).toFixed(3)
            newBlend[index]["stockRolls"] = parseInt(poItem?.stockRolls)



            newBlend[index]["allowedReturnRolls"] = poItem?.allowedReturnRolls
            newBlend[index]["allowedReturnQty"] = parseFloat(poItem?.allowedReturnQty).toFixed(3)
        }


        if (field === "qty") {
            if (parseFloat(balanceQty) < parseFloat(value)) {
                toast.info("Inward Qty Can not be more than balance Qty", { position: 'top-center' })
                return
            }
        }
        setInwardItems(newBlend);
    };
    return (
        <>
            <div className={`relative w-full overflow-auto py-1`}>
                <table className="border border-gray-500 text-xs table-auto w-full  ">
                    <thead className='bg-blue-200 border border-gray-500 top-0'>
                        <tr className='h-8 '>
                            <th className="table-data w-5  text-center">S.no</th>
                            <th className="table-data  w-16 text-center">Po.no</th>
                            <th className="table-data  ">Accessory Name</th>
                            <th className="table-data  ">Accessory Items</th>
                            <th className="table-data  ">Accessory Group</th>
                            <th className="table-data  ">Colors</th>
                            <th className="table-data  ">Size</th>
                            <th className="table-data   ">UOM</th>
                            <th className="table-data  w-14">Stock.Qty</th>

                            <th className="table-data  w-14"> Alr.In Qty</th>
                            <th className="table-data  w-14"> Alr.Rtn.Qty</th>
                            <th className="table-data  w-14"> Allo.Rtn.Qty</th>

                            <th className="table-data  w-14">Rtn.Qty</th>
                            <th className="table-data  w-14">Price</th>
                            <th className="table-data  w-14">Gross</th>
                            {!readOnly &&
                                <th className='table-data border  w-12'>Delete</th>
                            }
                        </tr>
                    </thead>
                    <tbody className='overflow-y-auto  h-full w-full'>{console.log(inwardItems, "inwardItems")}
                        {inwardItems.map((item, index) => <AccessoryDirectItem sizeList={sizeList} accessoryList={accessoryList}
                            uomList={uomList}
                            colorList={colorList}
                            item={item} purchaseInwardId={purchaseInwardId} removeItem={removeItem} readOnly={readOnly} key={item.poItemsId} index={index} handleInputChange={handleInputChange} />)}
                        {Array.from({ length: 8 - inwardItems.length }).map(i =>
                            <tr className='w-full font-bold h-8 border border-gray-400 table-row'>
                                {Array.from({ length: 15 }).map(i =>
                                    <td className="table-data   "></td>
                                )}
                                {!readOnly &&
                                    <td className="table-data w-14"></td>
                                }
                            </tr>)
                        }
                    </tbody>
                </table>
            </div>
        </>
    )
}
export default AccessoryDirectInwardItems
