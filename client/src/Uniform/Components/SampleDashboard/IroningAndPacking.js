import moment from 'moment'
import React from 'react'
import { VIEW } from '../../../icons'
import { getImageUrlPath } from '../../../helper'
const IroningAndPacking = ({ setCurrentImage, setIsStyleImageOpen, val, userData }) => {
    function openPreview(field) {
        window.open(val[field] instanceof File ? URL.createObjectURL(val[field]) : getImageUrlPath(val[field]))
    }
    return (
        <>
            <tr className='w-full'>
                <td className={`py-1.5 flex gap-x-1 gridAlignLeft capitalize text-xs justify-center w-full`}
                  title={
                    `${
                      val?.ironingAndPackingUserId > 0
                        ? (userData?.data?.find(user => user.id === val?.ironingAndPackingUserId)?.username || "")
                        : ""
                    }\n${val?.ironingAndPackingDate ? moment.utc(val?.ironingAndPackingDate).format("DD-MM-YYYY") : "Not Finish"}`
                  }
                          

                >

                    <input type={"checkbox"} checked={val?.ironingAndPacking} disabled={true}
                    title={
                        `${
                          val?.ironingAndPackingUserId > 0
                            ? (userData?.data?.find(user => user.id === val?.ironingAndPackingUserId)?.username || "")
                            : ""
                        }\n${val?.ironingAndPackingDate ? moment.utc(val?.ironingAndPackingDate).format("DD-MM-YYYY") : "Not Finish"}`
                      }
                               />
                    {val.ironingAndPackingFilePath &&


                        // <button className='text-center' onClick={() => { openPreview("ironingAndPackingFilePath") }}>
                        <button className='text-center' onClick={() => { setIsStyleImageOpen(true); setCurrentImage(val.ironingAndPackingFilePath) }}>
                            {VIEW}
                        </button>


                    }
                    {/* <span>{val?.ironingAndPackingDate ? moment.utc(val?.ironingAndPackingDate).format("DD-MM-YYYY") : ""}</span> */}

                </td>
            </tr>
        </>
    )
}

export default IroningAndPacking