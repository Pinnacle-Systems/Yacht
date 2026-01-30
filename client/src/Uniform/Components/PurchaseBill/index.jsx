import { useState } from "react";
import PurchaseBillForm from "./PurchaseBillForm";
import { useDispatch } from "react-redux";
import Swal from "sweetalert2";
import { FaPlus } from "react-icons/fa";
import PurchaseBillFormReport from "./PurchaseBillFormReport";
import { getCommonParams } from "../../../Utils/helper";
import { useDeletePurchaseBillMutation } from "../../../redux/services/PurchaseBillService";
const MODEL = "Purchase Bill";

export default function Form() {
  const [showForm, setShowForm] = useState(false);
  const [id, setId] = useState("");
  const [readOnly, setReadOnly] = useState(false);
//   const dispatch = useDispatch();
  const { companyId, branchId } = getCommonParams();

  const [removeData] = useDeletePurchaseBillMutation();
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
    if (id) {
      if (!window.confirm("Are you sure to delete...?")) {
        return;
      }
    //   if (data?.data?.childRecordReturn > 0) {
    //     Swal.fire({
    //       icon: "error",
    //       title: "This item used in Purchase Return",
    //       text: "Data cannot be deleted!",
    //     });
    //   } else if (data?.data?.childRecordSales > 0) {
    //     Swal.fire({
    //       icon: "error",
    //       title: "This item used in Sales Entry",
    //       text: "Data cannot be deleted!",
    //     });
    //   }
    //   else {}
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
              Purchase Bill Report
            </h1>
          </div>

          <div className="flex items-center gap-2">
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
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <PurchaseBillFormReport
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            itemsPerPage={10}
          />
        </div>
      </div>

      {showForm && (
        <PurchaseBillForm
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
