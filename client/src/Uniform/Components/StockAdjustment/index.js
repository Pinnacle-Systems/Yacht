import { useState } from "react";
import StockAdjustmentForm from "./StockAdjustmentForm";

export default function Form() {
  const [showForm, setShowForm] = useState(false);
  const [id, setId] = useState("");
  const [readOnly, setReadOnly] = useState(false);
  return (
    <>
      <StockAdjustmentForm
        readOnly={readOnly}
        setReadOnly={setReadOnly}
        id={id}
        setId={setId}
        onClose={() => {
          setShowForm(false);
          setReadOnly((prev) => !prev);
        }}
        setShowForm={setShowForm}
      />
    </>
  );
}
