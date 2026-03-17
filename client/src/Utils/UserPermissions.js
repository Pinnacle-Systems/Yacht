import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import secureLocalStorage from "react-secure-storage";
import Swal from "sweetalert2";
import { useGetPagePermissionsByIdQuery } from "../redux/services/PageMasterService";
import { childRecordCount } from "../Inputs";



export function UserPermissions() {



  const openTabs = useSelector((state) => state.openTabs);
  const activeTab = openTabs?.tabs?.find(tab => tab.active);
  const currentPageId = activeTab?.id

  const userRoleId = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "userRoleId"
  );
 
  const {
    data:
    currentPagePermissions,
    isLoading,
    isFetching,
  } = useGetPagePermissionsByIdQuery({ currentPageId, userRoleId }, { skip: !(currentPageId && userRoleId) });
 console.log(currentPagePermissions,"currentPagePermissions")
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


  const hasPermission = (callback, type, childRecord) => {

    const childRecordValidationActions = [ "delete"]

    // if (childRecordValidationActions?.includes(type) && childRecordCount(childRecord)) {
    //   Swal.fire({
    //     title: `Child Record Exists`,
    //     icon: "warning",
    //   });
    //   return;
    // }
    console.log(currentPagePermissions?.data,"currentPagePermissions?.data[type]")
    if (IsSuperAdmin()) {
      callback();
    } else {
      if (isCurrentFinYearActive()) {
        if (IsDefaultAdmin()) {
          callback();
        } else if (currentPagePermissions?.data[type]) {
          callback();
        } else {
          Swal.fire({
            title: `No Permission to ${type == "create" ? "Add" : type}...!`,
            icon: "warning",
          });
          return;
        }
      } else {
        Swal.fire({
          title: `Past Fin Year Only can view!", { position: "top-center" }`,
          icon: "warning",
        });
      }
    }
  };


  return {
    hasPermission
  }


}

