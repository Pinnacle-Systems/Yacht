import React, { useEffect } from "react";
import JsBarcode from "jsbarcode";
import { Image } from "@react-pdf/renderer";
import tw from "../../../Utils/tailwind-react-pdf";
import { useState } from "react";

const BarcodeGenerator = ({ value, isUi = false }) => {
  const [barcode, setBarcode] = useState("");

  useEffect(() => {
    const canvas = document.createElement("canvas");
    JsBarcode(canvas, value,{ displayValue: false });
    setBarcode(canvas.toDataURL());
  }, [value]);
  if (isUi)
    return (
      <div className="flex justify-center items-center">
        <img src={barcode} alt="" className="w-[150px] h-[50px]" />
      </div>
    );
  return <Image src={barcode} style={tw("w-[200px] h-[60px]")} />;
};

export default BarcodeGenerator;
