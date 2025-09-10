import React from 'react'
import { DropdownInput } from '../../Inputs'
import { showEntries } from '../../Utils/DropdownData'

const ShowEntries = ({ value, setValue }) => {
    return (
        <DropdownInput name={"Show Entries"} className={"text-white"} value={value} setValue={setValue} options={showEntries} />
    )
}

export default ShowEntries