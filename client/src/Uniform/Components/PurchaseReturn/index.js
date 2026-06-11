import { useState } from "react";
import { useDispatch } from "react-redux";
import Swal from "sweetalert2";
import { FaPlus } from "react-icons/fa";
import PurchaseReturnForm from "./PurchaseReturnForm";
import {
  useDeletePurchaseReturnMutation,
  useLazyGetPurchaseReturnByIdQuery,
} from "../../../redux/services/PurchaseReturnService";
import PurchaseReturnReport from "./PurchaseReturnReport";
import { getCommonParams } from "../../../Utils/helper";
import CuttingDeliveryApi from "../../../redux/uniformService/CuttingDeliveryServices";
import CuttingOrderApi from "../../../redux/uniformService/CuttingOrderService";
import purchaseInwardEntryApi from "../../../redux/uniformService/PurchaseInwardEntry";
import { UserPermissions } from "../../../Utils/UserPermissions";
const MODEL = "Purchase Return";

export default function Form() {
  const [showForm, setShowForm] = useState(false);
  const [id, setId] = useState("");
  const [readOnly, setReadOnly] = useState(false);
  const { hasPermission } = UserPermissions();

  const dispatch = useDispatch();

  const [removeData] = useDeletePurchaseReturnMutation();
  const { companyId } = getCommonParams();

  const [
    trigger,
    {
      data: singleData,
      isFetching: isSingleFetching,
      isLoading: isSingleLoading,
    },
  ] = useLazyGetPurchaseReturnByIdQuery();
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
    if (id) {
      if (!window.confirm("Are you sure to delete...?")) {
        return;
      }

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
        dispatch(CuttingOrderApi.util.invalidateTags(["CuttingOrder"]));
        dispatch(
          purchaseInwardEntryApi.util.invalidateTags(["purchaseInwardEntry"]),
        );
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Submission error",
          text: error.data?.message || "Something went wrong!",
        });
        setShowForm(false);
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
              Purchase Return Report
            </h1>
          </div>

          <button
            className="hover:bg-green-700 bg-white border border-green-700 hover:text-white text-green-800 px-4 py-1 rounded-md flex items-center gap-2 text-sm"
            onClick={() => {
              if (
                !hasPermission(() => {
                  setShowForm(true);
                  onNew();
                }, "create")
              )
                return;
            }}
          >
            <FaPlus /> Create New
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <PurchaseReturnReport
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            itemsPerPage={10}
          />
        </div>
      </div>

      {showForm && (
        <PurchaseReturnForm
          onClose={() => {
            setShowForm(false);
            setReadOnly((prev) => !prev);
          }}
          id={id}
          readOnly={readOnly}
          setReadOnly={setReadOnly}
          setId={setId}
          setShowForm={setShowForm}
          singleData={singleData}
          isSingleFetching={isSingleFetching}
          isSingleLoading={isSingleLoading}
        />
      )}
    </>
  );
}
