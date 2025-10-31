import { useState } from "react";
import { useGetBranchQuery } from "../../../redux/services/BranchMasterService";
import { useGetLocationMasterQuery } from "../../../redux/uniformService/LocationMasterServices";
import { getCommonParams } from "../../../Utils/helper";
import { toast } from "react-toastify";
import { DropdownInput } from "../../../Inputs";
import { dropDownListObject } from "../../../Utils/contructObject";
import { useGetStyleMasterQuery } from "../../../redux/uniformService/StyleMasterService";
import { useGetSizeMasterQuery } from "../../../redux/uniformService/SizeMasterService";
import { useGetFabricMasterQuery } from "../../../redux/uniformService/FabricMasterService";
import { useGetStyleItemMasterQuery } from "../../../redux/uniformService/StyleItemMasterService";

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
  setStyleItemId
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

  const storeOptions = locationData
    ? locationData.data.filter(
        (item) => parseInt(item.locationId) === parseInt(localLocationId)
      )
    : [];
  return (
    <div className="  items-center p-1 text-center bg-blue-200 rounded-b-md  sticky top-0 ">
      <div className="grid grid-cols-6 gap-5 p-2">
        <DropdownInput
          name="Location"
          options={
            branchList
              ? dropDownListObject(branchList.data, "branchName", "id")
              : []
          }
          value={localLocationId}
          setValue={(value) => {
            setLocalLocationId(value);
            setLocalStoreId("");
          }}
          required={true}
        />
        <DropdownInput
          name="Store"
          options={dropDownListObject(storeOptions, "storeName", "id")}
          value={localStoreId}
          setValue={setLocalStoreId}
          required={true}
        />
        <DropdownInput
          name="Style No"
          options={
            styleList ? dropDownListObject(styleList.data, "sku", "id") : []
          }
          value={styleId}
          setValue={(value) => {
            setStyleId(value);
          }}
          required={false}
          clear={true}
        />
        <DropdownInput
          name="Style"
          options={
            styleItemList ? dropDownListObject(styleItemList.data, "name", "id") : []
          }
          value={styleItemId}
          setValue={(value) => {
            setStyleItemId(value);
          }}
          required={false}
          clear={true}
        />
        <DropdownInput
          name="Fabric"
          options={
            fabricList ? dropDownListObject(fabricList.data, "name", "id") : []
          }
          value={fabricId}
          setValue={(value) => {
            setFabricId(value);
          }}
          required={false}
          clear={true}
        />
        <DropdownInput
          name="Size"
          options={
            sizeList ? dropDownListObject(sizeList.data, "name", "id") : []
          }
          value={sizeId}
          setValue={(value) => {
            setSizeId(value);
          }}
          required={false}
          clear={true}
        />
      </div>
      <div className="flex justify-end gap-4 mb-4 items-center mr-2">
        <button
          onClick={handleDone}
          className="bg-lime-400 hover:bg-lime-600 hover:text-white p-1 px-3 text-sm rounded font-semibold transition"
        >
          View Report
        </button>
        <button
          onClick={onClose}
          className="bg-red-400 hover:bg-red-600 hover:text-white p-1 text-sm rounded font-semibold transition"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default Parameter;
