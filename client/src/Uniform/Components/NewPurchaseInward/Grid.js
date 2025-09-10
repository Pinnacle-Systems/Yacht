const Grid = ({ index, id, item, actualQuantity, handleChange }) => {
  const gridToShow = item?.purchaseInwardEntrySubGrid?.length
    ? item.purchaseInwardEntrySubGrid
    : item?.poSubGrid || [];

  const totalQuantity = gridToShow?.reduce(
    (sum, sub) => sum + (parseFloat(sub?.quantity) || 0),
    0
  );

  const totalActualQuantity = gridToShow?.reduce(
    (acc, sub) => acc + (parseFloat(sub?.actualQuantity) || 0),
    0
  );

  return (
    // <>
    //   {item?.poSubGrid?.map((sub, subIndex) => (
    //     <tr key={subIndex}>
    //       {subIndex === 0 && (
    //         <>
    //           <td
    //             rowSpan={item?.poSubGrid.length}
    //             className="border text-xs text-center align-middle"
    //           >
    //             {index + 1}
    //           </td>
    //           <td
    //             rowSpan={item?.poSubGrid.length}
    //             className="border text-xs text-center align-middle"
    //           >
    //             {item.fabCode}
    //           </td>
    //           <td
    //             rowSpan={item?.poSubGrid.length}
    //             className="border text-xs text-center align-middle"
    //           >
    //             {sub?.fabType}
    //           </td>
    //           <td
    //             rowSpan={item?.poSubGrid.length}
    //             className="border text-xs text-center align-middle"
    //           >
    //             {sub?.fiberContent}
    //           </td>
    //         </>
    //       )}

    //       <td className="border text-xs text-center">
    //         {sub.color?.name || "-"}
    //       </td>
    //       <td className="border text-xs text-center">
    //         {sub?.UnitOfMeasurement?.name || "-"}
    //       </td>
    //       <td className="border text-xs  pr-1 text-right">
    //         {/* {sub?.quantity.toFixed(3)} */}
    //         {sub.quantity ? Number(sub.quantity).toFixed(3) : "0.000"}
    //       </td>
    //       <td className="border border-gray-200 p-1">
    //         <input
    //           type="number"
    //           className="ml-10 rounded px-1 w-16 py-0.5 focus:outline-none text-xs pr-3 text-right"
    //           value={sub?.actualQuantity}
    //           onChange={(e) => {
    //             const val = e.target.value;
    //             handleChange(val, index, subIndex);
    //           }}
    //           placeholder="0.000"
    //         />
    //       </td>
    //     </tr>
    //   ))}
    //   <tr>
    //     <td colSpan={6} className="text-right py-2 border text-sm font-semibold pr-2">
    //       Total Quantity
    //     </td>
    //     <td className="text-sm pr-1 py-2 border  text-right font-semibold">
    //       {totalQuantity?.toFixed(3)}
    //     </td>
    //     <td className="text-sm pr-5  py-2  border text-right font-semibold">
    //       {totalActualQuantity?.toFixed(3)}
    //     </td>
    //   </tr>
    // </>
    <>
      {console.log("GridToShow:", gridToShow)}
      {console.log("Rendering item:", item)}

      {gridToShow.map((sub, subIndex) => (
        <tr key={subIndex}>
          {subIndex === 0 && (
            <>
              <td
                rowSpan={gridToShow.length}
                className="border text-xs text-center align-middle"
              >
                {index + 1}
              </td>
              <td
                rowSpan={gridToShow.length}
                className="border text-xs text-center align-middle"
              >
                {item.fabCode || "--"}
              </td>
              <td
                rowSpan={gridToShow.length}
                className="border text-xs text-center align-middle"
              >
                {sub?.fabType}
              </td>
              <td
                rowSpan={gridToShow.length}
                className="border text-xs text-center align-middle"
              >
                {sub?.fiberContent}
              </td>
            </>
          )}

          <td className="border text-xs text-center">
            {sub.color?.name || "-"}
          </td>
          <td className="border text-xs text-center">
            {sub?.UnitOfMeasurement?.name || "-"}
          </td>
          <td className="border text-xs pr-1 text-right">
            {sub.quantity ? Number(sub.quantity).toFixed(3) : "0.000"}
          </td>
          <td className="border border-gray-200 p-1">
            <input
              type="number"
              className="ml-10 rounded px-1 w-16 py-0.5 focus:outline-none text-xs pr-3 text-right"
              value={sub?.actualQuantity || ""}
              onChange={(e) => {
                const val = e.target.value;
                handleChange(
                  val === "" ? "" : parseFloat(val),
                  index,
                  subIndex,
                  "actualQuantity"
                );
              }}
              placeholder="0.000"
            />
          </td>
        </tr>
      ))}
      <tr>
        <td
          colSpan={6}
          className="text-right py-2 border text-sm font-semibold pr-2"
        >
          Total Quantity
        </td>
        <td className="text-sm pr-1 py-2 border text-right font-semibold">
          {totalQuantity?.toFixed(3)}
        </td>
        <td className="text-sm pr-5 py-2 border text-right font-semibold">
          {totalActualQuantity?.toFixed(3)}
        </td>
      </tr>
    </>
  );
};

export default Grid;
