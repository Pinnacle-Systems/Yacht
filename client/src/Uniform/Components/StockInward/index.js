import Swal from "sweetalert2";
import { FaPlus } from "react-icons/fa";
import { useState } from "react";
import {
  useDeleteStockInwardMutation,
  useLazyGetStockInwardByIdQuery,
} from "../../../redux/uniformService/StockInwardService";
import StockInwardForm from "./StockInwardForm";
import StockInwardReport from "./StockInwardReport";
import { getCommonParams } from "../../../Utils/helper";
import { useDispatch } from "react-redux";
import CuttingDeliveryApi from "../../../redux/uniformService/CuttingDeliveryServices";

export default function Form() {
  const [showForm, setShowForm] = useState(false);
  const [id, setId] = useState("");
  const [readOnly, setReadOnly] = useState(false);
  const dispatch = useDispatch();

  const [removeData] = useDeleteStockInwardMutation();
  const { branchId } = getCommonParams();
  const [
    trigger,
    {
      data: singleData,
      isFetching: isSingleFetching,
      isLoading: isSingleLoading,
    },
  ] = useLazyGetStockInwardByIdQuery({
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
      if (data?.childRecordSales > 0) {
        Swal.fire({
          icon: "error",
          title: "Child record Exists in Sales",
          text: "Data cannot be deleted!",
        });
      } else if (data?.childRecordStock > 0) {
        Swal.fire({
          icon: "error",
          title: "Child record Exists is Stock Adjustment",
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
          dispatch(CuttingDeliveryApi.util.invalidateTags(["CuttingDelivery"]));
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
              Finished Goods Inward Report
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
          <StockInwardReport
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            itemsPerPage={10}
          />
        </div>
      </div>

      {showForm && (
        <StockInwardForm
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
