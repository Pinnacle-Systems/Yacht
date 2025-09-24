import React from "react";
import { Document, Page, View, PDFViewer, Text } from "@react-pdf/renderer";
import tw from "../../../Utils/tailwind-react-pdf";
import BarcodeGenerator from "../BarcodeGenerator";

const chunkArray = (arr, size) => {
  const result = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
};

const BarCodePrintFormat = ({ data, barCodePerPage = 10 }) => {
  // ✅ flatten all barcodes from all items
  const allBarcodes = data.flatMap((item) =>
    Array.from({ length: parseInt(item?.qty || 0) }, () => item.barCode)
  );

  // ✅ split into pages
  const chunks = chunkArray(allBarcodes, barCodePerPage);

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
                <BarcodeGenerator value={code} />
              </View>
            ))}
          </Page>
        ))}
      </Document>
    </PDFViewer>
  );
};

export default BarCodePrintFormat;
