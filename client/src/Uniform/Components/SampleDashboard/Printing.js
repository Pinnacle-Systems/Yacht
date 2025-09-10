import moment from 'moment'
import React from 'react'
import { VIEW } from '../../../icons'
import { getImageUrlPath } from '../../../helper'

const Printing = ({ setCurrentImage, setIsStyleImageOpen, val, userData }) => {
    function openPreview(field) {
        window.open(val[field] instanceof File ? URL.createObjectURL(val[field]) : getImageUrlPath(val[field]))
    }
    return (
        <>
            <tr className='text-left'>
                <td className=' py-1.5 flex gap-x-1 gridAlignLeft justify-center capitalize text-xs'
                   title={
                    `${
                      val?.printingUserId > 0
                        ? (userData?.data?.find(user => user.id === val?.printingUserId)?.username || "")
                        : ""
                    }\n${val?.printingDate ? moment.utc(val?.printingDate).format("DD-MM-YYYY") : "Not Finish"}`
                  }
                >

                    <input type={"checkbox"} checked={val?.printing} disabled={true}
                     title={
                        `${
                          val?.printingUserId > 0
                            ? (userData?.data?.find(user => user.id === val?.printingUserId)?.username || "")
                            : ""
                        }\n${val?.printingDate ? moment.utc(val?.printingDate).format("DD-MM-YYYY") : "Not Finish"}`
                      } />
                    <span>  {val.printingFilePath &&
                        // <button className='' onClick={() => { openPreview("printingFilePath") }}>
                        <button className='text-center' onClick={() => { setIsStyleImageOpen(true); setCurrentImage(val.printingFilePath) }}>
                            {VIEW}
                        </button>
                    }</span>
                    {/* {isHovered && <span> {val?.printingDate ? moment.utc(val?.printingDate).format("DD-MM-YYYY") : ""}</span>} */}


                </td>
            </tr>
        </>
    )
}

export default Printing