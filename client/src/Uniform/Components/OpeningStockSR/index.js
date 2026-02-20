import Swal from "sweetalert2";
import OpeningStockForm from "./OpeningStockForm";
import OpeningStockFormReport from "./OpeningStockFormReport";
import { FaPlus } from "react-icons/fa";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { getCommonParams } from "../../../Utils/helper.js";
import {
  useDeleteOpeningStockSRMutation,
  useLazyGetOpeningStockSRByIdQuery,
} from "../../../redux/uniformService/OpeningStockSRServices.js";
import showroomStockApi from "../../../redux/uniformService/ShowroomStockService";

export default function Form() {
  const [showForm, setShowForm] = useState(false);
  const [id, setId] = useState("");
  const [readOnly, setReadOnly] = useState(false);
  const dispatch = useDispatch();
  const { branchId } = getCommonParams();
  const [removeData] = useDeleteOpeningStockSRMutation();
  const [
    trigger,
    {
      data: singleData,
      isFetching: isSingleFetching,
      isLoading: isSingleLoading,
    },
  ] = useLazyGetOpeningStockSRByIdQuery({
    params: {
      branchId,
    },
  });
  const handleView = (orderId) => {
    setId(orderId);
    setShowForm(true);
    setReadOnly(true);
  };

  const handleEdit = (orderId) => {
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
          title: "This Transaction items used in Sales Bill",
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
          dispatch(showroomStockApi.util.invalidateTags(["showroomStock"]));
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
        <div className="flex justify-between bg-white py-1 px-2 rounded shadow-sm">
          <div>
            <h1 className="text-xl font-bold text-gray-800">
              Opening Stock Report
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

        <div className="bg-white rounded-xl shadow-sm mt-2">
          <OpeningStockFormReport
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            itemsPerPage={10}
          />
        </div>
      </div>

      {showForm && (
        <OpeningStockForm
          readOnly={readOnly}
          setReadOnly={setReadOnly}
          id={id}
          setId={setId}
          onClose={() => setShowForm(false)}
        />
      )}
    </>
  );
}
