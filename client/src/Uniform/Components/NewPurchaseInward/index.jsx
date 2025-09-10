import { useCallback, useEffect, useState } from "react";
import { FaFileAlt, FaPlus, FaSlideshare, FaWhatsapp } from "react-icons/fa";
import { ReusableInput } from "../NewOrder/CommonInput";
import {
  useGetPoByIdQuery,
  useGetPoQuery,
} from "../../../redux/uniformService/PoServices";
import { findFromList, getCommonParams } from "../../../Utils/helper";
import Grid from "./Grid";
import CommonTable from "../common/CommonTable";
import {
  useAddPurchaseInwardEntryMutation,
  useDeletePurchaseInwardEntryMutation,
  useGetPurchaseInwardEntryByIdQuery,
  useGetPurchaseInwardEntryQuery,
  useUpdatePurchaseInwardEntryMutation,
} from "../../../redux/uniformService/PurchaseInwardEntry";
import { FiPrinter, FiSave, FiShare2 } from "react-icons/fi";
import { HiOutlineRefresh } from "react-icons/hi";
import Swal from "sweetalert2";
import moment from "moment";

const NewPurchaseInward = () => {
  const [report, setReport] = useState(false);

  const [id, setId] = useState("");
  const [poId, setPoId] = useState("");
  const [orderId, setOrderId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [actualQuantity, setActualQuantity] = useState("");
  const { branchId, companyId, finYearId } = getCommonParams();
  const [poDetails, setPoDetails] = useState([]);
  const [readOnly, setReadOnly] = useState(false);
  const [isPurchased, setIsPurchased] = useState(false);
  const today = new Date();
  const [date, setDate] = useState(moment.utc(today).format("YYYY-MM-DD"));

  const params = {
    branchId,
    companyId,
    finYearId,
  };

  const [addData] = useAddPurchaseInwardEntryMutation();
  const [updateData] = useUpdatePurchaseInwardEntryMutation();
  const [removeData] = useDeletePurchaseInwardEntryMutation();

  const { data: allData } = useGetPurchaseInwardEntryQuery({ params });
  const { data: singleData } = useGetPurchaseInwardEntryByIdQuery(id, {
    skip: !id,
  });
  console.log("Inward ID:", id);
  console.log("singleData", singleData);

  const { data: poData } = useGetPoQuery({ params });
  const { data: singlePodata } = useGetPoByIdQuery(poId, { skip: !poId });

  const syncPoWithDb = useCallback((data) => {
    console.log("syncpowithdb executes");
    if (!data || !data.data) return;
    const savedData = data?.data;
    setOrderId(savedData?.orderId);

    const mappedPoDetails = savedData?.poGrid?.map((item) => ({
      ...item,
      fabCode: item?.styleSheet?.fabCode,
      styleSheetId: item?.styleSheet?.id || null,
      purchaseInwardEntrySubGrid: (item?.poSubGrid || [])?.map((sub) => ({
        ...sub,
        colorId: sub?.color?.id || "",
        colorName: sub?.color?.name || "",
        uomId: sub?.UnitOfMeasurement?.id || "",
        uomName: sub?.UnitOfMeasurement?.name || "",
        actualQuantity: 0,
      })),
    }));

    setPoDetails(mappedPoDetails);
  }, []);

  console.log(poDetails, "podetails");

  useEffect(() => {
    if (!id && poId && singlePodata) {
      syncPoWithDb(singlePodata);
    }
  }, [singlePodata, syncPoWithDb]);

  const syncInwardDataWithDb = useCallback((data) => {
    if (!data?.data) return;
    const savedData = data.data;
    console.log("syncInwardDataWithDb executes");

    if (savedData?.poId) {
      setPoId(savedData?.poId);
    }
    setOrderId(savedData?.orderId);
    if (savedData?.date) {
      const formattedDate = new Date(savedData.date)
        .toISOString()
        .split("T")[0];
      setDate(formattedDate);
    }
    setIsPurchased(savedData?.isPurchased ?? false);

    const mappedInwardDetails = savedData?.purchaseInwardEntryGrid?.map(
      (item) => ({
        ...item,
        fabCode: item?.styleSheet?.fabCode,
        styleSheetId: item?.styleSheet?.id || null,
        purchaseInwardEntrySubGrid: (
          item?.purchaseInwardEntrySubGrid || []
        )?.map((sub) => ({
          ...sub,
          colorId: sub?.color?.id || "",
          colorName: sub?.color?.name || "",
          uomId: sub?.UnitOfMeasurement?.id || "",
          uomName: sub?.UnitOfMeasurement?.name || "",
          actualQuantity: sub?.actualQuantity || 0,
        })),
      })
    );
    setPoDetails(mappedInwardDetails);
  }, []);

  useEffect(() => {
    if (id && singleData) {
      syncInwardDataWithDb(singleData);
    }
  }, [id, singleData, syncInwardDataWithDb]);

  console.log("data", allData);

  const handleChange = (val, index, subIndex, field) => {
    setPoDetails((poDetails) => {
      const prev = structuredClone(poDetails);

      let purchaseInwardEntrySubGrid = "purchaseInwardEntrySubGrid"

      if (!Array.isArray(prev[index].purchaseInwardEntrySubGrid)) {
        prev[index].purchaseInwardEntrySubGrid = [];
      }

      if (field === "actualQuantity") {
        prev[index][purchaseInwardEntrySubGrid][subIndex][field] = val;
      }
      return prev;
    });
  };

  const columns = [
    {
      header: "S.No",
      accessor: (_item, index) => index + 1,
      className: "font-medium text-gray-900 w-12 text-center",
    },
    {
      header: "PO No",
      accessor: (item) => findFromList(item.poId, poData?.data, "docId"),
      className: "text-gray-800 text-center uppercase w-28",
    },
    {
      header: "Date",
      accessor: (item) =>
        item.date ? new Date(item.date).toISOString().split("T")[0] : "-",
      className: "text-gray-800 text-center uppercase w-20",
    },
    // {
    //   header: "Fabric Code",
    //   accessor: (item) => item.fabCode || "-",
    //   className: "text-gray-800 text-center uppercase w-20",
    // },
    {
      header: "", // Optional
      accessor: (_) => "",
      className: "text-gray-800  uppercase w-[70%]",
      // Optional: Render buttons
      // cellClass: () => "flex gap-2 justify-center"
    },
  ];

  const data = {
    branchId,
    poId,
    poDetails,
    orderId,
    date,
    isPurchased,
  };
  const handleSubmitCustom = async (callback, data, text) => {
    try {
      let returnData;
      if (text === "Updated") {
        returnData = await callback({ id, body: data }).unwrap();
      } else {
        returnData = await callback(data).unwrap();
      }

      if (returnData.statusCode === 1) {
        console.log(returnData.message);

        return;
      }
      setId("");
      setReport(false);

      Swal.fire({
        icon: "success",
        title: `${text || "Updated"} Successfully`,

        showConfirmButton: false,
        timer: 2000,
      });
    } catch (error) {
      console.log("handle");
      console.log("error", error);

      Swal.fire({
        icon: "error",
        title: "Submission error",
        text: error.data?.message || "Something went wrong!",
      });
    }
  };
  const saveData = () => {
    // if (!validateForm()) return;
    if (id) {
      handleSubmitCustom(updateData, data, "Updated");
    } else {
      handleSubmitCustom(addData, data, "Added");
    }
    resetForm();
  };
  const resetForm = () => {
    setId("");
    setPoId("");
    setPoDetails([]);
    setDate(moment.utc(new Date()).format("YYYY-MM-DD"));
    setIsPurchased(false);
  };

  const handleDelete = async (id) => {
    if (id) {
      if (!window.confirm("Are you sure to delete...?")) {
        return;
      }
      try {
        await removeData(id);
        setId("");
        Swal.fire({
          icon: "success",
          title: `${"Deleted"} Successfully`,
          showConfirmButton: false,
          timer: 2000,
        });
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Submission error",
          text: error.data?.message || "Something went wrong!",
        });
      }
    }
  };
  function onDataClick(id) {
    setId(id);
    setReport(true);
  }

  return (
    <>
      {report ? (
        <div className="w-full  mx-auto rounded-md px-2 py-1">
          <div className="flex justify-between items-center mb-1">
            <h1 className="text-2xl font-bold text-gray-800">
              Purchase Inward
            </h1>
            <button
              onClick={() => {
                setReport(false);
                setId("");
                setPoId("");
              }}
              className="text-indigo-600 hover:text-indigo-700"
              title="Open Report"
            >
              <FaFileAlt className="w-5 h-5" />
            </button>
          </div>

          <div className="border  border-slate-200 p-2 pl-3 bg-white rounded-md shadow-sm">
            <h2 className="text-base font-medium text-slate-700 mb-2">
              Purchase Order Details
            </h2>
            <div className="flex flex-wrap gap-x-10">
              <div className="w-40">
                <label className="block text-xs text-black mb-1">
                  List of Purchase orders
                </label>
                <select
                  className="w-full px-2 h-[22px] text-[12px] border border-slate-300 rounded-md 
                                focus:border-indigo-300 focus:outline-none transition-all duration-200
                                 hover:border-slate-400"
                  value={poId}
                  onChange={(e) => {
                    const selectedValue = Number(e.target.value);
                    setPoId(selectedValue);
                  }}
                  // disabled={readOnly}
                >
                  <option value="">Select Purchase Order</option>
                  {poData?.data?.map((doc) => (
                    <option value={doc?.id} key={doc.id}>
                      {doc.docId}
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-28">
                <ReusableInput
                  label="Date"
                  type="date"
                  placeholder="Select date"
                  value={date}
                  className="[&>input]:py-1.5"
                />
              </div>

              <div className="flex items-center mt-3">
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  Is Purchased
                  <input
                    type="checkbox"
                    name="isPurchased"
                    className="w-4 h-4 accent-indigo-500"
                    checked={isPurchased}
                    onChange={(e) => setIsPurchased(e.target.checked)}
                  />
                </label>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto mt-2 max-h-72 bg-white rounded-md">
            <table className="w-full border-collapse mt-1 ml-1 mr-1 table-fixed">
              <thead className="bg-gray-200 text-gray-800 ">
                <tr>
                  <th className="w-4 px-4 py-2 text-center font-medium text-[12px]">
                    S.No
                  </th>
                  <th className="w-40 px-4 py-2 text-center font-medium text-[12px]">
                    Fabric Code
                  </th>
                  <th className="w-16 px-4 py-2 text-center font-medium text-[12px]">
                    Fabric Type
                  </th>
                  <th className="w-48 px-4 py-2 text-center font-medium text-[12px]">
                    Fiber Content
                  </th>
                  <th className="w-20 px-4 py-2 text-center font-medium text-[12px]">
                    Color
                  </th>
                  <th className="w-16 px-4 py-2 text-center font-medium text-[12px]">
                    UNIT
                  </th>
                  <th className="w-16 px-3 py-2 text-center font-medium text-[12px]">
                    Quantity
                  </th>

                  <th className="w-16 px-3 py-2 text-center font-medium text-[12px]">
                    Actual Quantity
                  </th>
                </tr>
              </thead>
              <tbody>
                {poDetails?.map((item, index) => {
                  return (
                    <Grid
                      id={id}
                      item={item}
                      index={index}
                      actualQuantity={actualQuantity}
                      handleChange={handleChange}
                      key={index}
                    />
                  );
                })}
              </tbody>
            </table>
          </div>
          {/* {buttons} */}
          <div className="flex flex-col md:flex-row gap-2 justify-between mt-4">
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={saveData}
                className="bg-indigo-600 text-white px-4 py-1 rounded-md hover:bg-indigo-700 flex items-center text-sm"
              >
                <FiSave className="w-4 h-4 mr-2" />
                {id ? "Update" : "Save"}
              </button>
              <button className="bg-indigo-500 text-white px-4 py-1 rounded-md hover:bg-indigo-600 flex items-center text-sm">
                <HiOutlineRefresh className="w-4 h-4 mr-2" />
                {id ? "Update & Next" : "Save & Next"}
              </button>
            </div>

            <div className="flex gap-2 flex-wrap">
              {/* <button className="bg-emerald-600 text-white px-4 py-1 rounded-md hover:bg-emerald-700 flex items-center text-sm">
                <FiShare2 className="w-4 h-4 mr-2" />
                Email
              </button>
              <button className="bg-emerald-600 text-white px-4 py-1 rounded-md hover:bg-emerald-700 flex items-center text-sm">
                <FaWhatsapp className="w-4 h-4 mr-2" />
                WhatsApp
              </button> */}
              <button className="bg-slate-600 text-white px-4 py-1 rounded-md hover:bg-slate-700 flex items-center text-sm">
                <FiPrinter className="w-4 h-4 mr-2" />
                Print
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-2 bg-[#F1F1F0] min-h-screen">
          <div className="flex flex-col sm:flex-row justify-between bg-white py-0.5 px-1 items-start sm:items-center mb-3 gap-4 rounded-tl-lg rounded-tr-lg shadow-sm border border-gray-200">
            <div className="flex items-center gap-2">
              <select
                // value={selectedPeriod}
                // onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-3 py-0.5 border rounded-md text-sm"
              >
                <option value="this-month">This Month</option>
                <option value="last-month">Last Month</option>
              </select>
              <select
                // value={selectedFinYear}
                // onChange={(e) => setSelectedFinYear(e.target.value)}
                className="px-3 py-0.5 border rounded-md text-sm"
              >
                <option value="2023-2024">2023-2024</option>
                <option value="2022-2023">2022-2023</option>
              </select>
              <select
                // value={selectedStatus}
                // onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-0.5 border rounded-md text-sm"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="processed">Processed</option>
              </select>
            </div>
            <button
              className="hover:bg-green-700 bg-white border border-green-700 hover:text-white text-green-800 px-4 py-0.5 rounded-md flex items-center gap-2 text-sm"
              onClick={() => {
                setReport(true);
                setReadOnly(false);
                setId("");
                setPoId("");
                resetForm();
              }}
            >
              <FaPlus /> Create New
            </button>
          </div>

          <CommonTable
            columns={columns}
            data={allData?.data}
            onDataClick={onDataClick}
            readOnly={readOnly}
            setReadOnly={setReadOnly}
            setReport={setReport}
            handleDelete={handleDelete}
            itemsPerPage={10}
          />
        </div>
      )}
    </>
  );
};

export default NewPurchaseInward;
