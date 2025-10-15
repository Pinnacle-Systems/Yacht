import React, { useEffect } from "react";
import { Document, Page, View, PDFViewer, Text } from "@react-pdf/renderer";
import tw from "../../../Utils/tailwind-react-pdf";
import BarcodeGenerator from "../BarcodeGenerator";
import { useGetStyleMasterQuery } from "../../../redux/uniformService/StyleMasterService";
import { useGetSizeMasterQuery } from "../../../redux/uniformService/SizeMasterService";
import { findFromList } from "../../../Utils/helper";
import { useGetStyleItemMasterQuery } from "../../../redux/uniformService/StyleItemMasterService";
import secureLocalStorage from "react-secure-storage";

const chunkArray = (arr, size) => {
  const result = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
};

const BarCodePrintFormat = ({ data, barCodePerPage = 10 }) => {
  const params = {
    companyId: secureLocalStorage.getItem(
      sessionStorage.getItem("sessionId") + "userCompanyId"
    ),
  };

  const { data: styleItemList } = useGetStyleItemMasterQuery({ params });
  const { data: sizeList } = useGetSizeMasterQuery({ params });

  // ✅ flatten all barcodes from all items
  const allBarcodes = data.flatMap((item) =>
    Array.from({ length: parseInt(item?.qty || 0) }, () => ({
      barCode: item.barCode,
      styleNo: item.styleNo,
      styleName: findFromList(item.styleItemId, styleItemList?.data, "name"),
      sizeName: findFromList(item.sizeId, sizeList?.data, "name"),
    }))
  );

  // ✅ split into pages
  const chunks = chunkArray(allBarcodes, barCodePerPage);

  useEffect(() => {
    console.log(data, "allBarcodes");
  }, [data]);

  return (
    <PDFViewer style={tw("h-full w-full")}>
      <Document>
        {chunks.map((chunk, pageIdx) => (
          <Page
            size="A4"
            key={pageIdx}
            style={tw("flex flex-row flex-wrap gap-5 justify-center")}
          >
            <Text
              render={({ pageNumber, totalPages }) =>
                `${pageNumber} / ${totalPages}`
              }
              fixed
            />
            {chunk.map((code, i) => (
              <View key={i} style={tw("p-2")}>
                <BarcodeGenerator value={code.barCode} />
                <View style={tw("flex flex-row gap-20 px-2 mt-1")}>
                  <Text style={tw("text-sm")}>
                    Style No: {code.styleNo || ""}
                  </Text>
                  <Text style={tw("text-sm ")}>Size: {code.sizeName || ""}</Text>
                </View>
              </View>
            ))}
          </Page>
        ))}
      </Document>
    </PDFViewer>
  );
};

export default BarCodePrintFormat;
