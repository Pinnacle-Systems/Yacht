import { useState } from "react";
import PurchaseBillForm from "./PurchaseBillForm";
import { useDispatch } from "react-redux";
import Swal from "sweetalert2";
import { FaPlus } from "react-icons/fa";
import PurchaseBillFormReport from "./PurchaseBillFormReport";
import { getCommonParams } from "../../../Utils/helper";
import { useDeletePurchaseBillMutation, useLazyGetPurchaseBillByIdQuery } from "../../../redux/services/PurchaseBillService";
import { useGetSizeMasterQuery } from "../../../redux/uniformService/SizeMasterService";
import { useGetColorMasterQuery } from "../../../redux/uniformService/ColorMasterService";
import { useGetStyleItemMasterQuery } from "../../../redux/uniformService/StyleItemMasterService";
import { useGetUnitOfMeasurementMasterQuery } from "../../../redux/uniformService/UnitOfMeasurementServices";
import { useGetTaxTemplateQuery } from "../../../redux/services/TaxTemplateServices";
import { useGetStyleMasterQuery } from "../../../redux/uniformService/StyleMasterService";
import showroomStockApi from "../../../redux/uniformService/ShowroomStockService";
import SalesEntryApi from "../../../redux/uniformService/SalesEntryService"
import salesBillApi from "../../../redux/services/SalesBillService";

const MODEL = "Purchase Bill";

export default function Form() {
  const [showForm, setShowForm] = useState(false);
  const [id, setId] = useState("");
  const [readOnly, setReadOnly] = useState(false);
  const dispatch = useDispatch();
  const { companyId, branchId } = getCommonParams();
  const params = {
    branchId,
    companyId,
  };
  const [trigger, { data: singleData,
    isFetching: isSingleFetching,
    isLoading: isSingleLoading, }] =
    useLazyGetPurchaseBillByIdQuery();
  const { data: sizeList } = useGetSizeMasterQuery({ params });
  const { data: colorList } = useGetColorMasterQuery({ params });
  const { data: styleItemList } = useGetStyleItemMasterQuery({ params });
  const { data: styleList } = useGetStyleMasterQuery({ params });

  const { data: uomList } = useGetUnitOfMeasurementMasterQuery({ params });
  const { data: taxTypeList } =
    useGetTaxTemplateQuery({ params });
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
    const { data } = await trigger(id);
    if (id) {
      if (!window.confirm("Are you sure to delete...?")) {
        return;
      }
      if (data?.data?.childRecordReturn > 0) {
        Swal.fire({
          icon: "error",
          title: "This Transaction items used in Purchase Return",
          text: "Data cannot be deleted!",
        });
      } else if (data?.data?.childRecordSales > 0) {
        Swal.fire({
          icon: "error",
          title: "This Transaction items used in Sales Bill",
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
          dispatch(showroomStockApi.util.invalidateTags(["showroomStock"]));
          dispatch(SalesEntryApi.util.invalidateTags(["SalesEntry"]));
          // dispatch(salesBillApi.util.invalidateTags(["SalesBill"]));
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
          sizeList={sizeList}
          styleItemList={styleItemList}
          colorList={colorList}
          uomList={uomList}
          taxTypeList={taxTypeList}
          styleList={styleList}
        />
      )}
    </>
  );

}
