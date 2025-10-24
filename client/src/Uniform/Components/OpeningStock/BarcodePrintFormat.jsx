import React, { useEffect } from "react";
import { Document, Page, View, PDFViewer, Text } from "@react-pdf/renderer";
import tw from "../../../Utils/tailwind-react-pdf";
import BarcodeGenerator from "../BarcodeGenerator";
import { useGetStyleMasterQuery } from "../../../redux/uniformService/StyleMasterService";
import { useGetSizeMasterQuery } from "../../../redux/uniformService/SizeMasterService";
import { findFromList } from "../../../Utils/helper";
import { useGetStyleItemMasterQuery } from "../../../redux/uniformService/StyleItemMasterService";
import secureLocalStorage from "react-secure-storage";

const mmToPt = (mm) => (mm / 25.4) * 72; // conversion helper

const chunkArray = (arr, size) => {
  const result = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
};

const BarCodePrintFormat = ({
  data,
   // 3 columns × 8 rows = 24 labels per A4 landscape section
  labelConfig = {
    labelWidth: 25, // mm
    labelHeight: 20, // mm
    stickersPerRow: 3,
    horizontalGap: 0, // mm
    verticalGap: 0, // mm
  },
}) => {
  const barCodePerPage = 18
  const params = {
    companyId: secureLocalStorage.getItem(
      sessionStorage.getItem("sessionId") + "userCompanyId"
    ),
  };

  const { data: styleItemList } = useGetStyleItemMasterQuery({ params });
  const { data: sizeList } = useGetSizeMasterQuery({ params });

  // ✅ Flatten all barcodes
  const allBarcodes = data.flatMap((item) =>
    Array.from({ length: parseInt(item?.qty || 0) }, () => ({
      barCode: item.barCode,
      styleNo: item.styleNo,
      styleName: findFromList(item.styleItemId, styleItemList?.data, "name"),
      sizeName: findFromList(item.sizeId, sizeList?.data, "name"),
    }))
  );

  const chunks = chunkArray(allBarcodes, barCodePerPage);

  const {
    labelWidth,
    labelHeight,
    stickersPerRow,
    horizontalGap,
    verticalGap,
  } = labelConfig;

  // Convert mm → pt
  const labelWidthPt = mmToPt(labelWidth);
  const labelHeightPt = mmToPt(labelHeight);
  const gapX = mmToPt(horizontalGap);
  const gapY = mmToPt(verticalGap);

  // 👇 TVS LP 46 Lite printable area (approx)
  // 4-inch width = 101.6 mm, 6-inch height = 152.4 mm
  const pageWidthPt = mmToPt(101.6);
  const pageHeightPt = mmToPt(152.4);

  useEffect(() => {
    console.log("Barcode Data:", allBarcodes);
  }, [data]);

  return (
    <PDFViewer style={tw("h-full w-full")}>
      <Document>
        {chunks.map((chunk, pageIdx) => (
          <Page
            key={pageIdx}
            size={{ width: pageWidthPt, height: pageHeightPt }}
            orientation="portrait"
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "flex-start",
              paddingHorizontal: 10,
              paddingVertical: 10,
              gap: gapX,
            }}
          >
            {chunk.map((code, i) => (
              <View
                key={i}
                style={{
                  width: labelWidthPt,
                  height: labelHeightPt,
                  border: "0.5pt solid #aaa",
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: gapY,
                  padding: 2,
                }}
              >
                <BarcodeGenerator
                  value={code.barCode}
                  width={labelWidthPt * 0.85}
                  height={labelHeightPt * 0.5}
                />
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    width: "100%",
                    marginTop: 2,
                    paddingHorizontal: 2,
                  }}
                >
                  <Text style={tw("text-[5px]")}>Style: {code.styleNo}</Text>
                  <Text style={tw("text-[5px]")}>Size: {code.sizeName}</Text>
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
