import { useState } from "react";
import { useGetBranchQuery } from "../../../redux/services/BranchMasterService";
import { useGetLocationMasterQuery } from "../../../redux/uniformService/LocationMasterServices";
import { getCommonParams } from "../../../Utils/helper";
import { toast } from "react-toastify";
import { DropdownNew } from "../../../Inputs";
import { useGetStyleMasterQuery } from "../../../redux/uniformService/StyleMasterService";
import { useGetSizeMasterQuery } from "../../../redux/uniformService/SizeMasterService";
import { useGetFabricMasterQuery } from "../../../redux/uniformService/FabricMasterService";
import { useGetStyleItemMasterQuery } from "../../../redux/uniformService/StyleItemMasterService";
import { useGetColorMasterQuery } from "../../../redux/uniformService/ColorMasterService";
import { ReusableInput } from "../../../Utils/CommonInput";

const Parameter = ({
  locationId,
  setLocationId,
  storeId,
  setStoreId,
  styleId,
  setStyleId,
  sizeId,
  setSizeId,
  fabricId,
  setFabricId,
  onClose,
  styleItemId,
  setStyleItemId,
  colorId,
  setColorId,
  fromDate,
  setFromDate,
  toDate,
  setToDate,
}) => {
  const [localStoreId, setLocalStoreId] = useState(storeId);
  const [localLocationId, setLocalLocationId] = useState(locationId);
  const [localFromDate, setLocalFromDate] = useState(fromDate);
  const [localToDate, setLocalToDate] = useState(toDate);

  function handleDone() {
    if (!localLocationId) {
      return toast.info(" Branch", {
        position: "top-center",
        autoClose: 2000,
      });
    }
    if (!localStoreId)
      return toast.info(" Location", {
        position: "top-center",
        autoClose: 2000,
      });
    if (!localFromDate || !localToDate) {
      return toast.info("Select Required Fields", {
        position: "top-center",
        autoClose: 2000,
      });
    }
    setStoreId(localStoreId);
    setLocationId(localLocationId);
    setFromDate(localFromDate);
    setToDate(localToDate);
    onClose();
  }

  const { companyId, branchId } = getCommonParams();

  const { data: locationData } = useGetLocationMasterQuery({
    params: { branchId },
  });
  const { data: branchList } = useGetBranchQuery({ params: { companyId } });
  const { data: styleList } = useGetStyleMasterQuery({ params: { companyId } });
  const { data: sizeList } = useGetSizeMasterQuery({ params: { companyId } });
  const { data: fabricList } = useGetFabricMasterQuery({
    params: { companyId },
  });
  const { data: styleItemList } = useGetStyleItemMasterQuery({
    params: { companyId },
  });
  const { data: colorList } = useGetColorMasterQuery({ params: { companyId } });

  const storeOptions = locationData
    ? locationData.data.filter(
        (item) => parseInt(item.locationId) === parseInt(localLocationId)
      )
    : [];
  return (
    <div className="  items-center p-1 text-center bg-blue-200 rounded-b-md  sticky top-0 ">
      <div className="grid grid-cols-5 gap-5 p-2">
        <DropdownNew
          name="Branch"
          dataList={branchList?.data?.filter((item) => item.active)}
          value={localLocationId}
          setValue={(value) => {
            setLocalLocationId(value);
            setLocalStoreId("");
          }}
          required={true}
          otherField={"branchName"}
          placeholder={"Select Branch"}
          width={40}
        />
        <DropdownNew
          name="Location"
          dataList={storeOptions?.filter((item) => item.active)}
          value={localStoreId}
          setValue={setLocalStoreId}
          required={true}
          otherField={"storeName"}
          placeholder={"Select Location"}
        />
        <ReusableInput
          label="From Date"
          value={localFromDate}
          setValue={setLocalFromDate}
          type={"date"}
          required={true}
        />
        <ReusableInput
          label="To Date"
          value={localToDate}
          setValue={setLocalToDate}
          type={"date"}
          required={true}
        />
        <DropdownNew
          name="Style No"
          dataList={styleList?.data?.filter((item) => item.active)}
          value={styleId}
          setValue={(value) => {
            setStyleId(value);
          }}
          required={false}
          clear={true}
          otherField={"sku"}
        />
        <DropdownNew
          name={"Style"}
          dataList={styleItemList?.data?.filter((item) => item.active)}
          value={styleItemId}
          required={false}
          setValue={setStyleItemId}
          clear={true}
        />
        {/* <DropdownNew
          name="Fabric"
          dataList={fabricList?.data?.filter((item) => item.active)}
          value={fabricId}
          setValue={(value) => {
            setFabricId(value);
          }}
          required={false}
          clear={true}
        /> */}
        <DropdownNew
          name="Size"
          dataList={sizeList?.data?.filter((item) => item.active)}
          value={sizeId}
          setValue={(value) => {
            setSizeId(value);
          }}
          required={false}
          clear={true}
        />
        <DropdownNew
          name="Color"
          dataList={colorList?.data?.filter((item) => item.active)}
          value={colorId}
          setValue={(value) => {
            setColorId(value);
          }}
          required={false}
          clear={true}
        />
      </div>
      <div className="flex justify-end gap-4 mb-4 items-center mr-2">
        <button
          onClick={handleDone}
          className="bg-lime-600 hover:bg-lime-700 text-white p-1 px-3 text-sm rounded font-semibold transition"
        >
          View Report
        </button>
        <button
          onClick={onClose}
          className="bg-red-600 hover:bg-red-700 text-white p-1 text-sm rounded font-semibold transition"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default Parameter;
