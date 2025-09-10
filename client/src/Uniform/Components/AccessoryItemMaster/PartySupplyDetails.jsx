import React from 'react'
import { TICK_ICON } from '../../../icons'
const PartySupplyDetails = ({ partyDetails, partySuppliesItem, setPartySuppliesItem, readOnly }) => {
    function findPartySuppliesCurrentItem(id) {
        return partySuppliesItem.includes(id);
    }
    function handleOnClick(partyId){
        if(readOnly) return
        let newList = structuredClone(partySuppliesItem);
        if(newList.includes(partyId)){
            newList = newList.filter(item => parseInt(item) !== parseInt(partyId))
        }else{
            newList.push(partyId)
        }
        setPartySuppliesItem(newList);
    }

    return (
        <div className='w-full grid justify-items-stretch'>
        <table className='table-fixed text-center'>
            <thead className='border border-gray-500'>
                <tr className='bg-blue-200'>
                    <th className='text-sm border border-gray-500'>
                        Party Name
                    </th>
                    <th className='text-sm border border-gray-500'>
                        Party Alias Name
                    </th>
                    <th className='text-sm border border-gray-500'>
                        Supply
                    </th>
                </tr>
            </thead>
            <tbody>
                {partyDetails.map((party, index) =>
                    <tr key={party.id}>
                        <td className='border border-gray-500 table-data text-sm'> {party.name} </td>
                        <td className='border border-gray-500 table-data text-sm'> {party.aliasName} </td>
                        <td className='border border-gray-500 table-data text-sm' onClick={()=>{handleOnClick(party.id)}}> {findPartySuppliesCurrentItem(party.id) ? TICK_ICON : "" } </td>
                    </tr>
                )}
            </tbody>
        </table>
                </div>
    )
}

export default PartySupplyDetails