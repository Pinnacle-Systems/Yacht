import moment from 'moment'
import React from 'react'
import { VIEW } from '../../../icons'
import { getImageUrlPath } from '../../../helper'
const Embroiding = ({ setCurrentImage, setIsStyleImageOpen, val, userData }) => {
    function openPreview(field) {
        window.open(val[field] instanceof File ? URL.createObjectURL(val[field]) : getImageUrlPath(val[field]))
    }
    return (
        <>
            <tr className='text-left'>
                <td className=' py-1.5 flex gap-x-1 gridAlignLeft justify-center capitalize text-xs'
                   title={
                    `${
                      val?.embroidingUserId > 0
                        ? (userData?.data?.find(user => user.id === val?.embroidingUserId)?.username || "")
                        : ""
                    }\n${val?.embroidingDate ? moment.utc(val?.embroidingDate).format("DD-MM-YYYY") : "Not Finish"}`
                  }
                >
                    <input type={"checkbox"} checked={val?.embroiding} disabled={true} 
                     title={
                        `${
                          val?.embroidingUserId > 0
                            ? (userData?.data?.find(user => user.id === val?.embroidingUserId)?.username || "")
                            : ""
                        }\n${val?.embroidingDate ? moment.utc(val?.embroidingDate).format("DD-MM-YYYY") : "Not Finish"}`
                      } />
                    {/* <button className='text-center' onClick={() => { openPreview("embroidingFilePath") }}> */}
                    {val.embroidingFilePath &&

                        < button className='text-center' onClick={() => { setIsStyleImageOpen(true); setCurrentImage(val.embroidingFilePath) }}>
                            {VIEW}
                        </button>
                    }
                    {/* <span>{val?.embroidingDate ? moment.utc(val?.embroidingDate).format("DD-MM-YYYY") : ""}</span> */}

                </td>
            </tr >
        </>
    )
}

export default Embroiding