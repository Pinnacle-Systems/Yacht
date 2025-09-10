import React, { useEffect, useState } from 'react'
// import { useGetAccessoryGroupMasterQuery } from "../../../redux/ErpServices/AccessoryGroupMasterServices";
// import { Loader } from '../../../Basic/components';
import secureLocalStorage from 'react-secure-storage';
import { useGetAccessoryGroupMasterQuery } from '../../../redux/uniformService/AccessoryGroupMasterServices';
import Loader from '../../components/Loader';


function Items({ groupsItemsList, handleItemSelect, findIfAccessoryItemAdded }) {
  function handleChange(e, id) {
    if (e.target.checked) handleItemSelect(id, "push")
    else handleItemSelect(id, "");
  }
  return (
    <div className='flex flex-col gap-3 mt-7 justify-start items-start'>
      {groupsItemsList?.map(item =>
        <div className='flex gap-3 justify-start items-center' key={item.id}>
          <input type="checkbox" checked={findIfAccessoryItemAdded(parseInt(item.id))} onChange={(e) => handleChange(e, item.id)} />
          <label className='text-sm'>{item.name}</label>
        </div>
      )}
    </div>
  )
}


function GroupComponent({ findCommonElement, group, index, groupsList, setGroupsList, itemsList, handleGroupSelect, handleItemSelect, findIfAccessoryItemAdded }) {
  let checked = groupsList[index]["active"]
  let groupsItemsList = itemsList?.filter(item => parseInt(item.accessoryGroupId) === parseInt(group.id))
  function groupDataUpdate(e) {
    let newGroupList = structuredClone(groupsList);
    newGroupList[index]["active"] = e.target.checked;
    setGroupsList(newGroupList);
    if (e.target.checked) handleGroupSelect(groupsItemsList?.map(item => item.id), "push")
    else handleGroupSelect(groupsItemsList?.map(item => item.id), "")
  }
  function groupOpenToggle(value) {
    let newGroupList = structuredClone(groupsList);
    newGroupList[index]["active"] = value;
    setGroupsList(newGroupList);
  }
  return (
    <tr className=''>
      <td className='flex gap-2 justify-start mt-7 items-start '>
        {checked ?
          <button className='bg-red-400 rounded hover:text-white hover:bg-red-700 text-lg p-2.5 py-0 pointer-events-auto' onClick={() => groupOpenToggle(false)}>-</button>
          :
          <button className='bg-lime-400 rounded hover:text-white hover:bg-lime-700 text-base p-2 py-0 pointer-events-auto' onClick={() => groupOpenToggle(true)}>+</button>
        }
        <div className='flex gap-2 justify-start items-center mt-0.5'>
          <input type="checkbox" checked={findCommonElement(groupsItemsList?.map(item => item.id))} onChange={groupDataUpdate} />
          <label className='w-36 text-sm'>{group.name}</label>
        </div>
      </td>
      <td className=''>
        {checked ? <Items handleItemSelect={handleItemSelect} groupsItemsList={groupsItemsList} findIfAccessoryItemAdded={findIfAccessoryItemAdded} /> : <></>}
      </td>
    </tr>)
}

const PartyOnItems = ({ readOnly, accessoryItemList, setAccessoryItemList, accessoryItemsMasterList, setItemsPopup }) => {
  const [groupsList, setGroupsList] = useState([])
  const companyId = secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + "userCompanyId")
  const { data, isLoading, isFetching } = useGetAccessoryGroupMasterQuery({ companyId })
  useEffect(() => {
    if (!data) return
    setGroupsList(data.data.map(g => { return { id: g.id, name: g.name, active: false } }))
  }, [data, isLoading, isFetching])
  if (isLoading || isFetching) {
    return <Loader />
  }
  function handleItemSelect(id, method) {
    let newItemsList = structuredClone(accessoryItemList);
    if (method === "push") newItemsList.push(id);
    else {
      newItemsList = newItemsList.filter(item => parseInt(item) !== parseInt(id));
    }
    setAccessoryItemList(newItemsList);
  }
  function handleGroupSelect(groupItems, text = "") {
    let newItemsList = structuredClone(accessoryItemList);
    if (text === "push") {
      setAccessoryItemList(newItemsList.concat(groupItems));
    } else {
      let toRemove = new Set(groupItems)
      setAccessoryItemList(newItemsList.filter(x => !toRemove.has(x)));
    }
  }
  function findIfAccessoryItemAdded(id) {
    return accessoryItemList.includes(id);
  }
  function findCommonElement(groupItems) {
    // Loop for array1
    let array1 = structuredClone(accessoryItemList)
    for (let i = 0; i < array1.length; i++) {

      // Loop for array2
      for (let j = 0; j < groupItems.length; j++) {

        // Compare the element of each and
        // every element from both of the
        // arrays
        if (array1[i] === groupItems[j]) {

          // Return if common element found
          return true;
        }
      }
    }

    // Return if no common element exist
    return false;
  }
  return (
    <div className={`w-full h-full ${readOnly ? "pointer-events-none" : ""}`}>
      <h1 className='text-center font-semibold text-lg'>Accessory Items</h1>
      <table className='mt-5 mb-5'>
        <thead>
          <tr>
            <th className='text-left'>
              Group
            </th>
            <th className='w-36 text-left'>
              Items
            </th>
          </tr>
        </thead>
        <tbody>
          {groupsList?.map((group, index) => <GroupComponent key={group.id} findCommonElement={findCommonElement} findIfAccessoryItemAdded={findIfAccessoryItemAdded} handleItemSelect={handleItemSelect} handleGroupSelect={handleGroupSelect} itemsList={accessoryItemsMasterList?.data} index={index} groupsList={groupsList} group={group} setGroupsList={setGroupsList} />)}
        </tbody>
      </table>
      <button onClick={() => setItemsPopup(false)} className={`${readOnly ? "hidden" : ""} w-20 h-8 rounded mx-52 font-semibold bg-lime-400 hover:text-white hover:bg-lime-700`}>Done</button>
    </div>
  )
}

export default PartyOnItems