import React from 'react'
import YarnRawMaterialItem from './YarnRawMaterialItem'
import FabricRawMaterialItem from './FabricRawMaterialItem'

const RawMaterialItem = ({ item, rawMaterialType }) => {
    return (
        <div>
            <div className='text-sm font-bold text-center'>
                Raw Materials
            </div>
            {(rawMaterialType === "GreyYarn") || (rawMaterialType === "DyedYarn")
                ?
                <YarnRawMaterialItem item={item} />
                :
                <>
                    {
                        (rawMaterialType === "GreyFabric") || (rawMaterialType === "DyedFabric")
                            ?
                            <FabricRawMaterialItem item={item} />
                            :
                            <></>
                    }
                </>
            }
        </div>
    )
}

export default RawMaterialItem
