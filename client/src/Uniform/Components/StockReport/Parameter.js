import { useState } from "react";
import { useGetBranchQuery } from "../../../redux/services/BranchMasterService";
import { useGetLocationMasterQuery } from "../../../redux/uniformService/LocationMasterServices";
import { getCommonParams } from "../../../Utils/helper";
import { toast } from "react-toastify";
import { DropdownInput } from "../../../Inputs";
import { dropDownListObject } from "../../../Utils/contructObject";

const Parameter = ({
  locationId,
  setLocationId,
  storeId,
  setStoreId,

  onClose,
}) => {
  const [localStoreId, setLocalStoreId] = useState(storeId);
  const [localLocationId, setLocalLocationId] = useState(locationId);

  function handleDone() {
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

  const storeOptions = locationData
    ? locationData.data.filter(
        (item) => parseInt(item.locationId) === parseInt(localLocationId)
      )
    : [];
  return (
    <div className="flex justify-between items-center p-1 text-center bg-blue-200 rounded-b-md mb-7 sticky top-0 ">
      <div className="grid grid-cols-5">
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
      </div>
      <div className="flex justify-end gap-4  items-center">
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
