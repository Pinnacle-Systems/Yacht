import { useState } from "react";
import { useGetBranchQuery } from "../../../redux/services/BranchMasterService";
import { getCommonParams } from "../../../Utils/helper";
import { toast } from "react-toastify";
import { DropdownNew } from "../../../Inputs";
import { useGetStyleMasterQuery } from "../../../redux/uniformService/StyleMasterService";
import { useGetSizeMasterQuery } from "../../../redux/uniformService/SizeMasterService";
import { useGetStyleItemMasterQuery } from "../../../redux/uniformService/StyleItemMasterService";
import { useGetColorMasterQuery } from "../../../redux/uniformService/ColorMasterService";
import { useGetBarcodeListQuery } from "../../../redux/uniformService/ShowroomStockService";

const Parameter = ({
  locationId,
  setLocationId,
  styleId,
  setStyleId,
  sizeId,
  setSizeId,
  onClose,
  styleItemId,
  setStyleItemId,
  colorId,
  setColorId,
  barcodeId,
  setBarcodeId,
}) => {
  const [localLocationId, setLocalLocationId] = useState(locationId);

  function handleDone() {
    if (!localLocationId) {
      return toast.info("Branch", {
        position: "top-center",
      });
    }
    setLocationId(localLocationId);
    onClose();
  }

  const { companyId, branchId } = getCommonParams();
  const { data: branchList } = useGetBranchQuery({ params: { companyId } });
  const { data: styleList } = useGetStyleMasterQuery({ params: { companyId } });
  const { data: sizeList } = useGetSizeMasterQuery({ params: { companyId } });
  const { data: styleItemList } = useGetStyleItemMasterQuery({
    params: { companyId },
  });
  const { data: colorList } = useGetColorMasterQuery({ params: { companyId } });
  const { data: barcodeList } = useGetBarcodeListQuery({
    params: { branchId: localLocationId },
  });

  return (
    <div className="  items-center p-1 text-center bg-blue-200 rounded-b-md  sticky top-0 ">
      <div className="grid grid-cols-6 gap-5 p-2">
        <DropdownNew
          name="Branch"
          dataList={branchList?.data?.filter((item) => item.active)}
          value={localLocationId}
          setValue={(value) => {
            setLocalLocationId(value);
          }}
          required={true}
          otherField={"branchName"}
          placeholder={"Select Branch"}
          width={40}
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
          name={"Style Item"}
          dataList={styleItemList?.data?.filter((item) => item.active)}
          value={styleItemId}
          required={false}
          setValue={setStyleItemId}
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
        <DropdownNew
          name="Barcode"
          dataList={barcodeList?.data}
          value={barcodeId}
          setValue={(value) => {
            setBarcodeId(value);
          }}
          required={false}
          clear={true}
          otherField={"barcodeNo"}
          otherValue={"barcodeId"}
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
