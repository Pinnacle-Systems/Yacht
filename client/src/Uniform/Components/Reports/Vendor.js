import { DropdownWithSearch, Modal } from "../../../Inputs"
import { useEffect, useState } from "react";
import { saveAs } from 'file-saver';
import * as XLSX from "xlsx"
import { toast } from "react-toastify";
import { useGetPercentageQuery } from "../../../redux/uniformService/Percentage";
import { getCommonParams, getDateFromDateTime, renameFile } from "../../../Utils/helper";
import FormHeader from "../../../Basic/components/FormHeader";
import FormHeaderNew from "../../../Basic/components/FormHeaderNew";
import { useAddOrderMutation, useAttachOrderMutation, useGetOrderByIdQuery, useUpdateOrderMutation, useUploadMutation } from "../../../redux/uniformService/OrderService";
import MailForm from "../Email";
import ArtDesignReport from "../ArtDesign/ArtDesignReport";


export default function VendorForm({ singleData, setForm, poItems, setPoItems,
  setActive, id, setCurrentId, form, active, setEmailId, userRole }) {

  const [attachments, setAttachments] = useState([]);

  const [formReport, setFormReport] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const { branchId, finYearId, userId } = getCommonParams()


  const [addData] = useAddOrderMutation();
  const [updateData] = useUpdateOrderMutation();

  const [upload] = useUploadMutation();




  let orderData = singleData?.data;
  const model = "Po Number";
  console.log(orderData, "data")
  const data = {
    attachments, isAttachments: true
  };


  useEffect(() => {
    if (poItems?.length >= 10) return
    setPoItems(prev => {
      let newArray = Array.from({ length: 10 - prev.length }, () => {
        return { department: "", ProcessMasterId: "", itemId: "", stockQty: "0", orderQty: "", price: "0.00", amount: "0.000", pcsQty: "0", sacCode: "0.00", tax: 0, sizeType: "Fixed", particular: '' }
      })
      return [...prev, ...newArray]
    }
    )
  }, [setPoItems, poItems])

  useEffect(() => {
    if (!id) return
    setAttachments(singleData?.data?.attachments)
    setCurrentId(singleData?.data?.id)
  }, [id, singleData])





  console.log(attachments, "attach")

  const handleSubmitCustom = async (callback, data, text) => {
    try {
      const formData = new FormData();
      for (let key in data) {
        if (key === 'attachments') {
          formData.append(key, JSON.stringify(data[key].map(i => ({ ...i, filePath: (i.filePath instanceof File) ? i.filePath.name : i.filePath }))));
          data[key].forEach(option => {
            if (option?.filePath instanceof File) {
              formData.append('file', option.filePath);
            }
          });
        } else {
          formData.append(key, data[key]);
        }
      }

      let returnData;
      if (text === "Updated") {
        returnData = await callback({ id, body: formData }).unwrap();
      } else {
        returnData = await callback(formData).unwrap();
      }
      if (returnData.statusCode === 0) {

        // toast.success(text + "Successfully");

        setActive("Mail")
      } else {
        toast.error(returnData?.message);
      }

    } catch (error) {
      console.log("handle", error);
    }
  };


  const saveData = () => {

    // if (!window.confirm("Are you sure save the details ...?")) {
    //   return;
    // }
    if (id) {
      handleSubmitCustom(updateData, data, "Updated");
    } else {
      handleSubmitCustom(addData, data, "Added");
    }
  };

  const exportAndUploadExcel = async (data, poItemsData) => {
    const filterdPoItems = poItemsData?.filter(obj => obj?.orderQty != null && obj?.orderQty.toString().trim() !== "")
    try {
      const combinedData = (filterdPoItems || [])?.map((item, index) => ({
        SrNo: index + 1,
        PONumber: data.docId,
        OrderDate: getDateFromDateTime(data.orderdate),
        Department: item.department,
        Class: item.class,
        ItemCode: item.itemCode,
        BarCode: item.barCode,
        SeasonSupplierCode: item.supplierCode,
        StyleCode: item.styleCode,
        Size: item.size,
        sizeDescription: item.sizeDesc,
        Color: item.color,
        Mrp: item.mrp,
        Product: item.product,
        PoQty: item.orderQty,
        excessPercentage: item.excessQty,
        OrderQty: Math.round(item.qty)
      }));

      const worksheet = XLSX.utils.json_to_sheet(combinedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const excelBlob = new Blob(
        [excelBuffer],
        { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }
      );

      const fileName = `Order_${Date.now()}.xlsx`;
      const formData = new FormData();
      formData.append('file', excelBlob, fileName);
      formData.append('id', id);
      const response = await upload({ body: formData, id }).unwrap();
      setEmailId(response?.data?.id)




    } catch (error) {
      console.error("Error during Export and Upload:", error);
      toast.error("Something went wrong!", {
        position: "top-right",
        autoClose: 100,
        hideProgressBar: true,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",

      });
    }
  };








  return (
    <>

      <Modal isOpen={formReport}
        onClose={() => setFormReport(false)} widthClass={"px-2 h-[90%] w-[70%]"}
      >
        <ArtDesignReport
          userRole={userRole}
          setFormReport={setFormReport}
          tableWidth="100%"
          formReport={formReport}
          setAttachments={setAttachments}
          attachments={attachments}
          searchValue={searchValue}
          setSearchValue={setSearchValue}
        />
      </Modal>
      <div className="flex flex-col bg-[#F1F1F0]">
        <div
          className="flex m-2 items-center justify-between p-2 md:px-4"
          style={{ backgroundColor: "white" }}
        >
          <div className="text-sm font-semibold flex items-center gap-2">
            <span className="text-gray-600">{model}:</span>
            <span className="text-white bg-[#303AB2] px-2 py-0.5 rounded-md font-bold shadow-md">
              {orderData?.docId}
            </span>
          </div>


          <div className="flex gap-2"> {active === "order" && form === true && (
            <div className="flex items-center space-x-1">

              <button
                onClick={() => {
                  setForm(false);
                  setActive("order");
                }}
                className="group flex items-center text-[#E4002B] hover:text-white border border-[#E4002B] hover:bg-[#E4002B] transition-all duration-200 ease-in-out px-3 py-1 rounded-full shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#E4002B] focus:ring-offset-2"
              >
                <svg
                  className="w-4 h-4 md:w-5 md:h-5 transition-transform duration-200 group-hover:-translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                <span className="ml-2 text-xs font-medium tracking-wide uppercase">
                  Back
                </span>
              </button>


          </div>
        )}
        {(orderData?.isSave &&  !orderData?.poSentForApproval) && 
          <button
            onClick={() => {
              saveData();
              exportAndUploadExcel(orderData, poItems);

            }}
            className="group flex items-center bg-white text-[#303AB2] border border-[#303AB2] hover:bg-[#303AB2] hover:text-white transition-all duration-200 ease-in-out px-3 py-1 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-[#303AB2] focus:ring-offset-1"
          >
            <svg
              className="w-4 h-4 transition-transform duration-200 group-hover:rotate-12"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 4v16h16V4H4zm4 8l4 4 4-4"
              />
            </svg>
            <span className="ml-1.5 text-xs font-medium">SEND MAIL</span>
          </button>
          }
          </div>
      </div>
      <div className="flex flex-col w-full bg-white  h-full overflow-auto p-1">


          <div
            className="flex flex-col w-full p-1  overflow-auto justify-between item-end bg-white gap-4"
            style={{ backgroundColor: "#F1F1F0" }}
          >
            <div className="flex flex-wrap gap-1 border bg-white  rounded item-center p-2"  >
              <div className="flex flex-col ">
                <label className="text-xs font-semibold">Customer</label>
                <input
                  type="text"
                  className="border border-gray-300 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={"MAX"}
                  disabled={true}

                />
              </div>


              <div className="col-span-2 flex flex-col">
                <label className="text-xs font-semibold ">Manufacture</label>
                <input
                  type="text"
                  className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400 w-80"
                  value={orderData?.Manufacture?.name}
                  disabled={true}

                />

              </div>
              <div className="flex flex-col ">
                <label className="text-xs font-semibold ">Po Date</label>
                <input
                  type="text"
                  className="border border-gray-300 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={getDateFromDateTime(orderData?.orderdate)}
                  disabled={true}


                />
              </div>



              <div className="flex flex-col ">
                <label className="text-xs font-semibold ">Delivery Date</label>
                <input
                  type="text"
                  className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={getDateFromDateTime(data?.deliverydate)}
                  disabled={true}
                />
              </div>

              {/* <div className="w-18 h-5 flex flex-col px-2">
                              <label className="text-xs font-semibold  ">
                              Approval status
                            </label>
                            <select 
                            className="border border-gray-300 text-xs px-2 py-1 rounded-lg"
                            value={isManufactuerPoStatus}
                              onChange={(e) => setIsManufactuerPoStatus(e.target.value)}
                            >
                              <option value="">Select Status</option>
                              <option value="Approve">Approve</option>
                              <option value="Cancel">Cancel</option>
            
                            </select>
                      </div>
                      <div className="w-18  flex flex-col "> 
                        <label className="text-xs font-semibold  ">
                      Reason
                    </label>
                      <textarea 
                           className="border border-gray-300 text-xs px-2 py-1 col rounded-lg"
                            value={reason}
                              onChange={(e) => setReason(e.target.value)}
                              cols={18} rows={1}
                      ></textarea>
                      </div> */}

{(orderData?.isSave   &&  !orderData?.poSentForApproval )  && 
          <div className="flex pt-4">
            <button
              className="relative  h-6 px-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white
              rounded shadow-lg hover:shadow-xl hover:scale-105 transform transition-all duration-300 ease-in-out overflow-hidden"
              onClick={() => setFormReport(true)}
            >
              <span className="absolute  bg-white opacity-10 "></span>
              <span className="relative z-10 text-[12px]"> Attach Art Design</span>
            </button>
          </div>
 }
        </div >


          <div className="w-full my-2 h-[65vh] overflow-y-auto overflow-x-auto ">
            <table className="table-fixed w-full text-xs rounded-lg border border-gray-300">
              <thead className="bg-white text-gray-800 border-b border-gray-300">
                <tr>
                  <th className="text-[12px] font-semibold p-1 border border-gray-300 w-[50px]">S No</th>
                  <th className="text-[12px] font-semibold p-1 border border-gray-300 w-[120px]">Department</th>
                  <th className="text-[12px] font-semibold p-1 border border-gray-300 w-[150px]">Class-SubClass</th>
                  <th className="text-[12px] font-semibold p-1 border border-gray-300 w-[120px]">ItemCode</th>
                  <th className="text-[12px] font-semibold p-1 border border-gray-300 w-[120px]">BarCode</th>
                  <th className="text-[12px] font-semibold p-1 border border-gray-300 w-[120px]">SeasonSupplierCode</th>
                  <th className="text-[12px] font-semibold p-1 border border-gray-300 w-[120px]">StyleCodeGroup</th>
                  <th className="text-[12px] font-semibold p-1 border border-gray-300 w-[150px]">SizeDesc</th>
                  <th className="text-[12px] font-semibold p-1 border border-gray-300 w-[50px]">Size</th>
                  <th className="text-[12px] font-semibold p-1 border border-gray-300 w-[90px]">Color</th>
                  <th className="text-[12px] font-semibold p-1 border border-gray-300 w-[50px]">MRP</th>
                  <th className="text-[12px] font-semibold p-1 border border-gray-300 w-[50px]">Po Qty</th>
                  {orderData?.deliverydate && (
                    <>
                      <th className="text-[12px] font-semibold p-1 border border-gray-300 w-[50px]">Excess %</th>
                      <th className="text-[12px] font-semibold p-1 border border-gray-300 w-[50px]">Order Qty</th>
                    </>
                  )}
                </tr>
              </thead>

              <tbody>
                {(poItems || []).map((item, index) => (
                  <tr
                    key={index}
                    className={`${index % 2 === 0 ? "bg-gray-100" : "bg-white"
                      } hover:bg-gray-200`}
                  >
                    <td className="border border-gray-300 text-center p-2 text-[11px]">{index + 1}</td>
                    <td className="border border-gray-300 text-left p-2 text-[11px]">{item?.department}</td>
                    <td className="border border-gray-300 text-left p-2 text-[11px]">{item?.class}</td>
                    <td className="border border-gray-300 text-left p-2 text-[11px]">{item?.itemCode}</td>
                    <td className="border border-gray-300 text-left p-2 text-[11px]">{item?.barCode}</td>
                    <td className="border border-gray-300 text-left p-2 text-[11px]">{item?.supplierCode}</td>
                    <td className="border border-gray-300 text-left p-2 text-[11px]">{item?.styleCode}</td>
                    <td className="border border-gray-300 text-left p-2 text-[11px]">{item?.sizeDesc}</td>
                    <td className="border border-gray-300 text-center p-2 text-[11px]">{item?.size}</td>
                    <td className="border border-gray-300 text-center p-2 text-[11px]">{item?.color}</td>
                    <td className="border border-gray-300 text-right p-2 text-[11px]">{item?.mrp}</td>
                    <td className="border border-gray-300 text-right p-2 text-[11px]">
                      {Math.round(item?.orderQty) || ""}
                    </td>
                    {orderData?.deliverydate && (
                      <>
                        <td className="border border-gray-300 text-right p-1 text-[11px]">
                          {item?.excessQty || ""}
                        </td>
                        <td className="border border-gray-300 text-right p-1 text-[11px]">
                          {Math.round(item?.qty) || ""}
                        </td>
                      </>
                    )}
                  </tr>
                ))}

                {/* Total Row */}
                <tr className="bg-white font-bold text-gray-800">
                  <td colSpan={10} className="border border-gray-300 p-2 text-left">Total</td>
                  <td className="border border-gray-300 p-2 text-right"></td>
                  <td className="border border-gray-300 p-2 text-right text-sm font-extrabold text-[#303AB2]">
                    {poItems?.reduce((a, c) => a + Math.round(c.orderQty || 0), 0) || ""}
                  </td>
                  {orderData?.deliverydate && (
                    <>
                      <td className="border border-gray-300 p-2 text-right"></td>
                      <td className="border border-gray-300 p-2 text-right text-sm font-extrabold text-[#303AB2]">
                        {poItems?.reduce((a, c) => a + Math.round(c.qty || 0), 0) || ""}
                      </td>
                    </>
                  )}
                </tr>
              </tbody>
            </table>
          </div>










            {/* 
          <button
            onClick={() => {
              saveData();
              exportAndUploadExcel(orderData, poItems);

            }}
            className="group flex items-center justify-center text-[#303AB2] hover:text-white border border-[#303AB2] hover:bg-[#303AB2] transition-all duration-200 ease-in-out px-4 py-1.5 rounded-full shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#303AB2] focus:ring-offset-2"
          >
            <svg
              className="w-4 h-4 transition-transform duration-200 group-hover:rotate-12"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v16h16V4H4zm4 8l4 4 4-4" />
            </svg>
            <span className="ml-2 text-xs font-medium tracking-wide uppercase">
              SEND MAIL
            </span>
          </button>
           */}
       

        </div>
      </div>
       </div>
    </>
  )
}