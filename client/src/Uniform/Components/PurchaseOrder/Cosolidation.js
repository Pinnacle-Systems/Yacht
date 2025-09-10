import React from 'react'
import { DisabledInput, TextArea, TextInput } from '../../../Inputs'

const Consolidation = ({ isPurchaseCancel, isRawMaterialSales = null, netAmount = 0, totalQty, vehicleNo, setVehicleNo, remarks, setRemarks, specialInstructions, setSpecialInstructions, readOnly }) => {
    return (
        <div className='fixed bottom-5 overflow-auto w-full text-xs bg-gray-50'>
            <fieldset className='frame rounded-tr-lg rounded-bl-lg rounded-br-lg w-full border border-gray-600 p-1 overflow-auto flex justify-between'>
                <legend className='sub-heading'>Consolidation</legend>
                {/* {!isPurchaseCancel
                    &&
                    <>
                        <TextInput name={"Vehicle No."} value={vehicleNo} setValue={setVehicleNo} readOnly={readOnly} />
                        <TextArea name={"Special Instructions:"} value={specialInstructions} setValue={setSpecialInstructions} readOnly={readOnly} rows={3} />
                    </>
                } */}
                <TextArea name={"Remarks:"} value={remarks} setValue={setRemarks} readOnly={readOnly} rows={3} cols={96} />
                {/* {isRawMaterialSales &&
                    <DisabledInput name={"Net Amount:"} value={parseFloat(netAmount).toFixed(3)} type={"number"} textClassName='text-right' />
                }
                <DisabledInput name={"Total Qty"} value={parseFloat(totalQty).toFixed(3)} type={"number"} textClassName='text-right' /> */}
            </fieldset>
        </div>
    )
}

export default Consolidation