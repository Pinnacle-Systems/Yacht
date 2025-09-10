import React from 'react'
import empty from "../../../assets/empty.png"
import { getImageUrlPath } from '../../../Utils/helper'

const ViewImage = ({ picture }) => {



    const imageWidth = "300px"
    const imageHeight = "300px";
    return (
        <div className='flex items-center justify-center'>
            {Boolean(picture) ?
                <img style={{ height: imageHeight, width: imageWidth, objectFit: 'fit', }}
                    src={getImageUrlPath(picture)}
                />
                :
                <img src={empty} className='w-36' />
            }
        </div>
    )
}

export default ViewImage