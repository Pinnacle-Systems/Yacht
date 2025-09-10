import React, { useState } from "react";
import EntryForm from "./EntryForm";
import { FaPlus } from "react-icons/fa";
import CommonTable from "../../../Uniform/Components/common/CommonTable";
import { findFromList, getCommonParams } from "../../../Utils/helper";
import {

  useGetSampleEntryQuery, useDeleteSampleEntryMutation,
} from "../../../redux/services/sampleEntryService";
import { useGetPartyQuery } from "../../../redux/services/PartyMasterService";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

const SampleEntry = () => {
  const [report, setReport] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("this-month");
  const [selectedFinYear, setSelectedFinYear] = useState("2023-2024");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [readOnly, setReadOnly] = useState(false);
  const [id, setId] = useState("");

  const { branchId } = getCommonParams();

  const params = {
    branchId,
  };

  const { data: allData} = useGetSampleEntryQuery({ params });

  const { data: partyData } = useGetPartyQuery({ params });
 
  const [removeData] = useDeleteSampleEntryMutation();
  

  console.log(allData, "allData");

  const columns = [
    {
      header: "S.No",
      accessor: (_item, index) => index + 1,
      cellClass: () => "",
      className: "font-medium text-gray-900 w-[30px]  text-center",
    },
    {
      header: "Date",
      accessor: (item) =>
        item?.date ? new Date(item?.date).toISOString().split("T")[0] : "",
      className: "text-gray-800 text-center uppercase w-16",
    },
    {
      header: "Supplier",
      accessor: (item) =>
        findFromList(item.supplierId, partyData?.data, "name"),
     
      className: "text-gray-800 text-center uppercase w-60",
    },
    {
      header: "Fabric Code",
      accessor: (item) => item?.sampleEntryGrid?.[0]?.styleSheet?.fabCode,

      className: "text-gray-800 text-center uppercase w-60",
    },
    {
      header: "",
      accessor: (_) => "",

      className: "text-gray-800 text-center uppercase w-60",
    },
  ];
  const handleDelete = async (id) => {
        if (!id) return;
        if (id) {
          if (!window.confirm("Are you sure to delete...?")) {
            return;
          }
          try {
            let deleteOrder = await removeData(id).unwrap();
            if (deleteOrder?.statusCode == 1) {
              toast.error(deleteOrder?.message);
              return;
            }
            setId("")
            Swal.fire({
              icon: 'success',
              title: `${"Deleted"} Successfully`,
              showConfirmButton: false,
              timer: 2000
            });
          } catch (error) {
            Swal.fire({
              icon: 'error',
              title: 'Submission error',
              text: error.data?.message || 'Something went wrong!',
            });
          }
        }
    };

  function onDataClick(id) {
    setId("")

    setTimeout(() => {
      setId(id)
    }, 0)
  }

  return (
    <>
      {report ? (
        <EntryForm
          readOnly={readOnly}
          partyData={partyData}
          id={id}
         
          setReport={setReport}
          setId={setId}
         
        />
      ) : (
        <>
          <div className="p-2 bg-[#F1F1F0] min-h-screen">
            <div className="flex flex-col sm:flex-row justify-between bg-white py-0.5 px-1 items-start sm:items-center mb-3 gap-4 rounded-tl-lg rounded-tr-lg shadow-sm border border-gray-200">
              <div className="flex items-center gap-2">
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="px-3 py-0.5 border rounded-md text-sm"
                >
                  <option value="this-month">This Month</option>
                  <option value="last-month">Last Month</option>
                </select>
                <select
                  value={selectedFinYear}
                  onChange={(e) => setSelectedFinYear(e.target.value)}
                  className="px-3 py-0.5 border rounded-md text-sm"
                >
                  <option value="2023-2024">2023-2024</option>
                  <option value="2022-2023">2022-2023</option>
                </select>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-3 py-0.5 border rounded-md text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="processed">Processed</option>
                </select>
              </div>
              <button
                className="hover:bg-green-700 bg-white border border-green-700 hover:text-white text-green-800 px-4 py-0.5 rounded-md flex items-center gap-2 text-sm"
                onClick={() => {
                  setReport(true);
                  setReadOnly(false);
                }}
              >
                <FaPlus /> Create New
              </button>
            </div>

            <CommonTable
              columns={columns}
              data={allData?.data}
              onDataClick={onDataClick}
              setReadOnly={setReadOnly}
              setReport={setReport}
              handleDelete={handleDelete}
              itemsPerPage={10}
              setId={setId}
              id={id}
            />
          </div>
        </>
      )}
    </>
  );
};

export default SampleEntry;
