import { useState } from "react";
import PurchaseInwardForm from "./PurchaseInwardForm";
import { useDispatch } from "react-redux";
import { useDeletePurchaseInwardEntryMutation, useLazyGetPurchaseInwardEntryByIdQuery } from "../../../redux/uniformService/PurchaseInwardEntry";
import Swal from "sweetalert2";
import { FaPlus } from "react-icons/fa";
import PurchaseInwardFormReport from "./PurchaseInwardFormReport";
import StyleMasterApi, { useGetStyleMasterQuery } from "../../../redux/uniformService/StyleMasterService";
import { DropdownNew } from "../../../Inputs";
import { getCommonParams } from "../../../Utils/helper";
import { remove } from "../../../redux/features/opentabs";
import { UserPermissions } from "../../../Utils/UserPermissions";
const MODEL = "Purchase Inward / Direct Inward";

export default function Form() {
  const [showForm, setShowForm] = useState(false);
  const [id, setId] = useState("");
  const [readOnly, setReadOnly] = useState(false);
  const dispatch = useDispatch();
  const [searchStyleId, setSearchStyleId] = useState("")
  const { companyId, branchId } = getCommonParams();
  const { hasPermission } = UserPermissions();

  const [trigger, { data: singleData,
    isFetching: isSingleFetching,
    isLoading: isSingleLoading, }] =
    useLazyGetPurchaseInwardEntryByIdQuery();
  const { data: styleList } = useGetStyleMasterQuery({ params: { companyId } });

  const [removeData] = useDeletePurchaseInwardEntryMutation();
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
      if (data?.data?.childRecordCutting > 0) {
        Swal.fire({
          icon: "error",
          title: "This item used in Cutting",
          text: "Data cannot be deleted!",
        });
      } else if (data?.data?.childRecordReturn > 0) {
        Swal.fire({
          icon: "error",
          title: "This item used in Purchase Return",
          text: "Data cannot be deleted!",
        });
      } else if (data?.data?.childRecordSales > 0) {
        Swal.fire({
          icon: "error",
          title: "This item used in Sales Entry",
          text: "Data cannot be deleted!",
        });
      } else if (data?.data?.childRecordStock > 0) {
        Swal.fire({
          icon: "error",
          title: "This item used in Stock Adjustment",
          text: "Data cannot be deleted!",
        });
      }
      else {
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
          dispatch(StyleMasterApi.util.invalidateTags(["StyleMaster"]));
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
              Purchase Inward Report
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-40">
              <DropdownNew
                dataList={styleList?.data?.filter((item) => item.active)}
                value={searchStyleId}
                setValue={(value) => setSearchStyleId(value)}
                required={false}
                clear={true}
                otherField={"sku"}
                placeholder={"Style No"}
              />
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
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <PurchaseInwardFormReport
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            itemsPerPage={10}
            searchStyleId={searchStyleId}
          />
        </div>
      </div>

      {showForm && (
        <PurchaseInwardForm
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
