import FormHeaderNew from "../../../Basic/components/FormHeaderNew";
import { useGetOrderQuery } from "../../../redux/uniformService/OrderService";

export default function EmailReport(attachments) {



  const { data: orderData } = useGetOrderQuery({ params: { branchId:1 } });


  //   const handleClick = (item) => {
  //   setForm(true);
  
  // };


  return (

    <>

      <div className="flex  flex-col">
        <FormHeaderNew model={"Email Report"} />




      <table className="min-w-full text-left overflow-x-auto">
      <thead className="bg-gray-300 text-gray-600 uppercase text-xs leading-normal border border-black-100">
      <tr>

      <th className="py-1 px-6">po Number</th>
      <th className="py-1 px-6">From</th>
        <th className="py-1 px-6">To</th>

              <th className="py-1 px-6">Order No</th>
              <th className="py-1 px-6">MAIL</th>

      </tr>
      </thead>

      <tbody className="text-gray-700 text-xs">
      {orderData?.data?.flatMap((item) =>
      item?.mailTransaction?.map((mailTransaction, idx) => (

      <tr
      key={idx}
      className="border-b transition-all duration-300 hover:shadow-lg hover:bg-gray-300 transform table-row"
      onClick={() => {
        // handleClick();
      }}
      >        

        <td className="p-3 ">{item?.docId}</td>
        <td className="p-3 ">{mailTransaction?.senderName}</td>
        <td className="p-3 ">{mailTransaction?.receiverName}</td>
        <td className="p-3  ">{mailTransaction?.subject}</td>
        <th className="py-1 px-6"></th>

      </tr>
      ))
      )}
      </tbody>
      </table>

      </div>

    </>
  )
}