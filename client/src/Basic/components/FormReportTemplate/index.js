import React from "react";
import moment from "moment/moment";
import { EMPTY_ICON } from '../../../icons';
import { Loader } from "../../components"
import { findFromList } from "../../../Utils/helper";
import { expenses, formExpenses } from "../../../Utils/DropdownData";
import ReactHTMLTableToExcel from 'react-html-table-to-excel';
import pantoneColors from "../ColorMaster/Pantone";

const ACTIVE = (
  <button className="rounded bg-green-500 border p-1 disabled">ACTIVE</button>
);
const INACTIVE = (
  <button className="rounded bg-red-500 border p-1 disabled">INACTIVE</button>
);
const EXPIRED = (
  <button className="rounded bg-gray-500 border p-1 disabled">EXPIRED</button>
);
const ACTIVE_PLAN = (
  <button className="rounded bg-blue-600 border p-1 disabled">ACTIVE</button>
);

const MOMENT = moment;
export default function FormReport({

  formExpenseType,
  setFormExpenseType,
  projectExpenses = null,
  findTotalExpenses,
  findTotalAmount,
  tableHeaders,
  tableDataNames,
  setId,
  data,
  loading,
  searchValue,
  setSearchValue,
  needExcelReport = false
}) {





  return (
    <div className="flex flex-col md:justify-items-center h-[450px] overflow-auto">

      <div className="md:text-center md:gap-8">
        <input
          type="text"
          className="text-sm bg-gray-100 focus:outline-none border w-full"
          id="id"
          placeholder="Search"
          value={searchValue}
          onChange={(e) => {
            setSearchValue(e.target.value);
          }}
        />
      </div>
      {loading ? (
        <Loader />
      ) : (
        <>
          {data?.length === 0 ? (
            <div className="flex-1 flex justify-center text-blue-900 items-center text-xl mt-5">
              <p>{EMPTY_ICON} No Data Found...! </p>
            </div>
          ) : (
            <div
              className="md:grid md:justify-items-stretch overflow-auto"
            >
              {
                projectExpenses &&

                <div className='flex gap-x-10 items-center md:my-1 md:px-1 data'>
                  <label className={`md:text-start flex `}>Expense </label>
                  <select

                    className='text-left w-40 ml-1.5 rounded py-1 table-data-input border border-gray-400'
                    value={formExpenseType}
                    onChange={(e) => setFormExpenseType(e.target.value)}
                  >
                    <option className='text-gray-600' hidden>

                    </option>
                    {formExpenses.map((data) =>
                      <option value={data.value} key={data.show}>
                        {data.show}
                      </option>
                    )}
                  </select>
                </div>
              }


              {
                needExcelReport ?
                  <>
                    <span className="w-1/2">
                      <ReactHTMLTableToExcel
                        id="test-table-xls-button"
                        className="download-table-xls-button text-white bg-blue-400 p-2 text-xs rounded-xl"
                        table="itemTable"
                        filename="tablexls"
                        sheet="tablexls"
                        buttonText="GoToExcel"

                      >
                      </ReactHTMLTableToExcel>
                    </span>


                    <table id="itemTable" className="table-auto text-center">
                      <thead className="border-2 table-header">
                        <tr>
                          {tableHeaders.map((head, index) => (
                            <>
                              <th
                                key={index}
                                className="border-2 sticky top-0 stick-bg"
                              >
                                {head}
                              </th>

                            </>
                          ))}
                        </tr>

                      </thead>

                      {
                        projectExpenses ?
                          <tbody className="border-2">{console.log(data, "data")}
                            {data?.map((dataObj, index) => (
                              <>
                                <tr key={index} className="border-2 table-row" onClick={() => setId(dataObj.id)} >

                                  <td key={index} className="table-data" style={{ backgroundColor: data === "dataObj.color" ? eval("dataObj.pantone") : undefined }}>
                                    {dataObj?.expenseType}
                                  </td>
                                  <td key={index} className="table-data" style={{ backgroundColor: data === "dataObj.color" ? eval("dataObj.pantone") : undefined }}>
                                    {findTotalAmount(dataObj.id)}
                                  </td>

                                </tr>
                                <tr key={index} className="border-2 table-row" >

                                </tr>

                              </>
                            ))}
                            {
                              projectExpenses &&
                              <tr>
                                <td

                                  className="border-2 sticky top-0  bg-blue-400 font-bold"
                                >
                                  Total
                                </td>
                                <td className="border-2 sticky top-0  bg-blue-400 font-bold">
                                  {findTotalExpenses()}
                                </td>
                              </tr>

                            }
                          </tbody>
                          :
                          <tbody className="border-2">
                            {data?.map((dataObj, index) => (
                              <tr key={index} className="border-2 table-row" onClick={() => setId(dataObj.id)} >
                                {tableDataNames.map((data, index) => (
                                  <td key={index} className="table-data" style={{ backgroundColor: data === "dataObj.color" ? eval("dataObj.pantone") : undefined }}>
                                    {data === "dataObj?.userDate" ? moment.utc(dataObj?.userDate).format("DD-MM-YYYY") : eval(data)}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                      }

                    </table>
                  </>


                  :

                  <table className="table-auto text-center">
                    <thead className="border-2 table-header">
                      <tr>
                        {tableHeaders.map((head, index) => (
                          <>
                            <th
                              key={index}
                              className="border-2 sticky top-0 stick-bg"
                            >
                              {head}
                            </th>

                          </>
                        ))}
                      </tr>

                    </thead>

                    {
                      projectExpenses ?
                        <tbody className="border-2">
                          {data?.map((dataObj, index) => (
                            <>
                              <tr key={index} className="border-2 table-row" onClick={() => setId(dataObj.id)} >

                                <td key={index} className="table-data" style={{ backgroundColor: data === "dataObj.color" ? eval("dataObj.pantone") : undefined }}>
                                  {dataObj?.expenseType}
                                </td>
                                <td key={index} className="table-data" style={{ backgroundColor: data === "dataObj.color" ? eval("dataObj.pantone") : undefined }}>
                                  {findTotalAmount(dataObj.id)}
                                </td>

                              </tr>
                              <tr key={index} className="border-2 table-row" >

                              </tr>

                            </>
                          ))}
                          {
                            projectExpenses &&
                            <tr>
                              <td

                                className="border-2 sticky top-0  bg-blue-400 font-bold"
                              >
                                Total
                              </td>
                              <td className="border-2 sticky top-0  bg-blue-400 font-bold">
                                {findTotalExpenses()}
                              </td>
                            </tr>

                          }
                        </tbody>
                        :
                        <tbody className="border-2">
                          {data?.map((dataObj, index) => (
                            <tr key={index} className="border-2 table-row" onClick={() => setId(dataObj.id)} >
                              {tableDataNames.map((data, index) =>{
                                let cellBackground;
                               cellBackground =
                                pantoneColors?.[dataObj.pantone]?.hex ||
                                dataObj.pantone;
                             return (
                                <td key={index} className="table-data" style={{ backgroundColor: data === "dataObj.color" ? cellBackground : undefined }}>
                                  {data === "dataObj?.userDate" ? moment.utc(dataObj?.userDate).format("DD-MM-YYYY") : eval(data)}
                                </td>
                              )})}
                            </tr>
                          ))}
                        </tbody>
                    }

                  </table>
              }
            </div>
          )}
        </>
      )}
    </div>
  );
}
