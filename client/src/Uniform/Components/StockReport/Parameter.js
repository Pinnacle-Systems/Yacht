import { useState } from "react";
import { useGetBranchQuery } from "../../../redux/services/BranchMasterService";
import { useGetLocationMasterQuery } from "../../../redux/uniformService/LocationMasterServices";
import { getCommonParams } from "../../../Utils/helper";
import { toast } from "react-toastify";
import { DropdownInput, DropdownInputNew, DropdownNew } from "../../../Inputs";
import { dropDownListObject } from "../../../Utils/contructObject";
import { useGetStyleMasterQuery } from "../../../redux/uniformService/StyleMasterService";
import { useGetSizeMasterQuery } from "../../../redux/uniformService/SizeMasterService";
import { useGetFabricMasterQuery } from "../../../redux/uniformService/FabricMasterService";
import { useGetStyleItemMasterQuery } from "../../../redux/uniformService/StyleItemMasterService";
import { useGetColorMasterQuery } from "../../../redux/uniformService/ColorMasterService";

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
}) => {
  const [localStoreId, setLocalStoreId] = useState(storeId);
  const [localLocationId, setLocalLocationId] = useState(locationId);

  function handleDone() {
    if (!localLocationId) {
      return toast.info(" Location", {
        position: "top-center",
      });
    }
    if (!localStoreId)
      return toast.info(" Store", {
        position: "top-center",
      });
    setStoreId(localStoreId);
    setLocationId(localLocationId);
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
      <div className="grid grid-cols-6 gap-5 p-2">
        <DropdownNew
          name="Location"
          dataList={branchList?.data?.filter((item) => item.active)}
          value={localLocationId}
          setValue={(value) => {
            setLocalLocationId(value);
            setLocalStoreId("");
          }}
          required={true}
          otherField={"branchName"}
          placeholder={"Select Location"}
          width={40}
        />
        <DropdownNew
          name="Store"
          dataList={storeOptions?.filter((item) => item.active)}
          value={localStoreId}
          setValue={setLocalStoreId}
          required={true}
          otherField={"storeName"}
          placeholder={"Select Store"}
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
        <DropdownNew
          name="Fabric"
          dataList={fabricList?.data?.filter((item) => item.active)}
          value={fabricId}
          setValue={(value) => {
            setFabricId(value);
          }}
          required={false}
          clear={true}
        />
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
