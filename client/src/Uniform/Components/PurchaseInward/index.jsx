import { useEffect, useState, useRef, useCallback } from "react";
import PurchaseInwardForm from "./PurchaseInwardForm";

const MODEL = "Purchase Inward / Direct Inward";

export default function Form() {
  const [showForm, setShowForm] = useState(false);
  const [id, setId] = useState("");
  const [readOnly, setReadOnly] = useState(false);

  const onNew = () => {
    setId("");
    setReadOnly(false);
  };

  return (
    <>
      <PurchaseInwardForm />
    </>
  );
}
