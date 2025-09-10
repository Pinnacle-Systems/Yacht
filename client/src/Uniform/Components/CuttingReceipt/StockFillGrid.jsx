import React, { useEffect, useState } from 'react';
import { Loader } from '../../../Basic/components';
import secureLocalStorage from "react-secure-storage";
import FabricStockFillGrid from './FabricStockFillGrid';
import { useGetStockQuery } from '../../../redux/services/StockService';
import _ from 'lodash';


const StockSelectionFillGrid = ({ storeId, getIssuedQty, setCuttingDeliveryDetails, cuttingDeliveryDetails, setFillGrid }) => {
    const [localRawMaterials, setLocalRawMaterials] = useState(cuttingDeliveryDetails);

    const companyId = secureLocalStorage.getItem(
        sessionStorage.getItem("sessionId") + "userCompanyId"
    )
    const branchId = secureLocalStorage.getItem(
        sessionStorage.getItem("sessionId") + "currentBranchId"
    )
    const { data: stockData, isLoading, isFetching
    } = useGetStockQuery({ params: { branchId, isGetStock: true, storeId, itemType: "DyedFabric" } });

    function addItem(item) {
        setLocalRawMaterials(localInwardItems => {
            let newItems = structuredClone(localInwardItems);
            newItems.push(item);
            return newItems
        });
    }
    function removeItem(removeItem) {
        setLocalRawMaterials(localInwardItems => {
            let newItems = structuredClone(localInwardItems);
            newItems = newItems.filter(item => !(_.isEqual(item.itemDetails, removeItem.itemDetails)))
            return newItems
        });
    }
    function isItemChecked(checkItem) {
        let item = localRawMaterials.find(item => _.isEqual(item.itemDetails, checkItem.itemDetails))
        if (!item) return false
        return true
    }
    function handleDone() {
        setCuttingDeliveryDetails(localRawMaterials);
        setFillGrid(false);
    }

    function handleCancel() {
        setLocalRawMaterials([]);
        setFillGrid(false);
    }

    if (isFetching || isLoading) return <Loader />
    return (
        <>
            <div className='w-[1100px] h-[500px] overflow-auto'>
                <FabricStockFillGrid getIssuedQty={getIssuedQty} stockItems={stockData.data} addItem={addItem} removeItem={removeItem} isItemChecked={isItemChecked} />
            </div>
            <div className='flex item-end justify-end gap-4 mt-3'>
                <button onClick={handleDone} className='bg-lime-400 hover:bg-lime-600 hover:text-white p-1 px-3 text-sm rounded font-semibold transition'>
                    Done
                </button>
                <button onClick={handleCancel} className='bg-red-400 hover:bg-red-600 hover:text-white p-1 text-sm rounded font-semibold transition'>
                    Cancel
                </button>
            </div>
        </>
    )
}

export default StockSelectionFillGrid