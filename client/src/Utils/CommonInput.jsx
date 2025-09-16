export function ReusableDropdown({
  label,
  options = [],
  value,
  setValue,
  onChange,
  readOnly = false,
  placeholder = "Select an option",
  className = "",
  disabled = false,
}) {

  const handleOnChange = (e) => {
    const selectedValue = e.target.value;

    setValue(selectedValue);

  };

  return (
    <div className="mb-2">
      {label && (
        <label className="block text-xs text-slate-500 mb-1">
          {label}
        </label>
      )}

      <select
        value={value}
        onChange={handleOnChange}
        disabled={disabled}
        className={`w-full   px-2 py-1 text-xs border border-slate-300 rounded-md 
          focus:border-indigo-300 focus:outline-none transition-all duration-200
          hover:border-slate-400 ${readOnly || disabled ? "bg-slate-100" : ""
          } ${className}`}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option
            key={option.value}
            className="px-3 py-2 text-xs hover:bg-slate-100 cursor-pointer transition-colors
             flex justify-between items-center group"
            value={option.value}
          >
            <div>
              <div className="font-medium">{option.name || option.show}</div>
            </div>
          </option>

          // <option className='' key={option.value} value={option.value}>
          //   {option.show || option.name}
          // </option>
        ))}
      </select>
    </div>
  );
}




export const handleOnChange = (event, setValue) => {
  const inputValue = event.target.value;
  const inputSelectionStart = event.target.selectionStart;
  const inputSelectionEnd = event.target.selectionEnd;

  const upperCaseValue = inputValue.toUpperCase();

  const valueBeforeCursor = upperCaseValue.slice(0, inputSelectionStart);
  const valueAfterCursor = upperCaseValue.slice(inputSelectionEnd);

  setValue(
    valueBeforeCursor +
    inputValue.slice(inputSelectionStart, inputSelectionEnd) +
    valueAfterCursor
  );

  // Set the cursor position to the end of the input value
  setTimeout(() => {
    event.target.setSelectionRange(
      valueBeforeCursor.length +
      inputValue.slice(inputSelectionStart, inputSelectionEnd).length,
      valueBeforeCursor.length +
      inputValue.slice(inputSelectionStart, inputSelectionEnd).length
    );
  });
};







export function ReusableInput(
  { setValue, label, type, value, className = "", placeholder, readOnly, disabled }
) {
  return (
    <div className="mb-2">
      {label && (
        <label className="block  font-bold text-slate-700 mb-1 text-ms">
          {label}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) =>
          type === "number" ? setValue(e.target.value) : handleOnChange(e, setValue)
        }
        placeholder={placeholder}
        readOnly={readOnly}
        disabled={disabled}
        className={`w-full px-2 py-1 text-xs border border-slate-300 rounded-md 
          focus:border-indigo-300 focus:outline-none transition-all duration-200
          hover:border-slate-400 ${readOnly || disabled ? "bg-slate-100" : ""
          } ${className}`}
      />
    </div>
  );
}