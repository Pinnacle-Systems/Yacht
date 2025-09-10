import { useState, useRef, useEffect } from "react";
import {
  FaPlus,
  FaSearch,
  FaInfoCircle,
  FaEdit,
  FaTrash,
} from "react-icons/fa";
import { useModal } from "../../../Basic/pages/home/context/ModalContext";

export function ReusableSearchableInput({
  label = "Supplier",
  placeholder = "Search suppliers...",
  onDeleteItem = () => {},
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const containerRef = useRef(null);
  const { openAddModal } = useModal();

  const itemList = [
    { id: 1, name: "ABC Suppliers", code: "SUP-001" },
    { id: 2, name: "XYZ Distributors", code: "SUP-002" },
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredList = itemList.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.code && item.code.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleEdit = (item, e) => {
    e.stopPropagation();
    setEditingItem(item);
    setIsDropdownOpen(false);
    openAddModal();
  };

  const handleDelete = (item, e) => {
    e.stopPropagation();
    onDeleteItem(item);
  };

  return (
    <div className="relative text-sm w-full" ref={containerRef}>
      <label className="block text-xs font-medium text-slate-500 mb-1">
        {label}
      </label>

      <div className="flex gap-2">
        <div className="relative flex-grow">
          <FaSearch className="absolute left-3 top-3 text-slate-400 text-xs" />
          <input
            className="w-full pl-8 pr-2 py-1.5 text-sm border border-slate-300 rounded-md 
              focus:border-indigo-300 focus:outline-none transition-all duration-200
              hover:border-slate-400"
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsDropdownOpen(true);
            }}
            onFocus={() => setIsDropdownOpen(true)}
          />
        </div>

        <div className="relative">
          <button
            className="h-full px-3 py-1.5 border border-green-500 rounded-md
              hover:bg-green-500 text-green-600 hover:text-white transition-colors flex items-center justify-center"
            onClick={() => {
              openAddModal();
              setIsDropdownOpen(false);
            }}
            onMouseEnter={() => setTooltipVisible(true)}
            onMouseLeave={() => setTooltipVisible(false)}
            aria-label="Add supplier"
          >
            <FaPlus className="text-sm" />
          </button>
          {tooltipVisible && (
            <div className="absolute  z-10 top-full right-0 mt-1 w-48 bg-indigo-800 text-white text-xs rounded p-2 shadow-lg">
              <div className="flex items-start">
                <FaInfoCircle className="flex-shrink-0 mt-0.5 mr-1" />
                <span>Click to add a new supplier</span>
              </div>
              <div className="absolute -top-1 right-3 w-2.5 h-2.5 bg-indigo-800 transform rotate-45"></div>
            </div>
          )}
        </div>
      </div>

      {isDropdownOpen && (
        <div className="border border-slate-200 rounded-md shadow-md bg-white mt-1 max-h-40 overflow-y-auto z-20 absolute w-full">
          {filteredList.length > 0 ? (
            filteredList.map((item) => (
              <div
                key={item.id}
                className="px-3 py-2 hover:bg-slate-50 cursor-pointer transition-colors flex justify-between items-center group"
                onClick={() => setSearchTerm(item.name)}
              >
                <div>
                  <div className="font-medium">{item.name}</div>
                  {item.code && (
                    <div className="text-xs text-slate-500">
                      Code: {item.code}
                    </div>
                  )}
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    className="text-indigo-600 hover:text-indigo-800 p-1"
                    onClick={(e) => handleEdit(item, e)}
                    title="Edit supplier"
                  >
                    <FaEdit className="text-sm" />
                  </button>
                  <button
                    className="text-red-600 hover:text-red-800 p-1"
                    onClick={(e) => handleDelete(item, e)}
                    title="Delete supplier"
                  >
                    <FaTrash className="text-sm" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <button
              type="button"
              className="w-full px-3 py-2 text-left text-indigo-600 hover:bg-slate-50 flex items-center gap-2"
              onClick={() => {
                setEditingItem(null);
                setIsDropdownOpen(false);
                openAddModal();
              }}
            >
              <FaPlus className="text-xs" />
              Create "{searchTerm}"
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export function ReusableDropdown({
  label,
  options = [],
  value,
  onChange,
  readOnly = false,
  placeholder = "Select an option",
  className = "",
  disabled = false,
}) {
  return (
    <div className="mb-2">
      {label && (
        <label className="block text-xs text-slate-500 mb-1">{label}</label>
      )}
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full px-2 py-1 text-sm border border-slate-300 rounded-md 
          focus:border-indigo-300 focus:outline-none transition-all duration-200
          hover:border-slate-400 ${
            readOnly || disabled ? "bg-slate-100" : ""
          } ${className}`}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function ReusableInput({
  name,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  readOnly = false,
  required = false,
  className = "",
  disabled = false,
}) {
  return (
    <div className="mb-2">
      {/* {label && (
        <label className="block text-xs text-black mb-1">
          {label}
        </label>
      )} */}
      {name && (
        <label className="block text-xs text-black mb-1">
          {/* {required ? <RequiredLabel name={label ? label : name} /> : name}
           */}
             {required ? <RequiredLabel name={label} /> : label}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        readOnly={readOnly}
        disabled={disabled}
        className={`w-full px-2 h-[25px] text-[12px] py-0  border border-slate-300 rounded-md 
          focus:border-indigo-300 focus:outline-none transition-all duration-200
          hover:border-slate-400 ${
            readOnly || disabled ? "bg-slate-100" : ""
          } ${className}`}
      />
    </div>
  );
}

const RequiredLabel = ({ name }) => (
  <p>
    {`${name}`}
    <span className="text-red-500">*</span>{" "}
  </p>
);
