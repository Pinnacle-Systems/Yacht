import { useState } from "react";
import StockAdjustmentkForm from "./StockAdjustmentForm";

export default function Form() {
  const [showForm, setShowForm] = useState(false);
  const [id, setId] = useState("");
  const [readOnly, setReadOnly] = useState(false);
  return (
    <>
      <StockAdjustmentkForm
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
