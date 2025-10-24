import React, { useEffect, useState } from "react";
import JsBarcode from "jsbarcode";
import { Image } from "@react-pdf/renderer";
import tw from "../../../Utils/tailwind-react-pdf";

const BarcodeGenerator = ({ value, isUi = false, width = 200, height = 60 }) => {
  const [barcode, setBarcode] = useState("");

  useEffect(() => {
    const canvas = document.createElement("canvas");
    JsBarcode(canvas, value, { displayValue: false });
    setBarcode(canvas.toDataURL());
  }, [value]);

  if (isUi)
    return (
      <div className="flex justify-center items-center">
        <img
          src={barcode}
          alt=""
          className="object-contain"
          style={{ width, height }}
        />
      </div>
    );

  return <Image src={barcode} style={{ width, height }} />;
};

export default BarcodeGenerator;
