import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSave, faClose, faUserPlus, faEdit, faTrashCan, faPlusCircle, faRefresh, faPrint, faSearch } from "@fortawesome/free-solid-svg-icons";
import { useState } from 'react';




export const AddNewButton = ({ onClick, disabled = false }) => {

    return (
        <button className='text-green-600 py-2 px-4 rounded focus:outline-none focus:shadow-outline' onClick={() => onClick()} disabled={disabled}>
            {<FontAwesomeIcon icon={faUserPlus} />} Add New
        </button>
    )
}

export const New = ({ name, setFormHidden }) => {
    return (
        <button className='text-green-600 py-2 px-4 rounded focus:outline-none focus:shadow-outline' onClick={() => { setFormHidden(false); }}>
            {<FontAwesomeIcon icon={faPlusCircle} />} Add {name}
        </button>
    )
}

export const GenerateButton = ({ onClick, hidden, name = "Generate" }) => {
    return (
        <button className='text-green-600 py-2 px-4 rounded focus:outline-none focus:shadow-outline' onClick={() => { onClick(); }} hidden={hidden}>
            {<FontAwesomeIcon icon={faRefresh} />} {name}
        </button>
    )
}

export const Delete = ({ onClick }) => {
    return (
        <button className='text-red-500 px-3 py-1.5 rounded focus:outline-none focus:shadow-outline' onClick={() => onClick()}>
            {<FontAwesomeIcon icon={faTrashCan} />}
        </button>
    )
}

export const NewButton = ({ onClick }) => {
    return (
        <button className='text-white py-2 px-4 rounded focus:outline-none focus:shadow-outline' onClick={() => { onClick(); }}>
            {<FontAwesomeIcon icon={faUserPlus} />} New
        </button>
    )
}

export const EditButton = ({ onClick }) => {
    return (
        <div className='cursor-pointer text-white bg-blue-500 px-3 py-1  text-[11px] rounded focus:outline-none focus:shadow-outline' onClick={() => onClick()}>
            {<FontAwesomeIcon icon={faEdit} />} Edit
        </div>
    )
}

export const EditButtonOnly = ({ onClick }) => {
    return (
        <button className="text-white px-3 pb-1  mt-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors duration-200 bg-blue-600 hover:bg-blue-700 active:bg-blue-800"
            onClick={() => onClick()}>
            {<FontAwesomeIcon icon={faEdit} />}
        </button>
    )
}

export const SaveButton = ({ onClick }) => {
    const [isDisabled, setIsDisabled] = useState(false);

    const disableButton = () => {
        setIsDisabled(true);
        setTimeout(() => {
            setIsDisabled(false);
        }, 5000);
    };
    return (
        <div disabled={isDisabled}
            className='cursor-pointer bg-green-500 text-white px-2 py-1 mt-1 text-[11px] rounded focus:outline-none focus:shadow-outline'
            onClick={() => { onClick(); disableButton(); }}>
            {<FontAwesomeIcon icon={faSave} />} Save
        </div>
    )
}

export const CloseButton = ({ onClick }) => {
    return (
        <div
            className='cursor-pointer px-3 py-1.5 text-xs rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors duration-200 text-secondary hover:bg-gray-100 active:bg-gray-200' onClick={() => onClick()}>
            {<FontAwesomeIcon icon={faClose} />} Cancel
        </div>
    )
}

export const OpenTable = ({ onClick }) => {
    return (
        <button className='text-white py-2 px-4 rounded focus:outline-none focus:shadow-outline button' onClick={() => onClick()}>
            {<FontAwesomeIcon icon={faSearch} />} Search
        </button>
    )
}

export const DeleteButton = ({ onClick }) => {
    return (
        <div className='cursor-pointer text-red-500  px-2 py-1 text-[11px] rounded focus:outline-none focus:shadow-outline ' onClick={() => onClick()}>
            {<FontAwesomeIcon icon={faTrashCan} />} Delete
        </div>
    )
}



export const CloseButtonOnly = ({ onClick }) => {
    return (
        <button className='text-black px-3 py-1.5 rounded focus:outline-none focus:shadow-outline' onClick={() => onClick()}>
            {<FontAwesomeIcon icon={faClose} />}
        </button>
    )
}

export const PrintButtonOnly = ({ onClick }) => {
    return (
        <button className='text-pink-500 px-3 py-1.5 rounded focus:outline-none focus:shadow-outline' onClick={() => onClick()}>
            {<FontAwesomeIcon icon={faPrint} />} Print
        </button>
    )
}

export const SearchButton = ({ onClick }) => {
    return (
        <button className='text-gray-300 py-2 px-4 rounded focus:outline-none focus:shadow-outline' onClick={() => onClick()}>
            {<FontAwesomeIcon icon={faSearch} />} Search
        </button>
    )
}

export const ExcelButton = ({ onClick, width = 18, height = 18 }) => {
    return (
        <button className='rounded focus:outline-none focus:shadow-outline' onClick={(e) => onClick(e)}>
            <img alt='' width={width} height={height} />
        </button>
    )
}




