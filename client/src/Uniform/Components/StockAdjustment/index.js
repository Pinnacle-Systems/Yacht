import { useState } from "react";
import StockAdjustmentForm from "./StockAdjustmentForm";
import StockAdjustmentFormReport from "./StockAdjustmentReport";
import {
  useDeleteStockAdjustmentMutation,
  useLazyGetStockAdjustmentByIdQuery,
} from "../../../redux/uniformService/StockAdjustmentService";
import Swal from "sweetalert2";
import { FaPlus } from "react-icons/fa";
import { getCommonParams } from "../../../Utils/helper";
import { useDispatch } from "react-redux";
import OpeningStockApi from "../../../redux/uniformService/OpeningStockService";
import SalesEntryApi from "../../../redux/uniformService/SalesEntryService";

export default function Form() {
  const [showForm, setShowForm] = useState(false);
  const [id, setId] = useState("");
  const [readOnly, setReadOnly] = useState(false);
  const [removeData] = useDeleteStockAdjustmentMutation();
  const { branchId } = getCommonParams();
  const dispatch = useDispatch();
  const [
    trigger,
    {
      data: singleData,
      isFetching: isSingleFetching,
      isLoading: isSingleLoading,
    },
  ] = useLazyGetStockAdjustmentByIdQuery({
    params: {
      branchId,
    },
  });

  const handleView = (orderId) => {
    trigger(orderId);
    setId(orderId);
    setShowForm(true);
    setReadOnly(true);
  };

  const handleEdit = (orderId) => {
    trigger(orderId);
    setId(orderId);
    setShowForm(true);
    setReadOnly(false);
  };

  const handleDelete = async (id) => {
    setId(id);
    const { data } = await trigger(id);
    if (id) {
      if (!window.confirm("Are you sure to delete...?")) {
        return;
      }
      if (data?.data?.childRecordSales > 0) {
        Swal.fire({
          icon: "error",
          title: "This items used in in Sales Delivery",
          text: "Data cannot be deleted!",
        });
      } else {
        try {
          let deldata = await removeData(id).unwrap();
          if (deldata?.statusCode == 1) {
            Swal.fire({
              icon: "error",
              title: "Child record Exists",
              text: deldata.data?.message || "Data cannot be deleted!",
            });
            return;
          }
          setId("");
          Swal.fire({
            title: "Deleted Successfully",
            icon: "success",
            timer: 1000,
          });
          setShowForm(false);
          dispatch(OpeningStockApi.util.invalidateTags(["OpeningStock"]));
          dispatch(SalesEntryApi.util.invalidateTags(["SalesEntry"]));
        } catch (error) {
          Swal.fire({
            icon: "error",
            title: "Submission error",
            text: error.data?.message || "Something went wrong!",
          });
          setShowForm(false);
        }
      }
    }
  };
  const onNew = () => {
    setId("");
    setReadOnly(false);
    // setOrderDetails([]);
  };
  return (
    <>
      <div
        className="p-1 bg-[#F1F1F0] h-[85%]"
        style={{ display: showForm ? "none" : "block" }}
      >
        <div className="flex flex-col sm:flex-row justify-between bg-white py-1 px-1 items-start sm:items-center mb-4 gap-x-4 rounded-tl-lg rounded-tr-lg shadow-sm border border-gray-200">
          <div>
            <h1 className="text-xl font-bold text-gray-800">
              Stock Adjustment Report
            </h1>
          </div>
          <button
            className="hover:bg-green-700 bg-white border border-green-700 hover:text-white text-green-800 px-4 py-1 rounded-md flex items-center gap-2 text-sm"
            onClick={() => {
              setShowForm(true);
              onNew();
            }}
          >
            <FaPlus /> Create New
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <StockAdjustmentFormReport
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            itemsPerPage={10}
          />
        </div>
      </div>

      {showForm && (
        <StockAdjustmentForm
          readOnly={readOnly}
          setReadOnly={setReadOnly}
          id={id}
          setId={setId}
          onClose={() => {
            setShowForm(false);
            setReadOnly((prev) => !prev);
          }}
          setShowForm={setShowForm}
          singleData={singleData}
          isSingleFetching={isSingleFetching}
          isSingleLoading={isSingleLoading}
        />
      )}
    </>
  );
}
