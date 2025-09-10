import React from 'react'
import { DropdownWithSearch } from '../Inputs';
import { getCommonParams } from '../Utils/helper';
import { useGetPartyQuery } from '../redux/PharmacyServices/PartyMasterService';

const DropdownSearch = ({ readOnly, name, selected, setSelected, id , options }) => {
    const { token, ...params } = getCommonParams();
    const { data: partyList } = useGetPartyQuery({ params: { ...params } });
    return (
        <div className='grid grid-cols-5 text-xs items-center h-10'>
            <label className='border-r pl-1 text-center'>{name}</label>
            <div className='col-span-4 z-40'>
                <DropdownWithSearch key={selected} value={selected} className='h-32'
                    readOnly={readOnly}
                    setValue={(value) => setSelected(value)}
                    options={(options || []).filter(item => id ? true : item?.active)} />
            </div>
        </div>
    )
}

export default PartyDropdownSearch