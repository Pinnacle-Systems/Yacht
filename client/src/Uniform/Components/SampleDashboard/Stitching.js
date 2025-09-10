import moment from 'moment'
import React from 'react'

const Stitching = ({ val, userData }) => {
    return (
        <>
            <tr className='text-left'>
                <td className=' py-1.5 gridAlignLeft text-center capitalize text-xs'
title={
    `${
      val?.stitchingUserId > 0
        ? (userData?.data?.find(user => user.id === val?.stitchingUserId)?.username || "")
        : ""
    }\n${val?.stitchingDate ? moment.utc(val?.stitchingDate).format("DD-MM-YYYY") : "Not Finish"}`
  }
                >
                    <input type={"checkbox"} checked={val?.stitching} disabled={true}
                    title={
                        `${
                          val?.stitchingUserId > 0
                            ? (userData?.data?.find(user => user.id === val?.stitchingUserId)?.username || "")
                            : ""
                        }\n${val?.stitchingDate ? moment.utc(val?.stitchingDate).format("DD-MM-YYYY") : "Not Finish"}`
                      } />
                    {/* <span>{val?.stitchingDate ? moment.utc(val?.stitchingDate).format("DD-MM-YYYY") : ""}</span> */}

                </td>
            </tr>
        </>
    )
}

export default Stitching