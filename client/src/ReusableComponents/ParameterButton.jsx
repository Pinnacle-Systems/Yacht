import React from 'react'
import parameterIcon from "../assets/icons8-filter.gif"

const ParameterButton = ({ onClick }) => {
    return (
        <button className='w-7 h-8' onClick={onClick}>
            <img src={parameterIcon} alt='parameter' />
        </button>
    )
}

export default ParameterButton
