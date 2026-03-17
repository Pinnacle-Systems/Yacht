import React, { useRef } from "react";
import { Check, Power } from "lucide-react";
import Modal from "../../../UiComponents/Modal";
import secureLocalStorage from "react-secure-storage";
import {
  useAddStyleMasterMutation,
  useDeleteStyleMasterMutation,
  useGetStyleMasterQuery,
  useUpdateStyleMasterMutation,
  useGetStyleMasterByIdQuery,
} from "../../../redux/uniformService/StyleMasterService";
import Swal from "sweetalert2";
import {
  TextInput,
  ToggleButton,
  ReusableTable,
  DropdownInput,
} from "../../../Inputs";
import { statusDropdown } from "../../../Utils/DropdownData";
import { useState, useCallback, useEffect } from "react";
import BrowseSingleImage from "./BrowseSingleImage";
import { getImageUrlPath } from "../../../Constants";
import { useGetSizeTemplateQuery } from "../../../redux/uniformService/SizeTemplateMasterServices";
import { dropDownListObject } from "../../../Utils/contructObject";
import { useGetFabricMasterQuery } from "../../../redux/uniformService/FabricMasterService";
import { useGetStyleItemMasterQuery } from "../../../redux/uniformService/StyleItemMasterService";
import StyleReport from "./StyleReport";
import { useGetHsnMasterQuery } from "../../../redux/services/HsnMasterService";
import { useGetUnitOfMeasurementMasterQuery } from "../../../redux/uniformService/UnitOfMeasurementServices";
import { Button } from "@mui/material";
import { UserPermissions } from "../../../Utils/UserPermissions";

