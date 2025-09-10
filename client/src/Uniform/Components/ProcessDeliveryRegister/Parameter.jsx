import React, { useState } from 'react'
import { MultiSelectDropdown, DateInput } from '../../../Inputs'
import { multiSelectOption } from '../../../Utils/contructObject'
import ProcessDropdown from '../../ReusableComponents/ProcessDropdown';

const Parameter = ({ startDate, setStartDate, endDate, setEndDate, filterPoTypes, setFilterPoTypes, filterPos, setFilterPos,
    filterProcess, setFilterProcess,
    filterParties, setFilterParties, partyId, setPartyId, allSuppliers, onClose }) => {
    const [localStartDate, setLocalStartDate] = useState(startDate)
    const [localEndDate, setLocalEndDate] = useState(endDate)
    const [localFilterParties, setLocalFilterParties] = useState(filterParties);
    const [localPartyId, setLocalPartyId] = useState(partyId);
    const [localFilterProcess, setLocalFilterProcess] = useState(filterProcess);

    function handleDone() {
        setStartDate(localStartDate);
        setEndDate(localEndDate);
        setFilterParties(localFilterParties);
        setPartyId(localPartyId);
        setFilterProcess(localFilterProcess);
        onClose();
    }

    function handleCancel() {
        setLocalStartDate("");
        setLocalEndDate("");
        setLocalFilterParties([]);
        setLocalPartyId("");
        setFilterProcess([]);
        onClose();
    }

    return (
        <div className='w-[900px]'>
            <div className='font-bold w-full text-center'>
                Parameters
            </div>
            <div className='grid items-center justify-center grid-cols-2 gap-x-16 gap-y-5' >
                <DateInput name={"From"} value={localStartDate} setValue={setLocalStartDate} inputClass={"w-[200px]"} />
                <DateInput name={"To"} value={localEndDate} setValue={setLocalEndDate} />
                <ProcessDropdown name={"Process"} selected={localFilterProcess} setSelected={setLocalFilterProcess} />
                <MultiSelectDropdown
                    inputClass={"w-[200px] absolute -z-50 right-[75px]"}
                    className='relative'
                    name={"Supplier"}
                    selected={localFilterParties}
                    setSelected={setLocalFilterParties}
                    options={multiSelectOption(allSuppliers, "aliasName", "id")}
                />
                {/* <MultiSelectDropdown
                        inputClass={"w-[200px] absolute z-50 right-[50px]"}
                        className='left-[700px]'
                        name={"Po"}
                        selected={localFilterPos}
                        setSelected={setLocalFilterPos}
                        options={multiSelectOption(poList, "docId", "id")}
                    /> */}
            </div>
            <div className='flex justify-end gap-4 mt-10'>
                <button onClick={handleDone} className='bg-lime-400 hover:bg-lime-600 hover:text-white p-1 px-3 text-sm rounded font-semibold transition'>
                    Done
                </button>
                <button onClick={handleCancel} className='bg-red-400 hover:bg-red-600 hover:text-white p-1 text-sm rounded font-semibold transition'>
                    Cancel
                </button>
            </div>
        </div>
    )
}

export default Parameter
