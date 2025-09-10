import React from 'react'
import Fabric from './Fabric'


const Program = ({ finishedGoodsType, programDetails, setProgramDetails, setCurrentProgramIndex, readOnly, currentProgramIndex, rawMaterialRef }) => {
    return (
        <fieldset disabled={readOnly} className='frame rounded-tr-lg rounded-bl-lg rounded-br-lg w-full border
         border-gray-600 overflow-auto max-h-[220px]'>
            <legend className='sub-heading'>Program Details</legend>
            {finishedGoodsType?.includes("F")
                ?
                <Fabric rawMaterialRef={rawMaterialRef} readOnly={readOnly} currentProgramIndex={currentProgramIndex} finishedGoodsType={finishedGoodsType} programDetails={programDetails} setProgramDetails={setProgramDetails} setCurrentProgramIndex={setCurrentProgramIndex} />
                :
                <>

                </>
            }
        </fieldset>
    )
}

export default Program