import {
  useDeleteSalesEntryMutation,
  useLazyGetSalesEntryByIdQuery,
} from "../../../redux/uniformService/SalesEntryService";
import SalesEntryReport from "./SaleEntryReport";
import { SalesBillForm } from "./SalesEntryForm";
import { FaPlus } from "react-icons/fa";
import { useState } from "react";
import Swal from "sweetalert2";
import { getCommonParams } from "../../../Utils/helper";
import { useDispatch } from "react-redux";
import StockAdjustmentApi from "../../../redux/uniformService/StockAdjustmentService";
import OpeningStockApi from "../../../redux/uniformService/OpeningStockService";
import purchaseInwardEntryApi from "../../../redux/uniformService/PurchaseInwardEntry";
import  purchaseReturnApi  from "../../../redux/services/PurchaseReturnService";

export default function Form() {
  const [showForm, setShowForm] = useState(false);
  const [id, setId] = useState("");
  const [readOnly, setReadOnly] = useState(false);
  const dispatch = useDispatch();

  const [removeData] = useDeleteSalesEntryMutation();
  const { branchId } = getCommonParams();
  const [
    trigger,
    {
      data: singleData,
      isFetching: isSingleFetching,
      isLoading: isSingleLoading,
    },
  ] = useLazyGetSalesEntryByIdQuery({
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
      if (data?.data?.childRecordReturn > 0) {
        Swal.fire({
          icon: "error",
          title: "This items used in Sales Return",
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
          dispatch(StockAdjustmentApi.util.invalidateTags(["StockAdjustment"]));
          dispatch(
            purchaseInwardEntryApi.util.invalidateTags(["purchaseInwardEntry"])
          );
          dispatch(purchaseReturnApi.util.invalidateTags(["PurchaseReturn"]));
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
              Sales Delivery Report
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
          <SalesEntryReport
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            itemsPerPage={10}
          />
        </div>
      </div>

      {showForm && (
        <SalesBillForm
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
