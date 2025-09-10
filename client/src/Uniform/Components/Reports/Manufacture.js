import {
  DateInput,
  DateInputNew,
  DropdownWithSearch,
  Modal,
} from "../../../Inputs";
import { useEffect, useState } from "react";

import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";

import { useGetPercentageQuery } from "../../../redux/uniformService/Percentage";
import { useGetPartyQuery } from "../../../redux/services/PartyMasterService";
import { getCommonParams, getDateFromDateTime } from "../../../Utils/helper";
import FormHeaderNew from "../../../Basic/components/FormHeaderNew";
import { useUploadMutation } from "../../../redux/uniformService/OrderService";
import secureLocalStorage from "react-secure-storage";
import ArtDesignReport from "../ArtDesign/ArtDesignReport";
import Swal from "sweetalert2";

export default function Manufactureform({
  singleData,
  setForm,
  vendor,
  setVendor,
  poItems,
  setPoItems,
  setActive,
  saveData,
  id,
  setEmailId,
  setCurrentId,
  deliveryDate,
  setDeliveryDate,
  form,
  active,
  isApproved,
  setIsApproved,
  mailConvert,
  userRole,
  PoStatus, setPoStatus, setReason, reason, refetch, setId
}) {

  console.log(PoStatus, "PoStatus")

  const [formReport, setFormReport] = useState(false);

  const [upload] = useUploadMutation();

  const { branchId, finYearId, userId } = getCommonParams();

  const { data: Partydata } = useGetPartyQuery({
    params: { branchId, finYearId, userId },
  });

  const { data: percentageData, isPercentageLoading, isPercentageFetching } = useGetPercentageQuery({ params: { branchId, finYearId, userId } });

  let partyOptions = Partydata?.data?.filter(
    (item) => item?.partyType === "VENDOR"
  );
  let data = singleData?.data;
  const isMailForm = true;
  const model = "Po Number";
  const isManufacture = true;
  console.log(data, "data");

  useEffect(() => {
    if (!id) return;
    setCurrentId(singleData?.data?.id);
  }, [id, singleData]);

  const exportAndUploadExcel = async (data, poItemsData) => {
    // console.log(poItemsData?.filter(obj => obj?.orderQty != null && obj?.orderQty.toString().trim() !== ""),"Poitems")
    const filterdPoItems = poItemsData?.filter(
      (obj) => obj?.orderQty != null && obj?.orderQty.toString().trim() !== ""
    );
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
        OrderQty: Math.round(item.qty),
      }));

      const worksheet = XLSX.utils.json_to_sheet(combinedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });
      const excelBlob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const fileName = `Order_${Date.now()}.xlsx`;
      const formData = new FormData();
      formData.append("file", excelBlob, fileName);
      formData.append("id", id);
      const response = await upload({ body: formData, id }).unwrap();
      setEmailId(response?.data?.id);
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


  const handleQtyChange = (field, index, value) => {
    setPoItems((prev) => {
      let newItems = structuredClone(prev);
      newItems[index][field] = value;
      return newItems;
    });
  };

  const handleExcessQtyBlur = (index, value, orderQty, inputRef) => {
    const allowedPercentage = parseInt(percentageData?.data?.find(i => i.active)?.qty || 0);
    const enteredPercentage = parseInt(value);

    setPoItems((prev) => {
      const newItems = structuredClone(prev);

      if (enteredPercentage > allowedPercentage) {
        Swal.fire({
          icon: "info",
          title: `Excess Qty must be up to ${allowedPercentage}`,
          html: `
          <div class="payment-box">
            <div class="payment-icon">
              <i class="fas fa-paper-plane"></i>
            </div>
            <div class="payment-text">Resetting to allowed value</div>
          </div>
        `,
          timer: 1500,
          timerProgressBar: true,
          customClass: {
            popup: "payment-swal-popup",
          },
          didOpen: () => {
            Swal.showLoading();
          },
        }).then(() => {
          if (inputRef?.current) {
            inputRef.current.focus();
            inputRef.current.select();
          }
        });

        // Reset the value to the max allowed percentage
        newItems[index]['excessQty'] = allowedPercentage;
        const adjustedQty = Math.round(orderQty + (orderQty * allowedPercentage) / 100);
        newItems[index]['qty'] = adjustedQty;
      } else {
        // If within limit, update as usual
        newItems[index]['excessQty'] = enteredPercentage;
        const adjustedQty = Math.round(orderQty + (orderQty * enteredPercentage) / 100);
        newItems[index]['qty'] = adjustedQty;
      }

      return newItems;
    });
  };



  useEffect(() => {
    if (!id) return;
    setAttachments(singleData?.data?.attachments);
    setCurrentId(singleData?.data?.id);
  }, [id, singleData]);
  useEffect(() => {
    if (poItems?.length >= 10) return;
    setPoItems((prev) => {
      let newArray = Array.from({ length: 10 - prev.length }, () => {
        return {
          department: "",
          ProcessMasterId: "",
          itemId: "",
          stockQty: "0",
          orderQty: "",
          price: "0.00",
          amount: "0.000",
          pcsQty: "0",
          sacCode: "0.00",
          tax: 0,
          sizeType: "Fixed",
          particular: "",
        };
      });
      return [...prev, ...newArray];
    });
  }, [setPoItems, poItems]);
  const params = {
    companyId: secureLocalStorage.getItem(
      sessionStorage.getItem("sessionId") + "userCompanyId"
    ),
    branchId: secureLocalStorage.getItem(
      sessionStorage.getItem("sessionId") + "currentBranchId"
    ),
    userId: secureLocalStorage.getItem(
      sessionStorage.getItem("sessionId") + "userId"
    ),
    finYearId: secureLocalStorage.getItem(
      sessionStorage.getItem("sessionId") + "currentFinYear"
    ),
    approverData: true,
  };
  const [attachments, setAttachments] = useState([]);
  const { data: allData } = useGetPercentageQuery({ params });
  console.log(
    allData?.data[0]?.selectedApprover,
    "allData?.data[0]?.selectedApprover"
  );
  return (
    <>
      <div className="flex items-center   md:flex-row ml-1 " style={{ backgroundColor: 'white' }}>
        <Modal
          isOpen={formReport}
          onClose={() => setFormReport(false)}
          widthClass={"px-2 h-[90%] w-[70%]"}
        >
          <ArtDesignReport
            tableWidth="100%"
            userRole={userRole}
            setAttachments={setAttachments}
            attachments={attachments}

          />
        </Modal>
        <Modal
          isOpen={formReport}
          onClose={() => setFormReport(false)}
          widthClass={"px-2 h-[90%] w-[70%]"}
        >
          <ArtDesignReport
            tableWidth="100%"
            userRole={userRole}
            setAttachments={setAttachments}
            attachments={attachments}

          />
        </Modal>
        <div
          className="flex m-2 items-center justify-between w-full p-2 md:px-4"
          style={{ backgroundColor: "white" }}
        >
          <div className="text-sm font-semibold flex items-center gap-2">
            <span className="text-gray-600">{model}:</span>
            <span className="text-white bg-[#303AB2] px-2 py-0.5 rounded-md font-bold shadow-md">
              {data?.docId}
            </span>
          </div>

          <div className=" flex  justify-end gap-3">
            {active === "order" && form === true && (
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => {
                    setForm(false);
                    setActive("order");
                    setId(null)
                  }}
                  className="group flex items-center bg-white text-[#E4002B] border border-[#E4002B] hover:bg-[#E4002B] hover:text-white transition-all duration-200 ease-in-out px-3 py-1 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-[#E4002B] focus:ring-offset-1"
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

            <button
              onClick={() => {
                saveData(!isMailForm, isManufacture);

              }}
              disabled={PoStatus === "Cancel" && data?.userRoleId}
              title={PoStatus === "Cancel" && data?.userRoleId ? "The Po Was Cancel" : ''}
              className="group flex items-center justify-center text-[#303AB2] hover:text-white border border-[#303AB2] hover:bg-[#303AB2] transition-all duration-200 ease-in-out px-4 py-1.5 rounded-full shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#303AB2] focus:ring-offset-2"
            >
              <svg
                className="w-4 h-4 transition-transform duration-200 group-hover:-translate-y-0.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span className="ml-2 text-xs font-medium tracking-wide uppercase">
                Save
              </span>
            </button>

            {(allData?.data[0]?.selectedApprover === "MANUFACTURE" ||
              !data?.isSave) && (
                <button
                  onClick={() => {
                    saveData(isMailForm, isManufacture);
                    exportAndUploadExcel(data, poItems);
                  }}
                  title={PoStatus === "Cancel" && data?.userRoleId ? "The Po Was Cancel" : ''}

                  disabled={PoStatus === "Cancel" && data?.userRoleId}



                  className="group flex items-center justify-center text-[#303AB2] hover:text-white border border-[#303AB2] hover:bg-[#303AB2] transition-all duration-200 ease-in-out px-4 py-1.5 rounded-full shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#303AB2] focus:ring-offset-2"
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
                  <span className="ml-2 text-xs font-medium tracking-wide uppercase">
                    Save & Send
                  </span>
                </button>
              )}
          </div>
        </div>
      </div>
      <div
        className="flex flex-wrap  border  rounded item-center p-1"
        style={{ backgroundColor: "#F1F1F0" }}
      >
        <div className="flex flex-wrap gap-1 border  rounded item-center p-1 w-full" style={{ backgroundColor: "white" }}>

          <div className="flex flex-col mr-1">
            <label className="text-xs font-semibold">Customer</label>
            <input
              type="text"
              className="border border-gray-300 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={"MAX"}
              disabled={true}
            />
          </div>

          <div className="col-span-2 flex flex-col mr-1">
            <label className="text-xs font-semibold ">Manufacture </label>
            <input
              type="text"
              className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400 w-80"
              value={data?.Manufacture?.name}
              disabled={true}
            />
          </div>
          <div className="flex flex-col w-24 mr-1 ">
            <label className="text-xs font-semibold ">Po Date</label>
            <input
              type="text"
              className="border border-gray-300 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={getDateFromDateTime(data?.orderdate)}
              disabled={true}
            />
          </div>
          <div className="flex flex-col w-72 ">
            <label className="text-xs font-semibold ">
              Tag vendor <span className="text-red-500">*</span>
            </label>
            <DropdownWithSearch
              className={"w-72 text-xs border-gray-300"}
              value={vendor}
              setValue={setVendor}
              options={partyOptions}
              optionName={"Tag vendor From Party Master"}
              masterName={"PARTY MASTER"}
              readOnly={true}
            />
          </div>

          {/* <div className="flex flex-col w-72 ">
            <label className="text-xs font-semibold ">
              Tag vendor <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="border border-gray-300 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={data?.Vendor?.name}
              disabled={true}
            />
          </div> */}



          <div className=''>

            <DateInputNew name={"Delivery Date"} value={deliveryDate} setValue={setDeliveryDate} required={true} type={"date"}
              disabled={PoStatus === "Cancel" && data?.userRoleId} />
          </div>
          <div className="w-18 h-5 flex flex-col px-2">
            <label className="text-xs font-semibold  ">
              Order status
            </label>
            <select
              className="border border-gray-300 text-xs px-2 py-1 rounded-lg"
              value={PoStatus}
              onChange={(e) => setPoStatus(e.target.value)}
              disabled={PoStatus === "Cancel" && data?.userRoleId}
            >
              <option value="">Select Status</option>
              <option value="Accept">Accept</option>
              <option value="Cancel">Cancel</option>

            </select>
          </div>
          {(PoStatus === "Accept" || PoStatus === "Cancel") &&
            <div className="w-18  flex flex-col ">
              <label className="text-xs font-semibold  ">
                Reason
              </label>
              <textarea
                className="border border-gray-300 text-xs px-2 py-1 col rounded-lg"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                cols={18} rows={1}
                disabled={PoStatus === "Cancel" && data?.userRoleId}

              ></textarea>
            </div>
          }
          {allData?.data[0]?.selectedApprover === "MANUFACTURE" ? <>
            {singleData?.data?.poSentForApproval && (
              <div className=" w-18 h-2 flex flex-col px-2">
                <label className="text-xs font-semibold  pb-1">
                  Approval status
                </label>
                <select
                  className={`h-6 border rounded text-xs 
             ${isApproved === "Approve"
                      ? "border-green-500 text-white-600  text-green-500"
                      : ""
                    }
              ${isApproved === "Reject" ? "border-red-500 text-red-600" : ""}
              ${isApproved === "hold" ? "border-yellow-500 text-yellow-600" : ""
                    }
              ${isApproved === "" ? "border-gray-300 text-gray-500" : ""}
                          `}
                  value={isApproved}
                  onChange={(e) => setIsApproved(e.target.value)}
                  disabled={!data?.deliverydate || !data?.vendorId}
                >
                  <option value="">Select status</option>
                  <option value="Approve">Approve</option>
                  <option value="Reject">Reject</option>
                  <option value="Hold">Hold</option>
                </select>
              </div>
            )}

            {singleData?.data?.poSentForApproval && (
              <div className="flex pt-3">
                <button
                  className="relative h-8 px-4 py-1 bg-blue-600 text-white font-medium 
      rounded-full shadow-sm hover:bg-blue-700 hover:shadow-md transform transition-all 
      duration-300 ease-in-out focus:outline-none focus:ring-2 
      focus:ring-blue-400 focus:ring-offset-2"
                  onClick={() => setFormReport(true)}
                >
                  <span className="text-[13px]">View Art Design</span>
                </button>
              </div>
            )}
          </>
            : ""}
        </div>

        <div className="w-full h-[74vh] overflow-y-auto overflow-x-auto ">
          <table className="table-fixed w-full text-xs rounded-lg border border-gray-300">
            <thead className="bg-white text-gray-800 border-b border-gray-300">
              <tr>
                <th className="text-[12px] font-semibold p-1 border border-gray-300 w-[50px]">
                  S No
                </th>
                <th className="text-[12px] font-semibold p-1 border border-gray-300 w-[120px]">
                  Department
                </th>
                <th className="text-[12px] font-semibold p-1 border border-gray-300 w-[150px]">
                  Class-SubClass
                </th>
                <th className="text-[12px] font-semibold p-1 border border-gray-300 w-[120px]">
                  ItemCode
                </th>
                <th className="text-[12px] font-semibold p-1 border border-gray-300 w-[120px]">
                  BarCode
                </th>
                <th className="text-[12px] font-semibold p-1 border border-gray-300 w-[120px]">
                  SeasonSupplierCode
                </th>
                <th className="text-[12px] font-semibold p-1 border border-gray-300 w-[120px]">
                  StyleCodeGroup
                </th>
                <th className="text-[12px] font-semibold p-1 border border-gray-300 w-[150px]">
                  SizeDesc
                </th>
                <th className="text-[12px] font-semibold p-1 border border-gray-300 w-[50px]">
                  Size
                </th>
                <th className="text-[12px] font-semibold p-1 border border-gray-300 w-[90px]">
                  Color
                </th>
                <th className="text-[12px] font-semibold p-1 border border-gray-300 w-[50px]">
                  MRP
                </th>
                <th className="text-[12px] font-semibold p-1 border border-gray-300 w-[50px]">
                  Po Qty
                </th>
                <th className="text-[12px] font-semibold p-1 border border-gray-300 w-[50px]">
                  Excess %
                </th>
                <th className="text-[12px] font-semibold p-1 border border-gray-300 w-[50px]">
                  Order Qty
                </th>
              </tr>
            </thead>

            <tbody>
              {(poItems || []).map((item, index) => (
                <tr
                  key={index}
                  className={`${index % 2 === 0 ? "bg-gray-100" : "bg-white"
                    } hover:bg-gray-200`}
                >
                  <td className="border border-gray-300 text-center p-1 text-[11px]">
                    {index + 1}
                  </td>
                  <td className="border border-gray-300 text-left p-1 text-[11px]">
                    {item?.department}
                  </td>
                  <td className="border border-gray-300 text-left p-1 text-[11px]">
                    {item?.class}
                  </td>
                  <td className="border border-gray-300 text-left p-1 text-[11px]">
                    {item?.itemCode}
                  </td>
                  <td className="border border-gray-300 text-left p-1 text-[11px]">
                    {item?.barCode}
                  </td>
                  <td className="border border-gray-300 text-left p-1 text-[11px]">
                    {item?.supplierCode}
                  </td>
                  <td className="border border-gray-300 text-left p-1 text-[11px]">
                    {item?.styleCode}
                  </td>
                  <td className="border border-gray-300 text-left p-1 text-[11px]">
                    {item?.sizeDesc}
                  </td>
                  <td className="border border-gray-300 text-center p-1 text-[11px]">
                    {item?.size}
                  </td>
                  <td className="border border-gray-300 text-center p-1 text-[11px]">
                    {item?.color}
                  </td>
                  <td className="border border-gray-300 text-right p-1 text-[11px]">
                    {item?.mrp}
                  </td>
                  <td className="border border-gray-300 text-right p-1 text-[11px]">
                    {item?.orderQty || ""}
                  </td>
                  <td className="border border-gray-300 p-1">
                    <input
                      type="number"
                      value={item?.excessQty}
                      onChange={(e) =>
                        handleQtyChange(
                          "excessQty",
                          index,
                          e.target.value,
                          item?.orderQty
                        )
                      }
                      className="w-full p-1 text-right text-[11px] focus:ring-2 focus:ring-blue-400 focus:outline-none"
                      onBlur={(e) =>
                        handleExcessQtyBlur(index, e.target.value, poItems[index].orderQty,)
                      }
                      disabled={data?.isSave || item?.orderQty == ""}
                    />
                  </td>
                  <td className="border border-gray-300 text-right p-1 text-[11px]">
                    {Math.round(item?.qty) || ""}
                  </td>
                </tr>
              ))}

              {/* Total Row */}
              <tr className="bg-white font-bold text-gray-800">
                <td
                  colSpan={10}
                  className="border border-gray-300 p-2 text-left"
                >
                  Total
                </td>
                <td className="border border-gray-300 p-2 text-right"></td>
                <td className="border border-gray-300 p-2 text-right text-sm font-extrabold text-[#303AB2]">
                  {poItems?.reduce(
                    (a, c) => a + Math.round(c.orderQty || 0),
                    0
                  ) || ""}
                </td>
                <td className="border border-gray-300 p-2 text-right"></td>
                <td className="border border-gray-300 p-2 text-right text-sm font-extrabold text-[#303AB2]">
                  {poItems?.reduce((a, c) => a + Math.round(c.qty || 0), 0) ||
                    ""}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </>
  );
}
