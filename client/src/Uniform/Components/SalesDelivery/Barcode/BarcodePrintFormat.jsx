import React, { useEffect } from "react";
import { Document, Page, View, Text, PDFViewer } from "@react-pdf/renderer";
import secureLocalStorage from "react-secure-storage";
import tw from "../../../../Utils/tailwind-react-pdf";
import BarcodeGenerator from "./BarcodeGenerator";
import { findFromList } from "../../../../Utils/helper";
import { useGetStyleItemMasterQuery } from "../../../../redux/uniformService/StyleItemMasterService";
import { useGetSizeMasterQuery } from "../../../../redux/uniformService/SizeMasterService";

const mmToPt = (mm) => (mm / 25.4) * 72; // mm → pt
const chunkArray = (arr, size) => {
  const result = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
};

const BarCodePrintFormat = ({
  data = [],
  labelConfig = {
    labelWidth: 50, // mm
    labelHeight: 25, // mm
    stickersPerRow: 2,
    horizontalGap: 2, // mm
    verticalGap: 2, // mm
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
      barcodeNo: item.barcodeNo,
      styleName: findFromList(item.styleItemId, styleItemList?.data, "name"),
      sizeName: findFromList(item.sizeId, sizeList?.data, "name"),
      rate: item.rate
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
                <Text
                  style={{
                    fontSize: 7,
                   marginBottom:1,
                    textAlign: "center",
                  }}
                >
                  YACHT
                </Text>
                {/* 🧾 Barcode */}
                <BarcodeGenerator
                  value={code.barcodeNo}
                  width={labelWidthPt * 0.9}
                  height={labelHeightPt * 0.30}
                />

                {/* 🧵 Style No */}
                <Text
                  style={{
                    fontSize: 9,
                    marginTop: 2,
                    textAlign: "center",
                  }}
                >
                  {code.barcodeNo || ""}
                </Text>

                {/* 📏 Size */}
                <Text
                  style={{
                    fontSize: 6,
                    marginTop: 2,
                    textAlign: "center",
                  }}
                >
                  {code.styleName ? `${code.styleName}` : ""} - {code.sizeName ? `${code.sizeName}` : ""}
                </Text>
                <Text
                  style={{
                    fontSize: 8,
                    marginTop: 2,
                    textAlign: "center",
                  }}
                >
                  {code.rate ? `MRP : Rs.${code.rate}.00` : ""}
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
