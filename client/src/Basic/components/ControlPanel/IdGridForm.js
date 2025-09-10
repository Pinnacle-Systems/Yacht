import React, { useState, useEffect } from 'react'
import secureLocalStorage from 'react-secure-storage';
import { toast } from 'react-toastify';
import { EditButtonOnly } from '../../../Buttons';
import { prefixCategory } from '../../../Utils/DropdownData';
import { useGetBranchQuery, useUpdateManyBranchMutation} from '../../../redux/services/BranchMasterService';

const BranchEmployeeIdSettingsGridForm = () => {
  const [branches, setBranches] = useState([])
  const params = {companyId: secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + "userCompanyId")}
  const { data: branchesData, isLoading, isFetching } = useGetBranchQuery(params)
  const [updateMany] = useUpdateManyBranchMutation();


  useEffect(()=>{
    if(branchesData){
      let br = structuredClone(branchesData.data)
      setBranches(br.map(branch => {branch["disabled"]= true; return branch}));
    }
  },[isLoading, isFetching])


  const handleInputChange = (event, index, field) => {
    const value = event.target.value;
    const newbranches = [...branches];
    newbranches[index][field] = value;
    if (newbranches[index]["prefixCategory"] === "Default") {
      newbranches[index]["tempPrefix"] = "";
      newbranches[index]["tempSequence"] = "";
    }
    setBranches(newbranches);
  };

  const saveBranchDetails = async() => {
    await updateMany({branches, companyId: secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + "userCompanyId")})
    toast.success("Settings Saved");
  }

  const handleOnEdit = (employees, index) => {
    console.log("employee", employees.length !== 0);
    if (employees.length !== 0) {
      toast.info("Employees Already created!", { position: "top-center" });
      return;
    }
    handleInputChange({ target: { value: false } }, index, "disabled");
  }

  return (
    <div className="container mx-auto col-span-7">
      <div className="p-8">
        <table className="w-full text-xs">
          {console.log(branches, "branches")}
          <thead>
            <tr className='sub-heading'>
              <th className="text-left">Branch Name</th>
              <th className="text-left">Category</th>
              <th className="text-left">Prefix</th>
              <th className="text-left">Sequence</th>
              <th className="text-left">Temp Prefix</th>
              <th className="text-left">Temp Sequence</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {branches.map((row, index) => (
              <tr key={index}>
                <td>
                  <input
                    disabled={true}
                    type="text"
                    className="border rounded px-4 py-2 w-full"
                    value={row.branchName}
                  />
                </td>
                <td>
                  <select
                    className="border rounded px-4 py-2 w-full"
                    value={row.prefixCategory}
                    disabled={row.disabled}
                    onChange={(event) => handleInputChange(event, index, "prefixCategory")}
                  >
                    <option value="" className='text-sm' hidden>Select</option>
                    {prefixCategory.map((category) =>
                      <option key={category.value} value={category.value}>{category.show}</option>
                    )}
                  </select>
                </td>
                <td>
                  <input
                    type="text"
                    className="border rounded px-4 py-2 w-full"
                    value={row.idPrefix}
                    disabled={row.disabled ? true : row.prefixCategory === ""}
                    onChange={(event) =>
                      handleInputChange(event, index, "idPrefix")
                    }
                  />
                </td>
                <td>
                  <input
                    type="text"
                    className="border rounded px-4 py-2 w-full"
                    value={row.idSequence}
                    disabled={row.disabled ? true : row.prefixCategory === ""}
                    onChange={(event) =>
                      handleInputChange(event, index, "idSequence")
                    }
                  />
                </td>
                <td>
                  <input
                    type="text"
                    className="border rounded px-4 py-2 w-full"
                    value={row.tempPrefix}
                    disabled={row.disabled ? true : row.prefixCategory === "Default"}
                    onChange={(event) =>
                      handleInputChange(event, index, "tempPrefix")
                    }
                  />
                </td>
                <td>
                  <input
                    type="text"
                    className="border rounded px-4 py-2 w-full"
                    value={row.tempSequence}
                    disabled={row.disabled ? true : row.prefixCategory === "Default"}
                    onChange={(event) =>
                      handleInputChange(event, index, "tempSequence")
                    }
                  />
                </td>
                <td>
                  <div className='text-sm flex justify-end '> <EditButtonOnly onClick={() => { handleOnEdit(row.Employee, index) }} /></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className='flex p-2'>
          <button
            onClick={() => saveBranchDetails()}
            type="button"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}

export default BranchEmployeeIdSettingsGridForm;