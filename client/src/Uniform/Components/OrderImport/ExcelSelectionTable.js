import React from "react";
import { read, utils } from "xlsx";
import { convertSpaceToUnderScore } from "../../../Utils/helper";
import moment from 'moment'
const ExcelSelectionTable = ({ file, setFile, pres, setPres }) => {

  console.log(pres, "pres")

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };




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


  const uploadFile = () => {

    const reader = new FileReader();

    reader.onload = function (e) {
      const data = new Uint8Array(e.target.result);

      const workbook = read(data, { type: "array" });
      const worksheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[worksheetName];

      const jsonData = utils.sheet_to_json(worksheet, { header: 1 });

      const headerNames = jsonData.shift();

      console.log(jsonData, "jsonData")

      let transformedData = jsonData.map((row) => {
        const obj = {};
        headerNames.forEach((header, index) => {
          obj[convertSpaceToUnderScore(header)] = (row[index]);
        });
        return obj;
      });
      setPres(transformedData);
    };



    reader.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentLoaded = (event.loaded / event.total) * 100;
        console.log(`Loading progress: ${percentLoaded}%`);
      }
    };



    reader.readAsArrayBuffer(file);
  };



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

  return (
    <div className="w-full">
      <div className="w-full flex flex-col gap-5">
        <div className="mt-3 flex flex-col justify-start items-start gap-10">
          <div className="flex justify-center items-center gap-5">
            <h1 className="text-sm font-bold">Upload File</h1>
            <div className='flex items-center border border-lime-500 hover:bg-lime-500 transition rounded-md h-8 px-3'>
              <input type="file" id="profileImage" className='hidden' onChange={handleFileChange} />
              <label htmlFor="profileImage" className="text-xs w-full font-bold text-center">Browse</label>
            </div>
            <button onClick={uploadFile}>Upload</button>
          </div>
          <div className="overflow-x-auto w-full">{console.log(pres, "pres", header, "header")}
            <table className="min-w-full table-auto">
              <thead className='bg-sky-200'>
                <tr>
                  <th className="border border-gray-400 text-sm py-1 ">S.No</th>
                  {header.map((columnName, index) => (
                    <th className="border border-gray-400 text-sm py-1 capitalize px-2" key={index}>{convertSpaceToUnderScore(columnName)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pres?.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    <td className="border border-gray-400 text-sm py-1">{rowIndex + 1}</td>
                    {header.map((columnName, columnIndex) => (
                      <td className="border border-gray-400 text-xs py-1 px-1" key={columnIndex}>{columnName == "month_year" ? excelDateToJSDate(row[convertSpaceToUnderScore(columnName)]) : row[convertSpaceToUnderScore(columnName)]}  </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ExcelSelectionTable;
