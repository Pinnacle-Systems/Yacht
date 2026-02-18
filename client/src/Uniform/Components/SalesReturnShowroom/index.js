import SalesReturnReport from "./SalesReturnReport";
import { SalesReturnForm } from "./SalesReturnForm";
import { FaPlus } from "react-icons/fa";
import { useState } from "react";
import Swal from "sweetalert2";
import { getCommonParams } from "../../../Utils/helper";
import { useDispatch } from "react-redux";
import { useGetSizeMasterQuery } from "../../../redux/uniformService/SizeMasterService";
import { useGetColorMasterQuery } from "../../../redux/uniformService/ColorMasterService";
import { useGetStyleItemMasterQuery } from "../../../redux/uniformService/StyleItemMasterService";
import { useGetUnitOfMeasurementMasterQuery } from "../../../redux/uniformService/UnitOfMeasurementServices";
import { useGetTaxTemplateQuery } from "../../../redux/services/TaxTemplateServices";
import { useDeleteSalesReturnSRMutation } from "../../../redux/uniformService/SalesReturnShowroom.service";
import { useGetStyleMasterQuery } from "../../../redux/uniformService/StyleMasterService";
import salesBillApi from "../../../redux/services/SalesBillService";
import showroomStockApi from "../../../redux/uniformService/ShowroomStockService";

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
  const { data: sizeList } = useGetSizeMasterQuery({ params });
  const { data: colorList } = useGetColorMasterQuery({ params });
  const { data: styleItemList } = useGetStyleItemMasterQuery({ params });
  const { data: uomList } = useGetUnitOfMeasurementMasterQuery({ params });
  const { data: taxTypeList } = useGetTaxTemplateQuery({ params });
  const { data: styleList } = useGetStyleMasterQuery({ params });

  const [removeData] = useDeleteSalesReturnSRMutation();

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
        dispatch(salesBillApi.util.invalidateTags(["SalesBill"]));
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
              setShowForm(true);
              onNew();
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
