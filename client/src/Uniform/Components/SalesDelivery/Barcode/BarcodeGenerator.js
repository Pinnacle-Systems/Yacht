import React, { useEffect, useState } from "react";
import JsBarcode from "jsbarcode";
import { Image } from "@react-pdf/renderer";


const BarcodeGenerator = ({ value, isUi = false, width = 100, height = 30 }) => {
  const [barcode, setBarcode] = useState("");

  useEffect(() => {
    if (!value) return;
    const canvas = document.createElement("canvas");
    JsBarcode(canvas, value, {
      format: "CODE128",
      width: 1.5,
      height: 40,
      displayValue: false,
      margin: 0,
    });
    setBarcode(canvas.toDataURL("image/png"));
  }, [value]);

  if (!barcode) return null;

  if (isUi)
    return (
      <div className="flex justify-center items-center">
        <img src={barcode} alt="barcode" style={{ width, height }} />
      </div>
    );

  return <Image src={barcode} style={{ width, height }} />;
};

export default BarcodeGenerator;