const StyleMaster = () => {
  const [form, setForm] = useState(false);
  const [salesPrice, setSalesPrice] = useState("");
  const [hsnId, setHsnId] = useState("");
  const [readOnly, setReadOnly] = useState(false);
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [active, setActive] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const [searchSku, setSearchSku] = useState("");
  const [searchName, setSearchName] = useState("");
  const [alias, setAlias] = useState("");
  const [img, setImg] = useState("");
  const [sizeTemplateId, setSizeTemplateId] = useState("");
  const [fabricId, setFabricId] = useState("");
  const [styleItemId, setStyleItemId] = useState("");
  const [price, setPrice] = useState("");
  const [uomId, setUomId] = useState("");
  const [addData] = useAddStyleMasterMutation();
  const [updateData] = useUpdateStyleMasterMutation();
  const [removeData] = useDeleteStyleMasterMutation();
  const { hasPermission } = UserPermissions();

  const styleNameRef = useRef(null);
  const childRecord = useRef(0);

  const params = {
    companyId: secureLocalStorage.getItem(
      sessionStorage.getItem("sessionId") + "userCompanyId",
    ),
  };
  const {
    data: allData,
    isLoading,
    isFetching,
  } = useGetStyleMasterQuery({ params, searchParams: searchValue });
  const {
    data: singleData,
    isFetching: isSingleFetching,
    isLoading: isSingleLoading,
  } = useGetStyleMasterByIdQuery(id, { skip: !id });
  const { data: sizeTemplateList } = useGetSizeTemplateQuery({
    params,
  });
  const { data: fabricList } = useGetFabricMasterQuery({
    params,
  });
  const { data: styleItemList } = useGetStyleItemMasterQuery({
    params,
  });
  const { data: hsnList } = useGetHsnMasterQuery({
    params,
  });
  const { data: uomList } = useGetUnitOfMeasurementMasterQuery({
    params,
  });

  const data = {
    id,
    sku,
    active,
    name,
    alias,
    companyId: secureLocalStorage.getItem(
      sessionStorage.getItem("sessionId") + "userCompanyId",
    ),
    sizeTemplateId,
    fabricId,
    styleItemId,
    price,
    salesPrice,
    hsnId,
    uomId,
  };

  const validateData = (data) => {
    if (data.sku && data.fabricId && data.sizeTemplateId && data.uomId) {
      return true;
    }
    return false;
  };
  const saveData = () => {
    let foundItem;
    if (id) {
      foundItem = allData?.data
        ?.filter((i) => i.id !== id)
        ?.some(
          (item) =>
            item.sku?.trim().toLowerCase() === sku?.trim().toLowerCase(),
        );
    } else {
      foundItem = allData?.data?.some(
        (item) => item.sku?.trim().toLowerCase() === sku?.trim().toLowerCase(),
      );
    }

    if (foundItem) {
      Swal.fire({
        text: "The Style Code already exists.",
        icon: "warning",
        timer: 1500,
        showConfirmButton: false,
      });
      return false;
    }
    if (!validateData(data)) {
      Swal.fire({
        title: "Please fill all required fields...!",
        icon: "warning",
        timer: 1000,
      });
      return;
    }
    if (!window.confirm("Are you sure save the details ...?")) {
      return;
    }
    // 🔹 Convert to FormData
    const formData = new FormData();
    formData.append("id", id || "");
    formData.append("sku", sku);
    formData.append("name", name);
    formData.append("alias", alias);
    formData.append("active", active);
    formData.append("styleItemId", styleItemId);
    formData.append("price", price);
    formData.append(
      "companyId",
      secureLocalStorage.getItem(
        sessionStorage.getItem("sessionId") + "userCompanyId",
      ),
    );
    formData.append("sizeTemplateId", sizeTemplateId);
    formData.append("fabricId", fabricId);
    formData.append("salesPrice", salesPrice);
    formData.append("hsnId", hsnId);
    formData.append("uomId", uomId);
    // if (img instanceof File) formData.append("img", img);
    if (img instanceof File) {
      formData.append("img", img);
    } else if (img === null) {
      formData.append("img", "");
    }
    if (id) {
      handleSubmitCustom(updateData, formData, "Updated", true);
    } else {
      handleSubmitCustom(addData, formData, "Added", true);
    }
  };
  const handleKeyDown = (event) => {
    let charCode = String.fromCharCode(event.which).toLowerCase();
    if ((event.ctrlKey || event.metaKey) && charCode === "s") {
      event.preventDefault();
      saveData();
    }
  };

  // function getImageUrlPath(fileName) {
  //   return setImagePreview(getImageUrlPath(data.fabricImage));
  // }

  const syncFormWithDb = useCallback(
    (data) => {
      // if (id) setReadOnly(true);
      setName(data?.name ? data.name : "");
      setAlias(data?.alias ? data?.alias : "");
      setSku(data?.sku ? data?.sku : "");
      setActive(id ? (data?.active ? data.active : false) : true);
      setImg(data?.img ? getImageUrlPath(data?.img) : "");
      setSizeTemplateId(data?.sizeTemplateId ? data?.sizeTemplateId : "");
      setFabricId(data?.fabricId ? data?.fabricId : "");
      setStyleItemId(data?.styleItemId ? data?.styleItemId : "");
      setPrice(data?.price ? data?.price : "");
      setSalesPrice(data?.salesPrice ? data?.salesPrice : "");
      setHsnId(data?.hsnId ? data?.hsnId : "");
      setUomId(data?.uomId ? data?.uomId : "");
      childRecord.current = data?.childRecord ? data?.childRecord : 0;
    },
    [id],
  );

  useEffect(() => {
    syncFormWithDb(singleData?.data);
  }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);

  useEffect(() => {
    if (form && !readOnly && styleNameRef.current) {
      styleNameRef.current.focus();
    }
  }, [form, readOnly]);

  const onNew = () => {
    setId("");
    setForm(true);
    syncFormWithDb(undefined);
    setReadOnly(false);
  };

  const handleView = (id) => {
    setId(id);
    setForm(true);
    setReadOnly(true);
  };

  const handleEdit = (id) => {
    setId(id);
    setForm(true);
    setReadOnly(false);
  };

  const ACTIVE = (
    <div className="bg-gradient-to-r from-green-200 to-green-500 inline-flex items-center justify-center rounded-full border-2 w-6 border-green-500 shadow-lg text-white hover:scale-110 transition-transform duration-300">
      <Power size={10} />
    </div>
  );
  const INACTIVE = (
    <div className="bg-gradient-to-r from-red-200 to-red-500 inline-flex items-center justify-center rounded-full border-2 w-6 border-red-500 shadow-lg text-white hover:scale-110 transition-transform duration-300">
      <Power size={10} />
    </div>
  );

  const columns = [
    {
      header: "S.No",
      accessor: (item, index) => parseInt(index) + parseInt(1),
      className: "font-medium text-gray-900 text-center w-[10px] py-1",
      search: "",
    },
    {
      header: "Style Code",
      accessor: (item) => item.sku,
      className: "font-medium text-gray-900  w-[150px]  py-1  px-2",
      search: "SKU",
      value: searchSku,
      setValue: setSearchSku,
    },
    {
      header: "Style Name",
      accessor: (item) => item?.StyleItem?.name,
      className: "font-medium text-gray-900 w-[250px]  py-1  px-2",
      search: "Name",
      value: searchName,
      setValue: setSearchName,
    },
    {
      header: "Fabric Name",
      accessor: (item) => item?.Fabric?.name,
      className: "font-medium text-gray-900 w-[250px]  py-1  px-2",
      search: "Fabric",
    },
    {
      header: "Status",
      accessor: (item) => (item.active ? ACTIVE : INACTIVE),
      className: "font-medium text-gray-900 text-center w-[10px] py-1",
      search: "",
    },
  ];

  const handleDelete = async (id) => {
    if (id) {
      const data = allData?.data?.find((item) => item.id === id);
      if (!window.confirm("Are you sure to delete...?")) {
        return;
      }
      if (data?.childRecordStock > 0) {
        Swal.fire({
          icon: "error",
          title: "Child record in Opening Stock",
          text: "Data cannot be deleted!",
        });
      } else if (data?.childRecordPurchase > 0) {
        Swal.fire({
          icon: "error",
          title: "Child record in Purchase Inward",
          text: "Data cannot be deleted!",
        });
      } else {
        try {
          let deldata = await removeData(id).unwrap();
          if (deldata?.statusCode === 1) {
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
          setForm(false);
        } catch (error) {
          Swal.fire({
            icon: "error",
            title: "Submission error",
            text: error.data?.message || "Something went wrong!",
          });
          setForm(false);
        }
      }
    }
  };

  const handleSubmitCustom = async (callback, data, text) => {
    try {
      let returnData;
      if (text === "Updated") {
        returnData = await callback({ id, body: data }).unwrap();
      } else {
        returnData = await callback(data).unwrap();
      }
      setId(returnData.data.id);
      Swal.fire({
        title: text + "  " + "Successfully",
        icon: "success",
        draggable: true,
        timer: 1000,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });
      setForm(false);
    } catch (error) {
      console.log("handle");
    }
  };

  return (
    <div onKeyDown={handleKeyDown} className="p-1 bg-[#F1F1F0] h-[85%]">
      <div className="flex flex-col sm:flex-row justify-between bg-white py-1 px-1 items-start sm:items-center mb-4 gap-x-4 rounded-tl-lg rounded-tr-lg shadow-sm border border-gray-200">
        <h5 className="text-xl font-bold font-segoe text-gray-800 ">
          Style Master
        </h5>
        <div className="flex items-center">
          <button
            onClick={() => {
              if (
                !hasPermission(() => {
                  setForm(true);
                  onNew();
                }, "create")
              )
                return;
            }}
            className="bg-white border font-segoe border-green-600 text-green-600 hover:bg-green-700 hover:text-white text-sm px-2  rounded-md shadow transition-colors duration-200 flex items-center gap-2"
          >
            + Add New Style
          </button>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {/* <ReusableTable
          columns={columns}
          data={allData?.data || []}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          itemsPerPage={10}
        /> */}
        <StyleReport
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          itemsPerPage={10}
        />
      </div>
      {form && (
        <Modal
          isOpen={form}
          form={form}
          widthClass={"w-[1000px] h-[450px]"}
          onClose={() => {
            setForm(false);
          }}
        >
          <div className="h-full flex flex-col bg-gray-100">
            <div className="border-b py-2 px-4 mx-3 mt-4  flex justify-between items-center sticky top-0 z-10 bg-white">
              <div className="flex items-center gap-2">
                <h2 className="text-lg px-2 py-0.5 font-semibold text-gray-800">
                  {id
                    ? !readOnly
                      ? "Edit Style  "
                      : "Style Master "
                    : "Add New Style "}
                </h2>
              </div>
              <div className="flex gap-2">
                <div>
                  {readOnly && (
                    <button
                      type="button"
                     onClick={() => {
                          if (
                            !hasPermission(() => {
                              setReadOnly(false);
                            }, "edit")
                          )
                            return;
                        }}
                      className="px-3 py-1 text-red-600 hover:bg-red-600 hover:text-white border border-red-600 text-xs rounded"
                    >
                      Edit
                    </button>
                  )}
                </div>
                <div className="flex gap-2">
                  {!readOnly && (
                    <button
                      type="button"
                      onClick={saveData}
                      className="px-3 py-1 hover:bg-green-600 hover:text-white rounded text-green-600 
                                        border border-green-600 flex items-center gap-1 text-xs"
                    >
                      <Check size={14} />
                      {id ? "Update" : "Save"}
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-3">
              <div className="grid grid-cols-1  gap-3  h-full">
                <div className="lg:col-span- space-y-3">
                  <div className="bg-white p-3 rounded-md border border-gray-200 h-full">
                    <fieldset className="flex rounded mt-2 gap-6">
                      <div>
                        <div className="grid md:grid-cols-3 gap-x-5 gap-y-1">
                          <div className="mb-3 w-48">
                            <TextInput
                              name="Style code"
                              type="text"
                              value={sku}
                              setValue={setSku}
                              required={true}
                              readOnly={readOnly}
                              ref={styleNameRef}
                              disabled={childRecord.current > 0}
                            />
                          </div>
                          <div className="mb-3 w-48">
                            <DropdownInput
                              name="Style Item Name"
                              options={
                                styleItemList
                                  ? dropDownListObject(
                                      id
                                        ? styleItemList?.data
                                        : styleItemList?.data?.filter(
                                            (item) => item.active,
                                          ),
                                      "name",
                                      "id",
                                    )
                                  : []
                              }
                              value={styleItemId}
                              setValue={setStyleItemId}
                              required={false}
                              readOnly={readOnly}
                              // disabled={childRecord.current > 0}
                            />
                          </div>
                          <div className="mb-5 w-48">
                            <TextInput
                              name="Alias Name"
                              type="text"
                              value={alias}
                              setValue={setAlias}
                              required={false}
                              readOnly={readOnly}
                              disabled={childRecord.current > 0}
                            />
                          </div>
                          <div className="mb-5 w-48">
                            <DropdownInput
                              name="Fabric"
                              options={
                                fabricList
                                  ? dropDownListObject(
                                      id
                                        ? fabricList?.data
                                        : fabricList?.data?.filter(
                                            (item) => item.active,
                                          ),
                                      "name",
                                      "id",
                                    )
                                  : []
                              }
                              value={fabricId}
                              setValue={setFabricId}
                              required={true}
                              readOnly={readOnly}
                              disabled={childRecord.current > 0}
                            />
                          </div>
                          <div className="mb-5 w-48">
                            <DropdownInput
                              name="Size Template"
                              options={
                                sizeTemplateList
                                  ? dropDownListObject(
                                      id
                                        ? sizeTemplateList?.data
                                        : sizeTemplateList?.data?.filter(
                                            (item) => item.active,
                                          ),
                                      "name",
                                      "id",
                                    )
                                  : []
                              }
                              value={sizeTemplateId}
                              setValue={setSizeTemplateId}
                              required={true}
                              readOnly={readOnly}
                            />
                          </div>
                          <div className="mb-5 w-48">
                            <TextInput
                              name="Purchase Rate"
                              type="number"
                              value={price}
                              setValue={setPrice}
                              required={false}
                              readOnly={readOnly}
                            />
                          </div>
                          <div className="mb-5 w-48">
                            <TextInput
                              name="Sales Rate"
                              type="number"
                              value={salesPrice}
                              setValue={setSalesPrice}
                              required={false}
                              readOnly={readOnly}
                            />
                          </div>
                          <div className="mb-5 w-48">
                            <DropdownInput
                              name="HSN"
                              options={
                                hsnList
                                  ? dropDownListObject(
                                      id
                                        ? hsnList?.data
                                        : hsnList?.data?.filter(
                                            (item) => item.active,
                                          ),
                                      "name",
                                      "id",
                                    )
                                  : []
                              }
                              value={hsnId}
                              setValue={setHsnId}
                              required={false}
                              readOnly={readOnly}
                              // disabled={childRecord.current > 0}
                            />
                          </div>
                          <div className="mb-5 w-48">
                            <DropdownInput
                              name="UOM"
                              options={
                                uomList
                                  ? dropDownListObject(
                                      id
                                        ? uomList?.data
                                        : uomList?.data?.filter(
                                            (item) => item.active,
                                          ),
                                      "name",
                                      "id",
                                    )
                                  : []
                              }
                              value={uomId}
                              setValue={setUomId}
                              required={true}
                              readOnly={readOnly}
                              // disabled={childRecord.current > 0}
                            />
                          </div>
                        </div>
                        <div className="mb-5 w-48">
                          <ToggleButton
                            name="Status"
                            options={statusDropdown}
                            value={active}
                            setActive={setActive}
                            required={true}
                            readOnly={readOnly}
                          />
                        </div>
                      </div>
                      <div className="flex mx-auto">
                        <BrowseSingleImage
                          picture={img}
                          setPicture={setImg}
                          readOnly={readOnly}
                        />
                      </div>
                    </fieldset>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default StyleMaster;
