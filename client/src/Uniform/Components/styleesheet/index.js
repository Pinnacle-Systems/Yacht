import { useEffect, useState } from "react";
import { FaPlus, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import Manufacture from "./Manufacture";
import CommonTable from "../common/CommonTable";
import {
  useAddStyleSheetMutation,
  useUpdateStyleSheetMutation,
  useGetStyleSheetQuery,
  useGetStyleSheetByIdQuery,
  useDeleteStyleSheetMutation,
} from "../../../redux/services/StyleSheet";
import { params } from "../../../Utils/helper";
import Fds from "./Fds";
import { FaFileAlt } from "react-icons/fa";
import { toast } from "react-toastify";
import Swal from "sweetalert2";


const PurchaseOrders = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("this-month");
  const [selectedFinYear, setSelectedFinYear] = useState("2023-2024");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [showManufacturer, setShowManufacturer] = useState(false);
  const [id, setId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState([]);

  const [readOnly, setReadOnly] = useState(false);
  const [report, setReport] = useState(false);

  const [removeData] = useDeleteStyleSheetMutation();

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
        setId("");

        Swal.fire({
          icon: "success",
          title: `${"Deleted"} Successfully`,
          showConfirmButton: false,
          timer: 2000,
        });
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Submission error",
          text: error.data?.message || "Something went wrong!",
        });
      }
    }
  };
  const columns = [
    {
      // header: 'ID',
      // accessor: (item) => item.id,
      header: "S.No",
      accessor: (_item, index) => index + 1,
      // cellClass: () => 'font-medium text-gray-900 text-center'
      className: "font-medium text-gray-900 w-[60px]  text-center",
    },
    {
      header: "FDS Date",
      accessor: (item) => new Date(item.fdsDate).toLocaleDateString(),
      className: "text-gray-800 text-center uppercase w-16",
    },
    {
      header: "Fab Code",
      accessor: (item) => item.fabCode,
      // cellClass: () => 'text-center',
      className: "text-gray-800 text-center uppercase w-56",
    },
    {
      header: "Material Code",
      accessor: (item) => item.materialCode,
      // cellClass: () => 'text-gray-800 text-center uppercase w-56',
      className: "text-gray-800 text-center uppercase w-36",
    },
    {
      header: "Fabric Type",
      accessor: (item) => item.fabType,
      // cellClass: () => 'text-center'
      className: "text-gray-800 text-center uppercase w-36",
    },
    {
      header: "SMS MCQ",
      accessor: (item) => item.smsMcq,
      // cellClass: () => 'text-center'
      className: "text-gray-800 text-center uppercase w-36",
    },
    {
      header: "SMS MOQ",
      accessor: (item) => item.smsMoq,
      cellClass: () => "text-center",
      className: "text-gray-800 text-center uppercase w-36",
    },
    // {
    //   header: "Price FOB",
    //   accessor: (item) => item.priceFob,
    //   className: "text-gray-800 text-center uppercase w-24",
    // },
  ];

  const { data: styleData } = useGetStyleSheetQuery({ params });
  useEffect(() => {
    if (!styleData?.data) return;
    const filtered = styleData.data.filter((item) =>
      item.fabCode?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredData(filtered);
  }, [searchTerm, styleData]);

  function onDataClick(id) {
    setId(id);
  }
  return (
    <>
      {" "}
      {report ? (
        <>
          <Fds
            id={id}
            report={report}
            setId={setId}
            readOnly={readOnly}
            setReadOnly={setReadOnly}
            onDataClick={onDataClick}
            setReport={setReport}
            allData={styleData?.data}
          />
        </>
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
              
              <div className="w-60 -ml-10">
                
                <input
                  type="text"
                  placeholder="Search by FAB Code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border border-gray-300 px-8 py-1 w-72 rounded-md text-xs"
                />
                
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
              // data={styleData?.data}
              data={filteredData}
              onDataClick={onDataClick}
              readOnly={readOnly}
              setReadOnly={setReadOnly}
              setReport={setReport}
              handleDelete={handleDelete}
              itemsPerPage={10}
            />
          </div>
        </>
      )}
    </>
  );
};

export default PurchaseOrders;
