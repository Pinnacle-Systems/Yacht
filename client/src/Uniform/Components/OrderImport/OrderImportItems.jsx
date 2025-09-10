import React from 'react'
import { convertSpaceToUnderScore } from '../../../Utils/helper'
import moment from 'moment'
const OrderImportItems = ({ orderImportItems }) => {

    const header = [
        "department",
        "class",
        "season_supplier_code",
        "item_code",
        "ean_barcode",
        "style_code_group",
        "mrp",
        "month_year",
        "product",
        "size_desc",
        "code",
        "colour",
        "qty",
        "order_qty",
        "po_number",
        "manufacturer_mail_id",
         "vendor_mail_id"

    ]



    function excelDateToJSDate(serial) {

        const utc_days = Math.floor(serial - 25569);
        const utc_value = utc_days * 86400;
        let date = new Date(utc_value * 1000);

        // const excelEpoch = new Date(30, 11, 1899);
        // let date = new Date(excelEpoch.getTime() + serial * 86400000);
        date = moment(date).format("DD-MM-YYYY")
        date = date.toString()
        return date

        // return date.toISOString().split('T')[0]; 
    }
    return (
        <div className="w-full">
            <div className="w-full flex flex-col gap-5">
                <div className="mt-3 flex flex-col justify-start items-start gap-10">

                    <table className="w-full">
                        <thead className='bg-sky-200'>
                            <tr>
                                <th className="border border-gray-400 text-sm py-1 w-12 ">S.No</th>
                                {header.map((columnName, index) => (
                                    <th className="border border-gray-400 text-sm py-1 capitalize" key={index}>{convertSpaceToUnderScore(columnName)}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {orderImportItems?.map((row, rowIndex) => (
                                <tr key={rowIndex}>
                                    <td className="border border-gray-400 text-sm py-1 text-center">{rowIndex + 1}</td>
                                    {header.map((columnName, columnIndex) => (
                                        <td className="border border-gray-400 text-xs py-1 px-1" key={columnIndex}>{row[convertSpaceToUnderScore(columnName)] === "undefined" ?
                                            '' : columnName == "month_year" ? excelDateToJSDate(row[convertSpaceToUnderScore(columnName)]) : row[convertSpaceToUnderScore(columnName)]}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default OrderImportItems