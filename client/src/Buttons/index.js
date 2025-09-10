import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSave, faClose, faUserPlus, faEdit, faTrashCan, faPlusCircle, faRefresh, faPrint, faSearch, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { useState } from 'react';
import excelIcon from "../assets/icons8-microsoft-excel-48.png"



export const AddNewButton = ({ onClick, disabled = false }) => {
console.log();

    return (
        <button className='text--300 py-2 px-4 rounded focus:outline-none focus:shadow-outline' onClick={() => onClick()} disabled={disabled}>
            {<FontAwesomeIcon icon={faUserPlus} />} Add New
        </button>
    )
}

export const New = ({ name, setFormHidden }) => {
    return (
        <button className='text-violet-400 py-2 px-4 rounded focus:outline-none focus:shadow-outline' onClick={() => { setFormHidden(false); }}>
            {<FontAwesomeIcon icon={faPlusCircle} />} Add {name}
        </button>
    )
}

export const GenerateButton = ({ onClick, hidden }) => {
    return (
        <button className='text-yellow-300 py-2 px-4 rounded focus:outline-none focus:shadow-outline' onClick={() => { onClick(); }} hidden={hidden}>
            {<FontAwesomeIcon icon={faRefresh} />} Generate
        </button>
    )
}

export const Delete = ({ onClick }) => {
    return (
        <button className='text-red-500 py-2 px-4 rounded focus:outline-none focus:shadow-outline' onClick={() => onClick()}>
            {<FontAwesomeIcon icon={faTrashCan} />}
        </button>
    )
}

export const OpenProjectButton = ({ setNavigateProjectId, quotesData, onClick }) => {
    return (
        <button className='text-green-400 text-sm py-2 px-4 rounded focus:outline-none focus:shadow-outline' onClick={() => { onClick(); }}>
            {<FontAwesomeIcon icon={faUserPlus} />} {quotesData?.projectId ? "Go To Project" : "Create Project"}
        </button>
    )
}


export const NewButton = ({ onClick }) => {
    return (
        <button className='text-violet-400 text-sm py-2 px-4 rounded focus:outline-none focus:shadow-outline' onClick={() => { onClick(); }}>
            {<FontAwesomeIcon icon={faUserPlus} />} New
        </button>
    )
}

export const EditButton = ({ onClick }) => {
    return (
        <button className='text-yellow-700 text-sm py-2 px-4 rounded focus:outline-none focus:shadow-outline' onClick={() => onClick()}>
            {<FontAwesomeIcon icon={faEdit} />} Edit
        </button>
    )
}

export const EditButtonOnly = ({ onClick }) => {
    return (
        <button className='text-yellow-500 text-sm px-2 rounded focus:outline-none focus:shadow-outline' onClick={() => onClick()}>
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
        <button disabled={isDisabled}
            className='text-green-600 text-sm py-2 px-4 rounded focus:outline-none focus:shadow-outline'
            onClick={() => { onClick(); disableButton(); }}>
            {<FontAwesomeIcon icon={faSave} />} Save
        </button>
    )
}

export const CloseButton = ({ onClick }) => {
    return (
        <button className='text-orange-500 text-sm py-2 px-4 rounded focus:outline-none focus:shadow-outline' onClick={() => onClick()}>
            {<FontAwesomeIcon icon={faClose} />} Close
        </button>
    )
}

export const DeleteButton = ({ onClick }) => {
    return (
        <button className='text-red-700 text-sm py-2 px-4 rounded focus:outline-none focus:shadow-outline' onClick={() => onClick()}>
            {<FontAwesomeIcon icon={faTrashCan} />} Delete
        </button>
    )
}



export const CloseButtonOnly = ({ onClick }) => {
    return (
        <button className='text-black text-sm py-2 px-4 rounded focus:outline-none focus:shadow-outline' onClick={() => onClick()}>
            {<FontAwesomeIcon icon={faClose} />}
        </button>
    )
}

export const PrintButtonOnly = ({ onClick }) => {
    return (
        <button className='text-pink-500 text-sm py-2 px-4 rounded focus:outline-none focus:shadow-outline' onClick={() => onClick()}>
            {<FontAwesomeIcon icon={faPrint} />} Print
        </button>
    )
}

export const SearchButton = ({ onClick }) => {
    return (
        <button className='text-pink-600 text-sm py-2 px-4 rounded focus:outline-none focus:shadow-outline' onClick={() => onClick()}>
            {<FontAwesomeIcon icon={faSearch} />} Search
        </button>
    )
}

export const ExcelButton = ({ onClick, width = 18, height = 18 }) => {
    return (
        <button className='rounded focus:outline-none focus:shadow-outline' onClick={(e) => onClick(e)}>
            <img src={excelIcon} width={width} height={height} />
        </button>
    )
}

export const PreviewButtonOnly = ({ onClick }) => {
    return (
        <button className='text-pink-500 text-sm py-2 px-4 rounded focus:outline-none focus:shadow-outline' onClick={() => onClick()}>
            {<FontAwesomeIcon icon={faPrint} />} Preview
        </button>
    )
}

export const ViewButtton = ({ onClick }) => {
    return (
        <button className='text-pink-200 text-sm py-2 px-4 rounded focus:outline-none focus:shadow-outline' onClick={() => onClick()}>
            View
        </button>
    )
}