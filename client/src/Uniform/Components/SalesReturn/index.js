import { useState } from "react";
import Swal from "sweetalert2";
import { FaPlus } from "react-icons/fa";
import SalesReturnForm from "./SalesReturnForm";
import SalesReturnReport from "./SalesReturnReport";
import { useDeleteSalesReturnMutation } from "../../../redux/uniformService/SalesReturnService";
import { useDispatch } from "react-redux";
import SalesEntryApi from "../../../redux/uniformService/SalesEntryService";
import { UserPermissions } from "../../../Utils/UserPermissions";

export default function Form() {
  const [showForm, setShowForm] = useState(false);
  const [id, setId] = useState("");
  const [readOnly, setReadOnly] = useState(false);
  const [removeData] = useDeleteSalesReturnMutation();
  const dispatch = useDispatch();
  const { hasPermission } = UserPermissions();

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
              Sales Return Report
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
          <SalesReturnReport
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            itemsPerPage={10}
          />
        </div>
      </div>

      {showForm && (
        <SalesReturnForm
          readOnly={readOnly}
          setReadOnly={setReadOnly}
          id={id}
          setId={setId}
          onClose={() => {
            setShowForm(false);
            setReadOnly((prev) => !prev);
          }}
          setShowForm={setShowForm}
        />
      )}
    </>
  );
}
