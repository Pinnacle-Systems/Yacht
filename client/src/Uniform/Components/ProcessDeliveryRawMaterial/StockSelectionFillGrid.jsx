import React, { useEffect, useState } from 'react';

import FabricStockFillGrid from './FabricStockFillGrid';
import _ from 'lodash';


const StockSelectionFillGrid = ({ storeId, getIssuedPropertyFabric, getIssuedPropertyYarn, rawMaterialType, setRawMaterials, rawMaterials, setFillGrid, styleColors }) => {
    const [localRawMaterials, setLocalRawMaterials] = useState(rawMaterials);

    function handleDone() {
        setRawMaterials(localRawMaterials);
        setFillGrid(false);
    }

    function handleCancel() {
        setLocalRawMaterials([]);
        setFillGrid(false);
    }
    return (
        <>
            <div className='w-[1100px] h-[500px] overflow-auto'>
                <div>

                    {rawMaterialType.includes("F") ?
                        <FabricStockFillGrid
                            getIssuedProperty={getIssuedPropertyFabric}
                            setLocalRawMaterials={setLocalRawMaterials} rawMaterialType={rawMaterialType}
                            styleColors={styleColors} localRawMaterials={localRawMaterials} storeId={storeId} />
                        :
                        <></>
                    }

                </div>
            </div>
            <div className='flex item-end justify-end gap-4 mt-3 z-30'>
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