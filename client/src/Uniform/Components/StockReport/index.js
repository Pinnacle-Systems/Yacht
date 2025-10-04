import StockReport from "./StockReport";

export default function form() {
  return (
    <div className="p-1 bg-[#F1F1F0] h-[85%]">
      <div className="flex flex-col sm:flex-row justify-between bg-white py-1 px-1 items-start sm:items-center mb-4 gap-x-4 rounded-tl-lg rounded-tr-lg shadow-sm border border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-800"> Stock Report</h1>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden  ">
        <StockReport
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          itemsPerPage={10}
        />
      </div>
    </div>
  );
}
