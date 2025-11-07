import { toast } from "react-toastify";
import { DropdownInput, DropdownNew } from "../../../Inputs";
import { useGetBranchQuery } from "../../../redux/services/BranchMasterService";
import { useGetPartyCategoryMasterQuery } from "../../../redux/services/PartyCategoryServices";
import { useGetLocationMasterQuery } from "../../../redux/uniformService/LocationMasterServices";
import { dropDownListObject } from "../../../Utils/contructObject";
import { getCommonParams } from "../../../Utils/helper";
import { useState } from "react";
import { useGetPartyQuery } from "../../../redux/services/PartyMasterService";
import { ReusableInput } from "../../../Utils/CommonInput";

export default function Parameter({
  locationId,
  setLocationId,
  storeId,
  setStoreId,
  fromDate,
  setFromDate,
  toDate,
  setToDate,
  customerId,
  setCustomerId,
  onClose,
}) {
  const [localStoreId, setLocalStoreId] = useState(storeId);
  const [localLocationId, setLocalLocationId] = useState(locationId);
  const [localFromDate, setLocalFromDate] = useState(fromDate);
  const [localToDate, setLocalToDate] = useState(toDate);
  function handleDone() {
    if (!localLocationId) {
      return toast.info("Select Location", {
        position: "top-center",
      });
    }
    if (!localStoreId)
      return toast.info("Select Store", {
        position: "top-center",
      });
    if (!localFromDate) {
      return toast.info("Select From Date", {
        position: "top-center",
      });
    }
    if (!localToDate) {
      return toast.info("Select To Date", {
        position: "top-center",
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
  const storeOptions = locationData
    ? locationData.data.filter(
        (item) => parseInt(item.locationId) === parseInt(localLocationId)
      )
    : [];
  const { data: customerList } = useGetPartyQuery({
    params: { companyId },
  });

  return (
    <div className="  items-center p-1 text-center bg-blue-200 rounded-b-md  sticky top-0 ">
      <div className="grid grid-cols-5 gap-5 p-2">
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
          name="Customer"
          dataList={customerList?.data?.filter((item) => item.active)}
          value={customerId}
          setValue={(value) => {
            setCustomerId(value);
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
}
