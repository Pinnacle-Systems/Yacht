import { useState } from "react";
import { FaPlus } from "react-icons/fa";
import CommonTable from "../common/CommonTable";
import LabDipFormUi from "./LabdipFormUi";

const LabDip = () => {



  const [selectedPeriod, setSelectedPeriod] = useState('this-month');
  const [selectedFinYear, setSelectedFinYear] = useState('2023-2024');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showManufacturer, setShowManufacturer] = useState(false);
  const [id, setId] = useState("");
  const [mode, setMode] = useState('view')
  const [readOnly, setReadOnly] = useState(false)
  const [report, setReport] = useState(false);
  const [showPo, setShowPo] = useState(false)





//   const { data: partydata } = useGetPartyQuery({ params })

//   const { data: styleData } = useGetStyleSheetQuery({ params });

//   const { data: orderData, refetch } = useGetOrderQuery({ params })




//   const [removeData] = useDeleteOrderMutation()



  const sampleData = [
    {
      id: 1,
      supplier: 'Anugraha Fashion',
      contact: 'manoj - manojpinnaclesystems.co.in',
      orderNo: 'PO-2023-001',
      orderDate: '2023-07-15',
      taxable: '₹45,000',
      amount: '₹53,100',
      status: 'pending'
    },
    {
      id: 2,
      supplier: 'Jiwin Supplier',
      contact: 'tamil - tamilpinnaclesystems.co.in',
      orderNo: 'PO-2023-002',
      orderDate: '2023-07-18',
      taxable: '₹12,500',
      amount: '₹14,750',
      status: 'processed'
    },
    ...Array.from({ length: 15 }, (_, i) => ({
      id: i + 3,
      supplier: `Supplier ${i + 3}`,
      contact: `contact-${i + 3}@example.com`,
      orderNo: `PO-2023-${String(i + 3).padStart(3, '0')}`,
      orderDate: `2023-07-${String(20 + i).padStart(2, '0')}`,
      taxable: `₹${(Math.random() * 50000).toFixed(2)}`,
      amount: `₹${(Math.random() * 60000).toFixed(2)}`,
      status: Math.random() > 0.5 ? 'pending' : 'processed'
    }))
  ];

  const handleView = (id) => {
    alert(`Viewing order ${id}`);
  };

  const handleEdit = (id) => {
    alert(`Editing order ${id}`);
  };

//   const handleDelete = async (id) => {
//     if (!id) return;
//     if (id) {
//       if (!window.confirm("Are you sure to delete...?")) {
//         return;
//       }
//       try {
//         let deleteOrder = await removeData(id).unwrap();
//         if (deleteOrder?.statusCode == 1) {
//           toast.error(deleteOrder?.message);
//           return;
//         }
//         setId("")


//         Swal.fire({
//           icon: 'success',
//           title: `${"Deleted"} Successfully`,
//           showConfirmButton: false,
//           timer: 2000
//         });

//       } catch (error) {

//         Swal.fire({
//           icon: 'error',
//           title: 'Submission error',
//           text: error.data?.message || 'Something went wrong!',
//         });
//       }
//     }

//   };
  const columns = [
    {

      header: 'S.No',
      accessor: (_item, index) => index + 1,
      cellClass: () => '',
      className: 'font-medium text-gray-900 w-[60px]  text-center'
    },

    {
      header: 'ORDER NO',
      accessor: (item) => (item.docId),
      // cellClass: () => 'text-gray-800 uppercase w-72',
      className: 'text-gray-800 text-center uppercase w-40'

    },
    {
      header: 'Date',
      accessor: (item) =>
        item.orderdate
          ? new Date(item.orderdate).toISOString().split("T")[0]
          : "",

      // cellClass: () => 'text-center'
      className: 'text-gray-800 text-center uppercase w-28'
    },
    {
      header: 'Customer Name',
    //   accessor: (item) => findFromList(item.customerId, partydata?.data, "name"),
      // cellClass: () => 'text-center'
      className: 'text-gray-800 text-center uppercase w-36'
    },
    {
      header: '',
      accessor: (_) => '',
      // cellClass: () => 'font-medium text-gray-900',
      className: 'text-gray-800 uppercase w-[60%]'

    },
    // {
    //   header: 'Supplier Name',
    //   accessor: (item) => findFromList(item.supplierId, partydata?.data, "name"),
    //   cellClass: () => 'text-center'
    // },
    // {
    //   header: 'Fabric Code',
    //   accessor: (item) => findFromList(item.fabCode, orderData?.data, "fabcode"),
    //   cellClass: () => 'text-center'
    // }


  ];

  function onDataClick(id) {
    setId("")

    setTimeout(() => {
      setId(id)
    }, 0)

  }




  return (
    <>
    {report   ?  
     (
        <LabDipFormUi  
        onClose = {() => setReport(false)}

        />
    ) :  (
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
                      setReport(true)
                      setReadOnly(false)
                    
                    }}
                    
                  >
                    <FaPlus /> Create New
                  </button>
                </div>

                <CommonTable
                  columns={columns}
                //   data={orderData?.data}
                //   partydata={partydata?.data}
                  onDataClick={onDataClick}
                  setReadOnly={setReadOnly}
                  setReport={setReport}
                //   handleDelete={handleDelete}
                  itemsPerPage={10}
                  setId={setId}
                  id={id}
                />




              </div>
            </>
    )



}

  
           

      
    </>
  );
};

export default LabDip;