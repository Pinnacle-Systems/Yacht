import React, { useEffect } from "react";
import { Document, Page, View, PDFViewer, Text } from "@react-pdf/renderer";
import tw from "../../../Utils/tailwind-react-pdf";
import BarcodeGenerator from "../BarcodeGenerator";
import { useGetSizeMasterQuery } from "../../../redux/uniformService/SizeMasterService";
import { useGetStyleItemMasterQuery } from "../../../redux/uniformService/StyleItemMasterService";
import secureLocalStorage from "react-secure-storage";
import { findFromList } from "../../../Utils/helper";

const BarCodePrintFormatThermal = ({ data }) => {
  const params = {
    companyId: secureLocalStorage.getItem(
      sessionStorage.getItem("sessionId") + "userCompanyId"
    ),
  };

  const { data: styleItemList } = useGetStyleItemMasterQuery({ params });
  const { data: sizeList } = useGetSizeMasterQuery({ params });

  // ✅ Expand each item into multiple labels based on qty
  const allBarcodes = data.flatMap((item) =>
    Array.from({ length: parseInt(item?.qty || 0) }, () => ({
      barCode: item.barCode,
      styleNo: item.styleNo,
      styleName: findFromList(item.styleItemId, styleItemList?.data, "name"),
      sizeName: findFromList(item.sizeId, sizeList?.data, "name"),
    }))
  );

  useEffect(() => {
    console.log("Thermal barcode data:", allBarcodes);
  }, [data]);

  return (
    <PDFViewer style={tw("h-full w-full")}>
      <Document>
        {allBarcodes.map((code, i) => (
          <Page
            key={i}
            // ✅ Custom size for 50mm x 25mm sticker (in points: 1mm ≈ 2.83465)
            size={{ width: 142, height: 71 }} // ~50mm x 25mm
            style={tw(
              "flex flex-col justify-center items-center p-1 border border-gray-200"
            )}
          >
            <View style={tw("flex justify-center items-center")}>
              <BarcodeGenerator value={code.barCode} width={100} height={30} />
            </View>
            <View style={tw("flex flex-row justify-between w-full px-1 mt-1")}>
              <Text style={tw("text-[8px] leading-none")}>
                Style: {code.styleNo || ""}
              </Text>
              <Text style={tw("text-[8px] leading-none")}>
                Size: {code.sizeName || ""}
              </Text>
            </View>
          </Page>
        ))}
      </Document>
    </PDFViewer>
  );
};

export default BarCodePrintFormatThermal;
