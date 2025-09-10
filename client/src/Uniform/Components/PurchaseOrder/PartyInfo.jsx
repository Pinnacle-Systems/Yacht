const PartyInfo = ({
  type,
  customerName,
  customerMobile,
  customerAddress,
  supplierName,
  supplierMobile,
  supplierAddress,
}) => {

  console.log(supplierName,"supplierName");
  
  return (
    <>
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4 text-slate-700">
          {type === "customer" ? "Customer Details" : "Supplier Details"}
        </h2>

        {type === "customer" && (
          <div className="bg-white shadow-md rounded-lg p-4 space-y-4 border border-gray-200">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-slate-600 w-16">Name</span>
              <span className="mx-1">:</span>
              <span className="text-slate-800">{customerName || "-"}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-slate-600 w-16">Mobile</span>
              <span className="mx-1">:</span>
              <span className="text-slate-800">{customerMobile || "-"}</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="font-semibold text-slate-600 w-[100px]">Address</span>
              <span className="mx-1">:</span>
              <span className="text-slate-800 whitespace-pre-line">
                {customerAddress || "-"}
              </span>
            </div>
          </div>
        )}

        {type === "supplier" && (
         <div className="bg-white shadow-md rounded-lg p-4 space-y-4 border border-gray-200">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-slate-600 w-16">Name</span>
              <span className="mx-1">:</span>
              <span className="text-slate-800">{supplierName || "-"}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-slate-600 w-16">Mobile</span>
              <span className="mx-1">:</span>
              <span className="text-slate-800">{supplierMobile || "-"}</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="font-semibold  text-slate-600 w-[90px]">Address</span>
              <span className="mx-1">:</span>
              <span className="text-slate-800 whitespace-pre-line">
                {supplierAddress || "-"}
              </span>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default PartyInfo;
