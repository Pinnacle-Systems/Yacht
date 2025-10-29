import React, { useEffect } from "react";
import { Document, Page, View, Text, PDFViewer } from "@react-pdf/renderer";
import tw from "../../../Utils/tailwind-react-pdf";
import BarcodeGenerator from "../BarcodeGenerator";
import { useGetStyleItemMasterQuery } from "../../../redux/uniformService/StyleItemMasterService";
import { useGetSizeMasterQuery } from "../../../redux/uniformService/SizeMasterService";
import { findFromList } from "../../../Utils/helper";
import secureLocalStorage from "react-secure-storage";

const mmToPt = (mm) => (mm / 25.4) * 72; // mm → pt
const chunkArray = (arr, size) => {
  const result = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
};

const BarCodePrintFormat = ({
  data,
  labelConfig = {
    labelWidth: 25, // mm
    labelHeight: 20, // mm
    stickersPerRow: 4,
    horizontalGap: 1, // mm
    verticalGap: 1, // mm
  },
}) => {
  const params = {
    companyId: secureLocalStorage.getItem(
      sessionStorage.getItem("sessionId") + "userCompanyId"
    ),
  };

  const { data: styleItemList } = useGetStyleItemMasterQuery({ params });
  const { data: sizeList } = useGetSizeMasterQuery({ params });

  // 🔁 Generate labels per quantity
  const allBarcodes = data.flatMap((item) =>
    Array.from({ length: parseInt(item?.qty || 0) }, () => ({
      barCode: item.barCode,
      styleNo: item.styleNo,
      styleName: findFromList(item.styleItemId, styleItemList?.data, "name"),
      sizeName: findFromList(item.sizeId, sizeList?.data, "name"),
    }))
  );

  const {
    labelWidth,
    labelHeight,
    stickersPerRow,
    horizontalGap,
    verticalGap,
  } = labelConfig;

  const labelWidthPt = mmToPt(labelWidth);
  const labelHeightPt = mmToPt(labelHeight);
  const gapX = mmToPt(horizontalGap);
  const gapY = mmToPt(verticalGap);

  const pageWidthPt =
    labelWidthPt * stickersPerRow + gapX * (stickersPerRow - 1);
  const pageHeightPt = labelHeightPt;

  const rows = chunkArray(allBarcodes, stickersPerRow);

  useEffect(() => {
    console.log("Barcode data:", allBarcodes);
  }, [data]);

  return (
    <PDFViewer style={tw("w-full h-full")}>
      <Document>
        {rows.map((row, rowIndex) => (
          <Page
            key={rowIndex}
            size={{ width: pageWidthPt, height: pageHeightPt }}
            style={{
              flexDirection: "row",
              justifyContent: "flex-start",
              alignItems: "center",
              padding: 0,
              gap: gapX,
            }}
          >
            {row.map((code, i) => (
              <View
                key={i}
                style={{
                  width: labelWidthPt,
                  height: labelHeightPt,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {/* 🧾 Barcode */}
                <BarcodeGenerator
                  value={code.styleNo}
                  width={labelWidthPt * 0.85}
                  height={labelHeightPt * 0.55}
                />

                {/* 🧵 Style No */}
                <Text
                  style={{
                    fontSize: 7,
                    marginTop: 1,
                    textAlign: "center",
                  }}
                >
                  { code.styleNo ? `Style: ${code.styleNo}` : ""}
                </Text>

                {/* 📏 Size */}
                <Text
                  style={{
                    fontSize: 7,
                    marginTop: 1,
                    textAlign: "center",
                  }}
                >
                  {code.sizeName ? `Size: ${code.sizeName}` : ""}
                </Text>
              </View>
            ))}
          </Page>
        ))}
      </Document>
    </PDFViewer>
  );
};

export default BarCodePrintFormat;
