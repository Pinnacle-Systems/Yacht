import SalesBillReport from "./SalesBillReport";
import { SalesBillForm } from "./SalesBillForm";
import { FaPlus } from "react-icons/fa";
import { useState } from "react";
import Swal from "sweetalert2";
import { getCommonParams } from "../../../Utils/helper";
import { useDispatch } from "react-redux";
import {
  useDeleteSalesBillMutation,
  useLazyGetSalesBillByIdQuery,
} from "../../../redux/services/SalesBillService";
import { useGetSizeMasterQuery } from "../../../redux/uniformService/SizeMasterService";
import { useGetColorMasterQuery } from "../../../redux/uniformService/ColorMasterService";
import { useGetStyleItemMasterQuery } from "../../../redux/uniformService/StyleItemMasterService";
import { useGetUnitOfMeasurementMasterQuery } from "../../../redux/uniformService/UnitOfMeasurementServices";
import { useGetTaxTemplateQuery } from "../../../redux/services/TaxTemplateServices";
import { useGetStyleMasterQuery } from "../../../redux/uniformService/StyleMasterService";
import showroomStockApi from "../../../redux/uniformService/ShowroomStockService";
import purchaseBillApi from "../../../redux/services/PurchaseBillService";
import OpeningStockSRApi from "../../../redux/uniformService/OpeningStockSRServices";
import {
  useGetBranchByIdQuery,
  useGetBranchQuery,
} from "../../../redux/services/BranchMasterService";
import { useGetEmployeeQuery } from "../../../redux/services/EmployeeMasterService";
import { useGetReferenceMasterQuery } from "../../../redux/uniformService/ReferenceMasterService";

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
  const [
    trigger,
    {
      data: singleData,
      isFetching: isSingleFetching,
      isLoading: isSingleLoading,
    },
  ] = useLazyGetSalesBillByIdQuery();
  const { data: singleDataBranch } = useGetBranchByIdQuery(branchId);
  const { data: sizeList } = useGetSizeMasterQuery({ params });
  const { data: colorList } = useGetColorMasterQuery({ params });
  const { data: styleItemList } = useGetStyleItemMasterQuery({ params });
  const { data: uomList } = useGetUnitOfMeasurementMasterQuery({ params });
  const { data: taxTypeList } = useGetTaxTemplateQuery({ params });
  const { data: salesPersonList } = useGetEmployeeQuery({
   params
  });
  const { data: referenceList } = useGetReferenceMasterQuery({
    params: {
      ...params,
      active: true,
    },
  });
  const { data: styleList } = useGetStyleMasterQuery({ params });
  const { data: branchList } = useGetBranchQuery({ params: { companyId } });
  const [removeData] = useDeleteSalesBillMutation();
  const isHo =
    singleDataBranch?.data?.company?.name ===
    singleDataBranch?.data?.branchName;
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
      if (data?.data?.childRecord > 0) {
        Swal.fire({
          icon: "error",
          title: "This Transaction used in Sales Return",
          text: "Data cannot be deleted!",
        });
      } else if (data?.data?.childRecordSRInward > 0) {
        Swal.fire({
          icon: "error",
          title: "This Transaction used in Another Show Room Purchase",
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
          dispatch(purchaseBillApi.util.invalidateTags(["PurchaseBill"]));
          dispatch(showroomStockApi.util.invalidateTags(["showroomStock"]));
          dispatch(OpeningStockSRApi.util.invalidateTags(["OpeningStockSR"]));
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
              Sales Bill Report
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
          <SalesBillReport
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            itemsPerPage={10}
            isHo={isHo}
            branchList={branchList}
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
          sizeList={sizeList}
          styleItemList={styleItemList}
          colorList={colorList}
          uomList={uomList}
          taxTypeList={taxTypeList}
          styleList={styleList}
          singleDataBranch={singleDataBranch}
          isHo={isHo}
          branchList={branchList}
          salesPersonList={salesPersonList}
          referenceList={referenceList}
        />
      )}
    </>
  );
}
