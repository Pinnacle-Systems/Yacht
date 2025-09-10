import React from 'react'
import { DisabledInput, TextArea, TextInput } from '../../../Inputs'

const Consolidation = ({ totalQty, vehicleNo, setVehicleNo, remarks, setRemarks, specialInstructions, setSpecialInstructions }) => {
    return (
        <div className='fixed bottom-5 overflow-auto w-full text-xs bg-gray-50'>
            <fieldset className='frame rounded-tr-lg rounded-bl-lg rounded-br-lg w-full border border-gray-600 p-1 overflow-auto flex justify-between'>
                <legend className='sub-heading'>Consolidation</legend>
                <TextInput name={"Vehicle No."} value={vehicleNo} setValue={setVehicleNo} readOnly={false} />
                <TextArea name={"Special Instructions:"} value={specialInstructions} setValue={setSpecialInstructions} readOnly={false} rows={3}/>
                <TextArea name={"Remarks:"} value={remarks} setValue={setRemarks} readOnly={false} rows={3}/>
                <DisabledInput name={"Total Qty"} value={parseFloat(totalQty).toFixed(3)} type={"number"} textClassName='text-right' />
            </fieldset>
        </div>
    )
}

export default Consolidation