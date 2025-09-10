import { useCallback, useState } from 'react';
import { FaPlus, FaChevronLeft, FaChevronRight } from "react-icons/fa";
// import Manufacture from './Manufacture';
import CommonTable from '../common/CommonTable';
import { useAddStyleSheetMutation, useUpdateStyleSheetMutation, useGetStyleSheetQuery, useGetStyleSheetByIdQuery, useDeleteStyleSheetMutation } from "../../../redux/services/StyleSheet";
import { findFromList, params } from "../../../Utils/helper";
// import Fds from './Fds'
import OrderForm from './OrderForm'
import { FaFileAlt } from 'react-icons/fa';
import { useDeleteOrderMutation, useGetOrderByIdQuery, useGetOrderQuery } from '../../../redux/uniformService/OrderService';
import { useGetPartyQuery } from '../../../redux/services/PartyMasterService';
import { findDOMNode } from 'react-dom';

import { toast } from "react-toastify";
import Form from '../PurchaseOrder';
import PoForm from '../PurchaseOrder';
import Swal from 'sweetalert2';

const NewOrder = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('this-month');
  const [selectedFinYear, setSelectedFinYear] = useState('2023-2024');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showManufacturer, setShowManufacturer] = useState(false);
  const [id, setId] = useState("");
  const [mode, setMode] = useState('view')
  const [readOnly, setReadOnly] = useState(false)
  const [report, setReport] = useState(false);
  const [showPo, setShowPo] = useState(false)





  const { data: partydata } = useGetPartyQuery({ params })

  const { data: styleData } = useGetStyleSheetQuery({ params });

  const { data: orderData, refetch } = useGetOrderQuery({ params })




  const [removeData] = useDeleteOrderMutation()



 

  const handleView = (id) => {
    alert(`Viewing order ${id}`);
  };

  const handleEdit = (id) => {
    alert(`Editing order ${id}`);
  };

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
      accessor: (item) => findFromList(item.customerId, partydata?.data, "name"),
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


      {showPo ? (

        <PoForm

          partydata={partydata?.data}
          orderId={id}
          showPo={showPo}

        />


      ) :
        report ? (
          <>

            <OrderForm setReport={setReport} allData={orderData} id={id} setId={setId} readOnly={readOnly} setShowPo={setShowPo} refetch={refetch} />
          </>
        )
          : (
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
                  data={orderData?.data}
                  partydata={partydata?.data}
                  onDataClick={onDataClick}
                  setReadOnly={setReadOnly}
                  setReport={setReport}
                  handleDelete={handleDelete}
                  itemsPerPage={10}
                  setId={setId}
                  id={id}
                />




              </div>
            </>)

      }
    </>
  );
};

export default NewOrder;