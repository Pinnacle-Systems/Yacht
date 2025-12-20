// import React, { useEffect } from "react";
// import EscPosEncoder from "esc-pos-encoder";
// import secureLocalStorage from "react-secure-storage";
// import { findFromList } from "../../../Utils/helper";
// import { useGetSizeMasterQuery } from "../../../redux/uniformService/SizeMasterService";
// import { useGetStyleItemMasterQuery } from "../../../redux/uniformService/StyleItemMasterService";

// const BarCodePrintThermalRoll = ({ data ,autoPrint }) => {
//   const params = {
//     companyId: secureLocalStorage.getItem(
//       sessionStorage.getItem("sessionId") + "userCompanyId"
//     ),
//   };

//   const { data: styleItemList } = useGetStyleItemMasterQuery({ params });
//   const { data: sizeList } = useGetSizeMasterQuery({ params });

//   // Expand each item based on qty
//   const allBarcodes = data.flatMap((item) =>
//     Array.from({ length: parseInt(item?.qty || 0) }, () => ({
//       barCode: item.barCode,
//       styleNo: item.styleNo,
//       styleName: findFromList(item.styleItemId, styleItemList?.data, "name"),
//       sizeName: findFromList(item.sizeId, sizeList?.data, "name"),
//     }))
//   );

//   const printThermalLabels = async () => {
//     if (!navigator.usb) return alert("WebUSB not supported in this browser");

//     try {
//       // Let user select the printer (no vendorId needed)
//       const device = await navigator.usb.requestDevice({
//         filters: [{}], // empty filter lists all USB devices
//       });

//       await device.open();
//       await device.selectConfiguration(1);
//       await device.claimInterface(0);

//       const encoder = new EscPosEncoder();

//       for (const code of allBarcodes) {
//         encoder.initialize();
//         encoder.setJustification("center");

//         // Print barcode
//         encoder.barcode(code.barCode, "CODE128", {
//           width: 2,   // ~25mm width
//           height: 160 // ~20mm height in dots (203 DPI)
//         });

//         // Print style & size
//         encoder.text(`Style: ${code.styleNo || ""}`);
//         encoder.text(`Size: ${code.sizeName || ""}`);

//         // Feed some space between labels
//         encoder.lineFeed(3);

//         // Send to printer
//         const result = encoder.encode();
//         await device.transferOut(1, result);
//       }

//       // Cut the roll if supported
//       const cutEncoder = new EscPosEncoder();
//       cutEncoder.cut();
//       await device.transferOut(1, cutEncoder.encode());

//       await device.close();
//       alert("Labels printed successfully!");
//     } catch (err) {
//       console.error("Printing error:", err);
//       alert("Error printing labels: " + err.message);
//     }
//   };

//   useEffect(() => {
//   if (autoPrint && data.length > 0) {
//     printThermalLabels();
//   } 
// }, [autoPrint, data]);

//   return (
//     // <button
//     //   onClick={printThermalLabels}
//     //   className="px-4 py-2 bg-blue-600 text-white rounded"
//     // >
//     //   Print Thermal Labels
//     // </button>
//     <></>
//   );
// };

// export default BarCodePrintThermalRoll;
