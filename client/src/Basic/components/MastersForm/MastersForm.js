import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import {
  NewButton,
  SaveButton,
  EditButton,
  DeleteButton,
  CloseButton,
  PrintButtonOnly,
  SearchButton,
  OpenTable
} from "../../../UiComponents/Buttons/Buttons";
import toast from "react-hot-toast";
import secureLocalStorage from "react-secure-storage";
import { useGetPagePermissionsByIdQuery } from "../../../redux/services/PageMasterService";




const MastersForm = ({
  model,
  saveData,
  setReadOnly,
  deleteData,
  onClose = null,
  onSearch = null,
  onNew,
  childRecord = 0,
  onPrint = null,
  openReport = null,
  childRecordValidationActions = ["edit", "delete"],
  children,
  readOnly,
  emptyErrors,
  newForm,
  step
}) => {


  const openTabs = useSelector((state) => state?.openTabs);

  const activeTab = openTabs?.tabs?.find(tab => tab.active);

  const currentPageId = activeTab?.id

  const userRoleId = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "userRoleId"
  );
  const {
    data: currentPagePermissions,
    isLoading,
    isFetching,
  } = useGetPagePermissionsByIdQuery({ currentPageId, userRoleId }, { skip: !(currentPageId && userRoleId) });

  const IsSuperAdmin = () => {
    return JSON.parse(
      secureLocalStorage.getItem(
        sessionStorage.getItem("sessionId") + "superAdmin"
      )
    );
  };

  const IsDefaultAdmin = () => {
    return JSON.parse(
      secureLocalStorage.getItem(
        sessionStorage.getItem("sessionId") + "defaultAdmin"
      )
    );
  };


  const isCurrentFinYearActive = () => {
    return Boolean(
      secureLocalStorage.getItem(
        sessionStorage.getItem("sessionId") + "currentFinYearActive"
      )
    );
  };

  const hasPermission = (callback, type) => {
    if (childRecordValidationActions.includes(type) && childRecord !== 0) {
      toast.error("Child Record Exists", { position: "top-center" });
      return;
    }
    if (IsSuperAdmin()) {
      callback();
    } else {
      if (isCurrentFinYearActive()) {
        if (IsDefaultAdmin()) {
          console.log("Hit Masterform")
          callback();

        } else if (currentPagePermissions?.data[type]) {
          callback();
        } else {
          toast.error(`No Permission to ${type}...!`, {
            position: "top-center",
          });
        }
      } else {
        toast.error(" Past Fin Year Only can view!", { position: "top-center" });
      }
    }
  };

  return (
    <>

      <div className="h-full p-5">

        <div className=" flex flex-col h-full ">
          <div className="mx-auto w-[95%]  flex flex-col">
            {model ? (
              <h5 className=" text-stone-900 text-xl mb-2 ">
                {model}
              </h5>
            ) : (
              <></>
            )}
            <div className="mx-0.5">
              {children}
            </div>

          </div>
          <div className="w-[95%] mx-auto flex justify-between mt-auto">
            <CloseButton onClick={() => { onClose(); emptyErrors() }} />
            {!readOnly ? <SaveButton
              onClick={() => {
                hasPermission(saveData, "edit");
              }
              }
            /> : <div className="flex items-center">
              <div className="mr-2">
                <DeleteButton
                  onClick={() => {
                    hasPermission(deleteData, "delete");
                  }}
                />
              </div>
              <div>
                <EditButton
                  onClick={() => {
                    hasPermission(setReadOnly, "edit");
                  }}
                />
              </div>

            </div>}

          </div>

        </div>

      </div>

    </>
  );
};


export default MastersForm;
