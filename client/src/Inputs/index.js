// import validator from 'validator';
// import React, { useEffect, useRef, useState } from "react";
// import { MultiSelect } from "react-multi-select-component";
// import Select from 'react-dropdown-select';
// import { findFromList } from '../Utils/helper';
// import "./index.css"
// import { FormControl, MenuItem, TextField } from '@mui/material';
// import { push } from '../redux/features/opentabs';
// import { useDispatch } from 'react-redux';
// import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';


// export const handleOnChange = (event, setValue) => {
//     const inputValue = event.target.value;
//     const inputSelectionStart = event.target.selectionStart;
//     const inputSelectionEnd = event.target.selectionEnd;

//     const upperCaseValue = inputValue.toUpperCase();

//     const valueBeforeCursor = upperCaseValue.slice(0, inputSelectionStart);
//     const valueAfterCursor = upperCaseValue.slice(inputSelectionEnd);

//     setValue(valueBeforeCursor + inputValue.slice(inputSelectionStart, inputSelectionEnd) + valueAfterCursor);

//     // Set the cursor position to the end of the input value
//     setTimeout(() => {
//         event.target.setSelectionRange(valueBeforeCursor.length + inputValue.slice(inputSelectionStart, inputSelectionEnd).length, valueBeforeCursor.length + inputValue.slice(inputSelectionStart, inputSelectionEnd).length);
//     });
// };
// export const handleOnChangeforpassword = (event, setValue) => {
//     const inputValue = event.target.value;
//     const inputSelectionStart = event.target.selectionStart;
//     const inputSelectionEnd = event.target.selectionEnd;

//     const LowerCaseValue = inputValue.toLowerCase();


//     const valueBeforeCursor = LowerCaseValue.slice(0, inputSelectionStart);
//     const valueAfterCursor = LowerCaseValue.slice(inputSelectionEnd);

//     setValue(valueBeforeCursor + inputValue.slice(inputSelectionStart, inputSelectionEnd) + valueAfterCursor);

//     // Set the cursor position to the end of the input value
//     setTimeout(() => {
//         event.target.setSelectionRange(valueBeforeCursor.length + inputValue.slice(inputSelectionStart, inputSelectionEnd).length, valueBeforeCursor.length + inputValue.slice(inputSelectionStart, inputSelectionEnd).length);
//     });
// };
// export const MultiSelectDropdown = ({ name, selected, labelName, setSelected, options, readOnly = false, tabIndex = null, className = "", inputClass }) => {
//     console.log(options, "oiptiosn")
//     return (
//         <div className={`m-1  md:grid-cols-3 items-center z-0 md:my-0.5 md:py-3 data ${className}`}>
//             <label className={`md:text-start flex ${labelName}`} >{name}</label>
//             <MultiSelect
//                 className={`focus:outline-none  border border-gray-500 rounded text-black  ${inputClass}`}
//                 options={options}
//                 value={selected}
//                 onChange={readOnly ? () => { } : setSelected}
//                 labelledBy="Select"
//             />
//         </div>
//     );
// };

// // export const MultiSelectDropdown = ({ options, placeholder = "Select options" ,selected,setSelected,readOnly}) => {

// //   const [isOpen, setIsOpen] = useState(false);
// //   const dropdownRef = useRef(null);

// //   const toggleDropdown = () => setIsOpen(!isOpen);

// //   const handleOptionClick = (value) => {
// //     setSelected((prev) =>
// //       prev.includes(value)
// //         ? prev.filter((item) => item !== value)
// //         : [...prev, value]
// //     );
// //   };

// //   const handleClickOutside = (event) => {
// //     if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
// //       setIsOpen(false);
// //     }
// //   };

// //   useEffect(() => {
// //     document.addEventListener("mousedown", handleClickOutside);
// //     return () => document.removeEventListener("mousedown", handleClickOutside);
// //   }, []);

// //   const getLabelByValue = (value) =>
// //     options?.find((option) => option?.value === value)?.name || value;

// //   return (
// //     <div className="multiselect-container" ref={dropdownRef} style={{ position: "relative", width: "250px" }}>
// //       <div
// //         className="multiselect-display"
// //         onClick={toggleDropdown}
// //         style={{
// //           border: "1px solid #ccc",
// //           padding: "8px",
// //           cursor: "pointer",
// //           backgroundColor: "#fff"
// //         }}
// //       >
// //         {selected?.length > 0
// //           ? selected.map(getLabelByValue).join(", ")
// //           : placeholder}
// //       </div>
// //       {isOpen && (
// //         <div
// //           className="dropdown-options"
// //           style={{
// //             position: "absolute",
// //             border: "1px solid #ccc",
// //             backgroundColor: "#fff",
// //             width: "100%",
// //             maxHeight: "150px",
// //             overflowY: "auto",
// //             zIndex: 1000
// //           }}
// //         >
// //              <MultiSelect
// //                className={`focus:outline-none  border border-gray-500 rounded text-black  `}
// //                 options={options}
// //                  value={selected}
// //                               onChange={readOnly ? () => { } : setSelected}
// //                labelledBy="Select"
// //              />
// //         </div>
// //       )}
// //     </div>
// //   );
// // };




// // export const TextInput = ({ name, type, value, setValue, readOnly, className, inputClass, required = false, disabled = false, tabIndex = null, onBlur = null }) => {
// //     return (
// //         <div className='input-group grid-cols-1 md:grid-cols-3 items-center md:my-0.5 md:px-1 data gap-1'>
// //             <label className={`md:text-start flex ${className}`}>{required ? <RequiredLabel name={name} /> : `${name}`}</label>
// //             <input onBlur={onBlur} tabIndex={tabIndex ? tabIndex : undefined} type={type} disabled={disabled}
// //                 required={required} className={`${"input-field focus:outline-none md:col-span-2 border-gray-500 border rounded"} ${inputClass}`} value={value} onChange={(e) => { type === "number" ? setValue(e.target.value) : handleOnChange(e, setValue) }} readOnly={readOnly}
// //                 placeholder={`${name}`}
// //             />
// //         </div>
// //     )
// // }


// export const TextInput = ({ name, type, value, setValue, readOnly, className, required = false, disabled = false, tabIndex = null, onBlur = null, width }) => {

//     return (
//         <>
//             <div className="group input-group  text-md">
//                 <label htmlFor="title" className="input-label group-hover:text-blue-600  font-weight: 100  ">
//                     <span className="flex items-center gap-2  font-weight: 100">
//                         {required ? <RequiredLabel name={name} /> : `${name}`}
//                     </span>
//                 </label>
//                 <TextField
//                     id={name}
//                     variant="standard"
//                     name={`${name}`}
//                     className={`input-base field-text p-0.5 rounded border border-gray-500 font-weight: 100  w-${width}`}
//                     // placeholder={`${name}`}

//                     sx={{
//                         "& .MuiInputBase-input": { fontSize: "12px" },
//                         "& .MuiInputBase-input.Mui-disabled": {
//                             color: "#333",
//                             WebkitTextFillColor: "#333",
//                         }
//                     }}
//                     onBlur={onBlur} tabIndex={tabIndex ? tabIndex : undefined} type={type} disabled={readOnly} required={required}
//                     value={value} onChange={(e) => { type === "number" ? setValue(e.target.value) : handleOnChange(e, setValue) }} readOnly={readOnly}
//                 />
//             </div>


//         </>

//     )
// }
// export const PasswordTextInput = ({ name, type, value, setValue, readOnly, className, required = false, disabled = false, tabIndex = null, onBlur = null, width }) => {

//     return (
//         <>
//             <div className="group input-group  text-sm">
//                 <label htmlFor="title" className="input-label group-hover:text-blue-600  font-weight: 100 ">
//                     <span className="flex items-center gap-2  font-weight: 100">
//                         {required ? <RequiredLabel name={name} /> : `${name}`}
//                     </span>
//                 </label>
//                 <TextField
//                     id={name}
//                     variant="standard"
//                     name={`${name}`}
//                     className={`input-base field-text p-0.5 rounded border border-gray-500 font-weight: 100 `}
//                     // placeholder={`${name}`}

//                     sx={{
//                         "& .MuiInputBase-input": { fontSize: "12px" },
//                         "& .MuiInputBase-input.Mui-disabled": {
//                             color: "#333",
//                             WebkitTextFillColor: "#333",
//                         }
//                     }}
//                     onBlur={onBlur} tabIndex={tabIndex ? tabIndex : undefined} type={type} disabled={readOnly} required={required}
//                     value={value} onChange={(e) => { type === "number" ? setValue(e.target.value) : handleOnChangeforpassword(e, setValue) }} readOnly={readOnly}
//                 />
//             </div>


//         </>

//     )
// }
// export const TextAreaInput = ({
//     name,
//     value,
//     setValue,
//     readOnly = false,
//     required = false,
//     disabled = false,
//     tabIndex = null,
//     rows = 2,
//     className = ""
// }) => {
//     return (
//         <div className="group input-group text-md">
//             <label htmlFor={name} className="input-label group-hover:text-blue-600 font-weight: 100">
//                 <span className="flex items-center gap-2 font-weight: 100">
//                     {required ? <RequiredLabel name={name} /> : `${name}`}
//                 </span>
//             </label>
//             <textarea
//                 id={name}
//                 name={name}
//                 rows={rows}
//                 className={`w-full px-2 py-1 text-sm border border-slate-300 rounded-md 
//           focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all duration-200 
//           hover:border-slate-400 resize-none ${className}`}
//                 value={value}
//                 onChange={(e) => setValue(e.target.value)}
//                 readOnly={readOnly}
//                 disabled={disabled}
//                 tabIndex={tabIndex ?? undefined}
//             />
//         </div>
//     );
// };

// export const LongTextInput = ({ name, type, value, setValue, className, readOnly, required = false, disabled = false, tabIndex = null }) => {
//     return (
//         <div className='input-group grid-cols-1 md:grid-cols-2 items-center md:my-0.5 md:px-1 data gap-1'>
//             <label className='md:text-start flex'>{required ? <RequiredLabel name={name} /> : `${name}`}</label>
//             <input tabIndex={tabIndex ? tabIndex : undefined} type={type} disabled={disabled} required={required} className={className} value={value} onChange={(e) => { type === "number" ? setValue(e.target.value) : handleOnChange(e, setValue) }} readOnly={readOnly} />
//         </div>
//     )
// }

// export const DisabledInput = ({ name, type, value, className = "", textClassName = "", tabIndex = null }) => {
//     return (
//         <div className={`grid-cols-1 md:grid-cols-3 items-center md:my-0.5 md:px-1  font-size:11.5px ${className}`}>
//             <label className={`md:text-start flex ${className} input-label group-hover:text-blue-600 `}>{name}</label>
//             <input tabIndex={tabIndex ? tabIndex : undefined} type={type} className={`input-field ${textClassName}  p-0.5 focus:outline-none md:col-span-1 border-b border-b-gray-500 group-hover:text-blue-600  text-xs  w-32`} value={value} disabled />
//         </div>
//     )
// }

// export const SpecialInput = ({ name, type, value, className = "", textClassName = "", tabIndex = null }) => {
//     return (
//         <div className={`flex flex-col  md:my-0.5 md:px-1  font-size:16.5px ${className}  gap-4 border-b border-b-gray-500 w-32 `}>
//             <label className={`md:text-start flex ${className}  group-hover:text-blue-600  w-32`}>{name}</label>
//             <input tabIndex={tabIndex ? tabIndex : undefined} type={type} className={` ${textClassName}   focus:outline-none md:col-span-1  group-hover:text-blue-600  text-xs  w-32`} value={value} />
//         </div>
//     )
// }

// export const FloatingLabelInput = ({ label, type = "text", required = false, value, setValue, autoFocus = false, disabled = false }) => {
//     const [focus, setFocus] = useState(autoFocus);
//     return (
//         <div className='static flex flex-col p-6'>
//             <label className={(focus || value) ? "z-0 absolute -translate-y-6 duration-300 " : "absolute mx-1 duration-300 text-gray-400"}>{label}</label>
//             <input disabled={disabled} id={label} type={type} className="z-10 transparent border-2 rounded" required={required} value={value} onFocus={(e) => setFocus(true)} onBlur={(e) => setFocus(false)} onChange={(e) => { setValue(e.target.value) }} autoFocus={autoFocus} />
//         </div>
//     )
// }

// export const LongDisabledInput = ({ name, type, value, className, tabIndex = null }) => {
//     return (
//         <div className={` grid-flow-col  items-center md:my-0.5 md:px-1 data ${className}`}>
//             <label className={`md:text-start flex ${className} `}>{name}</label>
//             <input type={type} className={`h-6 border border-gray-500 rounded`} value={value} disabled />
//         </div>
//     )
// }

// // export const TextArea = ({ name, value, setValue, readOnly, required = false, disabled = false, rows = 2, cols = 30, tabIndex = null }) => {
// //     return (
// //         <div className=' grid-cols-1 md:grid-cols-3 md:my-1 md:px-1 data'>
// //             <label className='md:text-start flex'>{required ? <RequiredLabel name={name} /> : `${name}`}</label>
// //             <textarea tabIndex={tabIndex ? tabIndex : undefined} name={name} disabled={disabled} required={required} className='focus:outline-none md:col-span-2 border border-gray-500 rounded' cols={cols} rows={rows} value={value} onChange={(e) => { handleOnChange(e, setValue); }} readOnly={readOnly}></textarea>
// //         </div>
// //     )
// // }

// export const TextArea = ({
//     name,
//     value,
//     setValue,
//     readOnly,
//     required = false,
//     disabled = false,
//     placeholder = '',
//     rows = 3,
//     cols = 2,
//     tabIndex = null,
//     label = null,
//     inputClass = "",
//     onBlur = null,
// }) => {
//     return (
//         <div className="mb-3 w-full">
//             {name && (
//                 <label className="block text-xs font-medium text-black mb-1">
//                     {required ? <RequiredLabel name={label ?? name} /> : (label ?? name)}
//                 </label>
//             )}

//             <textarea
//                 id={name}
//                 name={name}
//                 rows={rows}
//                 cols={cols}
//                 tabIndex={tabIndex ?? undefined}
//                 disabled={disabled}
//                 required={required}
//                 readOnly={readOnly}
//                 value={value}
//                 onChange={(e) => setValue(e.target.value)}
//                 onBlur={onBlur}
//                 placeholder={placeholder}
//                 className={`w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg
//           focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
//           transition-all duration-150 shadow-sm resize-none
//           ${readOnly || disabled
//                         ? "bg-gray-100 text-gray-500 cursor-not-allowed"
//                         : "bg-white hover:border-gray-400"}
//           ${inputClass}`}
//             ></textarea>
//         </div>
//     );
// };


// export const DropdownInput = ({ name, beforeChange = () => { }, onBlur = null, options, value, setValue, defaultValue, className, readOnly, required = false, disabled = false, clear = false, tabIndex = null, autoFocus = false, width = '32' }) => {
//     const handleOnChange = (e) => {
//         setValue(e.target.value);
//     }
//     return (
//         <div className='input-group items-center md:my-1 md:px-1 data text-xs'>
//             <label className={`md:text-start flex  text-xs font-weight: 100 mb-2 ${className}`}>{required ? <RequiredLabel name={name} /> : `${name}`}</label>
//             <select
//                 onBlur={onBlur}
//                 autoFocus={autoFocus} tabIndex={tabIndex ? tabIndex : undefined} defaultValue={defaultValue} id='dd'
//                 required={required} name="name" className={`text-xs  md:col-span-2 col-span-1   border-b border-black w-${width}`}
//                 value={value} onChange={(e) => { beforeChange(); handleOnChange(e); }} disabled={readOnly}>
//                 <option value="" hidden={!clear}>Select</option>
//                 {options?.map((option, index) => <option key={index} value={option.value} >
//                     {option.show}
//                 </option>)}
//             </select>
//         </div>
//     )
// }


// export const DropdownInputForm = ({ name, beforeChange = () => { }, onBlur = null, options, value, setValue, defaultValue, className, readOnly, required = false, disabled = false, clear = false, tabIndex = null, autoFocus = false, width = '32' }) => {
//     const handleOnChange = (e) => {
//         setValue(e.target.value);
//     }
//     console.log(width, "width")
//     return (
//         <div className='input-group items-center md:my-1 md:px-1 data '>
//             <label className={`md:text-start flex  text-xs ${className}`}>{required ? <RequiredLabel name={name} /> : `${name}`}</label>
//             <select
//                 onBlur={onBlur}
//                 autoFocus={autoFocus} tabIndex={tabIndex ? tabIndex : undefined} defaultValue={defaultValue} id='dd'
//                 required={required} name="name" className={` md:col-span-2 col-span-1 px-2 py-1  focus:outline-none focus:ring-2 focus:ring-blue-400 border border-gray-300 w-${width}`}
//                 value={value} onChange={(e) => { beforeChange(); handleOnChange(e); }} disabled={readOnly}>
//                 <option value="" hidden={!clear}>Select</option>
//                 {options?.map((option, index) => <option key={index} value={option.value} >
//                     {option.show}
//                 </option>)}
//             </select>
//         </div>
//     )
// }

// export const LongDropdownInput = ({ name, options, value, setValue, defaultValue, className, readOnly, required = false,
//     disabled = false, clear = false, tabIndex = null }) => {
//     const handleOnChange = (e) => {
//         setValue(e.target.value);
//     }
//     return (
//         <div className=' grid-cols-12 items-center md:my-1 md:px-1 data'>
//             <label className={`text-start col-span-2 `}>{required ? <RequiredLabel name={name} /> : `${name}`}</label>
//             <select tabIndex={tabIndex ? tabIndex : undefined} defaultValue={defaultValue} id='dd' required={required} name="name"
//                 className={`border border-gray-500 h-6 rounded ${className} col-span-10`} value={value} onChange={(e) => { handleOnChange(e); }} disabled={readOnly}>
//                 <option value="">Select</option>
//                 {options.map((option, index) => <option key={index} value={option.value} >
//                     {option.show}
//                 </option>)}
//             </select>
//         </div>
//     )
// }

// export const RadioButton = ({ label, value, onChange, readOnly, className, tabIndex = null }) => {
//     return (
//         <div className={`flex items-center gap-1 ${className}`}>
//             <input type="radio" tabIndex={tabIndex ? tabIndex : undefined} checked={value} onChange={onChange} />
//             <label>
//                 {label}
//             </label>
//         </div>
//     );
// };


// export const DropdownInputWithoutLabel = ({ options, value, setValue, readOnly, required = false, disabled = false, tabIndex = null }) => {
//     const handleOnChange = (e) => {
//         setValue(e.target.value);
//     }
//     return (
//         <div className=' grid-cols-1 md:grid-cols-3 items-center md:my-1 md:px-1 data'>
//             <select tabIndex={tabIndex ? tabIndex : undefined} required={required} name="name" className='input-field md:col-span-2 border col-span-1 rounded' value={value} onChange={(e) => { handleOnChange(e); }} disabled={readOnly}>
//                 <option value="" hidden>Select</option>
//                 {options.map((option, index) => <option key={index} value={option.value} >{option.show}</option>)}
//             </select>
//         </div>
//     )
// }


// export const CurrencyInput = ({ name, value, setValue, readOnly, required = false, disabled = false, tabIndex = null }) => {
//     const handleOnChange = (e) => {
//         setValue(e.target.value);
//     }
//     return (
//         <div className='grid grid-cols-1 md:grid-cols-3 items-center md:my-1 md:px-1 data'>
//             <label htmlFor="id" className='md:text-start flex'>{required ? <RequiredLabel name={name} /> : `${name}`}</label>
//             <input tabIndex={tabIndex ? tabIndex : undefined} type="number" disabled={disabled} required={required} className='input-field focus:outline-none md:col-span-2 border rounded' min="1" step="any" id='id' value={value} onChange={(e) => { handleOnChange(e); }} readOnly={readOnly} />
//         </div>
//     )
// }

// const RequiredLabel = ({ name }) => <p>{`${name}`}<span className="text-red-500">*</span> </p>



// export const DateInput = ({ name, value, setValue, readOnly, required = false, type = "date", disabled = false, tabIndex = null, inputClass, inputHead }) => {
//     console.log(value, 'value');

//     return (
//         <div className='   grid-cols-1 md:grid-cols-3 items-center md:my-1 md:px-1  w-32'>
//             {/* <label htmlFor="id" className={`md:text-start flex   input-label ${inputHead} group-hover:text-blue-600`}>{required ? <RequiredLabel name={name} /> : `${name}`}</label> */}
//             <input tabIndex={tabIndex ? tabIndex : undefined} type={type} disabled={disabled} required={required}
//                 className={`focus:outline-none md:col-span-2 border-b border-b-gray-500 text-xs p-0.5   w-32 ${inputClass}`} id='id' value={value} onChange={(e) => { setValue(e.target.value); }} readOnly={readOnly} />
//         </div>
//     )
// }
// export const DateInputNew = ({ name, value, setValue, readOnly, required = false, type = "", disabled = false, tabIndex = null, inputClass, inputHead }) => {
//     console.log(type, 'type');

//     const today = new Date().toISOString().split("T")[0];
//     return (
//         <div className='   grid-cols-1 md:grid-cols-3 items-center  md:px-1 w-24'>
//             <label htmlFor="id" className={`md:text-start flex  pb-[3px] text-xs ${inputHead} font-semibold group-hover:text-blue-600`}>{required ? <RequiredLabel name={name} /> : `${name}`}</label>
//             <input tabIndex={tabIndex ? tabIndex : undefined} type={type} disabled={disabled} required={required} min={type === "date" ? today : undefined}
//                 className={`focus:outline-none md:col-span-2 border border-gray-400 text-xs p-0.5  rounded-md w-24 ${inputClass}`} id='id' value={value} onChange={(e) => { setValue(e.target.value); }} readOnly={readOnly} />
//         </div>
//     )
// }

// export const LongDateInput = ({ name, value, setValue, readOnly, className, required = false, type = "date", disabled = false, tabIndex = null }) => {

//     return (
//         <div className=' grid-flow-col item-center justify-center gap-12 w-56 items-center md:px-1 data'>
//             <label htmlFor="id" className='md:text-start flex'>{required ? <RequiredLabel name={name} /> : `${name}`}</label>
//             <input tabIndex={tabIndex ? tabIndex : undefined} type={type} disabled={disabled} required={required} className={`${className} focus:outline-none border border-gray-500 form-border-color rounded h-6`} id='id' value={value} onChange={(e) => { setValue(e.target.value); }} readOnly={readOnly} />
//         </div>
//     )
// }

// export const CheckBox = ({ name, value, setValue, readOnly = false, className, required = false, disabled = false, tabIndex = null }) => {
//     const handleOnChange = (e) => {
//         setValue(!value);
//     }
//     console.log("value", value)
//     return (
//         <div className='items-center md:my-1 md:px-1 data text-xs '>
//             <label htmlFor="id" className={`md:text-start items-center ${className}  text-xs`}>
//                 <input tabIndex={tabIndex ? tabIndex : undefined} type="checkbox" required={required} className='mx-2 py-2' checked={value} onChange={(e) => { handleOnChange(e); }} disabled={readOnly} />
//                 {name}
//             </label>
//         </div>
//     )
// }



// export const validateEmail = (data) => {
//     return validator.isEmail(data);
// }

// export const validateMobile = (data) => {
//     let regMobile = /^[6-9]\d{9}$/;
//     return regMobile.test(data);
// }

// export const validatePan = (data) => {
//     let regpan = /^([a-zA-Z]){5}([0-9]){4}([a-zA-Z]){1}?$/;
//     return regpan.test(data);
// }

// export const validatePincode = (data) => {
//     return data.toString().length === 6;
// }

// // export const DropdownWithSearch = ({ className, options, value, setValue, readOnly, onCreateNew = null, optionName, masterName = "", }) => {
// //     console.log(options, "options")

// //     const dispatch = useDispatch();

// //     function handleChange(e) {
// //         if (e.target.value === "create_new_Vendor") {
// //             dispatch(push({ name: "PARTY MASTER", projectForm: true, projectId: true }));

// //         }
// //         else {
// //             setValue(e.target.value)
// //         }

// //     }


// //     const [currentIndex, setCurrentIndex] = useState("");
// //     useEffect(() => setCurrentIndex(new Date()), [])
// //     useEffect(() => {
// //         const dropDownElement = document.getElementById(`dropdown${currentIndex}`);
// //         dropDownElement.addEventListener('keydown', function (ev) {
// //             var focusableElementsString = '[tabindex="0"]';
// //             let ol = dropDownElement.querySelectorAll(focusableElementsString);
// //             if (ev.key === "ArrowDown") {
// //                 for (let i = 0; i < ol.length; i++) {
// //                     if (ol[i] === ev.target) {
// //                         let o = i < ol.length - 1 ? ol[i + 1] : ol[0];
// //                         o.focus(); break;
// //                     }
// //                 }
// //                 ev.preventDefault()
// //             } else if (ev.key === "ArrowUp") {
// //                 for (let i = 0; i < ol.length; i++) {
// //                     if (ol[i] === ev.target) {
// //                         let o = ol[i - 1];
// //                         o.focus(); break;
// //                     }
// //                 }
// //                 ev.preventDefault()
// //             }
// //         });




// //         return () => {
// //             dropDownElement.removeEventListener('keydown', () => { });
// //         };
// //     }, [currentIndex]);


// //     return (
// //         <div id={`dropdown${currentIndex}`} className={`${className} px-2`}>
// //             <select
// //                 className="border border-gray-300 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400 w-full"
// //                 disabled={readOnly}
// //                 value={value || ""}
// //                 onChange={(e) => {
// //                     // setValue(e.target.value)
// //                     handleChange(e)
// //                 }}
// //             >
// //                 {!value && <option value="">Select  {optionName}</option>}
// //                 {/* {masterName !== "" && (
// //                     <option
// //                         value="create_new_Vendor"
// //                         className="text-blue-600 font-semibold"
// //                     >
// //                         + Create New Vendor
// //                     </option>
// //                 )} */}
// //                 {(options || []).map((option) => (
// //                     <option key={option.id} value={option.id} classname>
// //                         {option.name}
// //                     </option>
// //                 ))}

// //             </select>
// //         </div>
// //     );

// // }


// export const Modal = ({ isOpen, onClose = null, children, widthClass }) => {
//     if (!isOpen) return null;

//     return (
//         <div className="fixed inset-0 z-50 flex items-center  justify-center overflow-auto bg-gray-800 bg-opacity-50 mb-5">
//             <div className={`relative bg-white rounded-lg ${widthClass}`}>
//                 {onClose ?
//                     <button
//                         className="absolute top-0 right-0 m-4 text-gray-600 hover:text-gray-800 focus:outline-none mb-5"
//                         onClick={onClose}
//                     >
//                         <svg
//                             className="h-6 w-6 fill-current "
//                             viewBox="0 0 20 20"
//                             xmlns="http://www.w3.org/2000/svg"
//                         >
//                             <title>Close</title>
//                             <path
//                                 d="M14.348 5.652a.999.999 0 00-1.414 0L10 8.586l-2.93-2.93a.999.999 0 10-1.414 1.414L8.586 10l-2.93 2.93a.999.999 0 101.414 1.414L10 11.414l2.93 2.93a.999.999 0 101.414-1.414L11.414 10l2.93-2.93a.999.999 0 000-1.414z"
//                                 fillRule="evenodd"
//                             />
//                         </svg>
//                     </button>
//                     :
//                     ""
//                 }
//                 {children}
//             </div>
//         </div>
//     );
// };

// export const ToggleButton = ({ name, value, setActive, required, readOnly, form }) => {

//     const [isToggled, setIsToggled] = useState(false);

//     useEffect(() => {
//         if (value) {
//             setIsToggled(true)
//             console.log('here')
//         } else {
//             setIsToggled(false)
//         }
//     }, [value, isToggled])

//     return (
//         <div>
//             <div className="">
//                 {/* <label className={`md:text-start flex`}>{required ? <RequiredLabel name={name} /> : `${name}`}</label> */}
//                 <div className='flex items-center'>
//                     <label className="relative inline-flex items-center cursor-pointer">
//                         <input type="checkbox" className="sr-only peer" checked={isToggled}
//                             onChange={() => {
//                                 if (!readOnly) {
//                                     setIsToggled(!isToggled);
//                                     setActive(!value)
//                                 }
//                             }} required />
//                         <div className="w-12 h-6 bg-gray-300 rounded-full peer-checked:bg-green-500 peer transition duration-300"></div>
//                         <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full peer-checked:translate-x-6 transition-transform duration-300 shadow-sm"></div>
//                     </label>

//                     <span className='text-xs ml-2'>{value ? "Active" : "Inactive"}</span>
//                 </div>


//             </div>
//         </div>
//     )
// }


// export const FancyCheckBox = ({ label, value, onChange, readOnly }) => {
//     return (
//         <label
//             style={{ fontSize: 11 }}
//             className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer w-full text-xs font-medium text-gray-700 ${readOnly ? "bg-gray-100 cursor-not-allowed" : "hover:bg-gray-50"
//                 }`}
//         >
//             <input
//                 type="checkbox"
//                 checked={value}
//                 onChange={(e) => onChange(e.target.checked)}
//                 disabled={readOnly}
//                 className="accent-blue-600"
//             />
//             <span className="break-words text-xs text-wrap w-full">{label}</span>
//         </label>
//     );
// };

// export const DropdownWithSearch = ({ options, value, setValue, readOnly, searchBy = 'name', labelField = "name", valueField = 'id', className = 'h-2 w-[200px]', isSetFirstDefault, onBlur, autoFocus, tabIndex, required, defaultValue, refetch }) => {
//     useEffect(() => {
//         if (value) return
//         if (isSetFirstDefault) {
//             setValue(findFromList(options[0]?.[valueField], options || [], valueField))
//         }

//     }, [isSetFirstDefault, options, valueField, value, refetch])


//     return (


//         <>

//             {readOnly ?
//                 <span className='md:col-span-2 w-64  px-3 rounded shadow-lg '>
//                     {findFromList(value, options || [], labelField)}
//                 </span>
//                 :
//                 <select
//                     onBlur={onBlur}
//                     autoFocus={autoFocus}
//                     tabIndex={tabIndex || undefined}
//                     defaultValue={defaultValue}
//                     required={required}
//                     name="name"
//                     className='input-field border border-grey-500 md:col-span-2 col-span-1 rounded shadow-lg'
//                     value={value}
//                     onChange={(e) => setValue(e.target.value)}
//                     onClick={() => { refetch() }}
//                     disabled={readOnly}
//                 >
//                     <option value="">Select</option>
//                     {options.map((option, index) => (
//                         <option key={index} value={option[valueField]}>
//                             {option[labelField]}
//                         </option>
//                     ))}
//                 </select>
//             }
//         </>
//     );
// }



// export const ReusableLabeledInput = ({
//     label,
//     name,
//     value,
//     onChange,
//     type = "text",
//     readOnly = false,
//     required = false,
//     disabled = false,
//     placeholder = "",
//     className = "",
//     labelClassName = "",
//     inputClassName = "",
// }) => {
//     return (
//         <div className={`flex items-center text-[12px] w-full ${className}`}>
//             {label && (
//                 <label
//                     htmlFor={name}
//                     className={`w-1/3 text-black text-[12px] pr-2 ${labelClassName}`}
//                 >
//                     {label}
//                 </label>
//             )}
//             <input
//                 id={name}
//                 name={name}
//                 type={type}
//                 value={value}
//                 onChange={onChange}
//                 placeholder={placeholder}
//                 readOnly={readOnly}
//                 disabled={disabled}
//                 required={required}
//                 className={`w-1/2 px-2  text-[12px] h-[22px] border border-slate-300 rounded-md
//           focus:outline-none focus:border-indigo-300 transition-all duration-200
//           hover:border-slate-400 appearance-none 
//           ${readOnly ? 'bg-gray-100 cursor-not-allowed' : ''} ${inputClassName}`}
//             />

//         </div>
//     );
// };


// export const ReusableTable = ({
//   columns,
//   data,
//   itemsPerPage = 10,
//   onView,
//   onEdit,
//   onDelete,
//   emptyStateMessage = 'No data available',
//   rowActions = true,
//   width
// })  => {
//   const [currentPage, setCurrentPage] = useState(1);
//   const totalPages = Math?.ceil(data?.length / itemsPerPage);
//   const indexOfLastItem = currentPage * itemsPerPage;
//   const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//   const currentItems = data?.slice(indexOfFirstItem, indexOfLastItem);

// console.log(data,"commonTable")

//   const handlePageChange = (newPage) => {
//     if (newPage >= 1 && newPage <= totalPages) {
//       setCurrentPage(newPage);
//     }
//   };

//   const Pagination = () => {
//     if (totalPages <= 1) return null;

//     return (
//       <div className="flex flex-col sm:flex-row justify-between items-center p-2 bg-white border-t border-gray-200">
//         <div className="text-sm text-gray-600 mb-2 sm:mb-0">
//           Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, data?.length)} of {data?.length} entries
//         </div>
//         <div className="flex gap-1">
//           <button
//             onClick={() => handlePageChange(currentPage - 1)}
//             disabled={currentPage === 1}
//             className={`px-3 py-1 rounded-md ${currentPage === 1
//               ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
//               : 'bg-white text-gray-600 hover:bg-gray-100'
//               }`}
//           >
//             <FaChevronLeft className="inline" />
//           </button>

//           {Array?.from({ length: Math.min(5, totalPages) }, (_, i) => {
//             let pageNum;
//             if (totalPages <= 5) {
//               pageNum = i + 1;
//             } else if (currentPage <= 3) {
//               pageNum = i + 1;
//             } else if (currentPage >= totalPages - 2) {
//               pageNum = totalPages - 4 + i;
//             } else {
//               pageNum = currentPage - 2 + i;
//             }

//             return (
//               <button
//                 key={pageNum}
//                 onClick={() => handlePageChange(pageNum)}
//                 className={`px-3 py-1 rounded-md ${currentPage === pageNum
//                   ? 'bg-indigo-800 text-white'
//                   : 'bg-white text-gray-600 hover:bg-gray-100'
//                   }`}
//               >
//                 {pageNum}
//               </button>
//             );
//           })}

//           {totalPages > 5 && currentPage < totalPages - 2 && (
//             <span className="px-3 py-1">...</span>
//           )}

//           {totalPages > 5 && currentPage < totalPages - 2 && (
//             <button
//               onClick={() => handlePageChange(totalPages)}
//               className={`px-3 py-1 rounded-md ${currentPage === totalPages
//                 ? 'bg-indigo-800 text-white'
//                 : 'bg-white text-gray-600 hover:bg-gray-100'
//                 }`}
//             >
//               {totalPages}
//             </button>
//           )}

//           <button
//             onClick={() => handlePageChange(currentPage + 1)}
//             disabled={currentPage === totalPages}
//             className={`px-3 py-1 rounded-md ${currentPage === totalPages
//               ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
//               : 'bg-white text-gray-600 hover:bg-gray-100'
//               }`}
//           >
//             <FaChevronRight className="inline" />
//           </button>
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div className="bg-[#F1F1F0] shadow-sm overflow-hidden">
//       <table className=" border-collapse">
//         <thead className="bg-gray-200 text-gray-800">
//           <tr>

//             {columns?.map((column, index) => (
//               <th
//                 key={index}
//                 className={` ${column.className ? column.className  : "" } py-2  font-medium   ${ column.header  !== "" ? 'border-r border-white/50' : ''} text-[13px]`}

//               >
//                 {column.header}
//               </th>
//             ))}
//             {rowActions && (
//               <th className="px-4 py-2 text-center font-medium text-[13px] justify-end">Actions</th>
//             )}
//           </tr>
//         </thead>
//         <tbody>
//           {currentItems?.length === 0 ? (
//             <tr>
//               <td colSpan={columns?.length + (rowActions ? 1 : 0)} className="px-4 py-4 text-center text-gray-500">
//                 {emptyStateMessage}
//               </td>
//             </tr>
//           ) : (
//             currentItems?.map((item, index) => (
//               <tr
//                 key={item.id}
//                 className={`hover:bg-gray-50 transition-colors border-b   border-gray-200 text-[12px] ${index % 2 === 0 ? "bg-white" : "bg-gray-100"
//                   }` }
//               >
//                 {columns?.map((column, colIndex) => (
//                   <td
//                     key={colIndex}
//                     className={` ${column.className ? column.className  : ""  } ${ column.header  !== "" ? 'border-r border-white/50' : ''} h-8 ` }
//                   >
//                     {column.accessor(item, index)}
//                   </td>
//                 ))}
//                 {rowActions && (
//                   <td className=" w-[30px] border-gray-200 gap-1   h-8 justify-end">
//                     <div className="flex">
//                       {onView && (
//                         <button
//                           className="text-blue-600  flex items-center   px-1  bg-blue-50 rounded"
//                           onClick={() => onView(item.id)}
//                         >
//                           <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
//                             <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
//                             <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
//                           </svg>
//                         </button>
//                       )}
//                       {onEdit && (
//                         <button
//                           className="text-green-600 gap-1 px-1   bg-green-50 rounded"
//                           onClick={() => onEdit(item.id)}
//                         >
//                           <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
//                             <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
//                           </svg>
//                         </button>
//                       )}
//                       {onDelete && (
//                         <button
//                           className=" text-red-800 flex items-center gap-1 px-1  bg-red-50 rounded"
//                           onClick={() => onDelete(item.id)}
//                         >
//                           <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
//                             <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
//                           </svg>
//                           {/* <span className="text-xs">delete</span> */}
//                         </button>
//                       )}
//                     </div>
//                   </td>
//                 )}
//               </tr>
//             ))
//           )}
//         </tbody>
//       </table>
//       <Pagination />
//     </div>


//   );
// };


import validator from "validator";
import React, { useEffect, useRef, useState,forwardRef } from "react";
import { MultiSelect } from "react-multi-select-component";
import Select from "react-dropdown-select";
import { findFromList } from "../Utils/helper";
import "./index.css";
import { FormControl, MenuItem, TextField } from "@mui/material";
import { push } from "../redux/features/opentabs";
import { useDispatch } from "react-redux";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { Power } from "lucide-react";

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
export const FancyCheckBox = ({ label, value, onChange, readOnly }) => {
  return (
    <label
      style={{ fontSize: 11 }}
      className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer w-full text-xs font-medium text-gray-700 ${readOnly ? "bg-gray-100 cursor-not-allowed" : "hover:bg-gray-50"
        }`}
    >
      <input
        type="checkbox"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
        disabled={readOnly}
        className="accent-blue-600"
      />
      <span className="break-words text-xs text-wrap w-full">{label}</span>
    </label>
  );
};
export const handleOnChangeforpassword = (event, setValue) => {
  const inputValue = event.target.value;
  const inputSelectionStart = event.target.selectionStart;
  const inputSelectionEnd = event.target.selectionEnd;

  const LowerCaseValue = inputValue.toLowerCase();

  const valueBeforeCursor = LowerCaseValue.slice(0, inputSelectionStart);
  const valueAfterCursor = LowerCaseValue.slice(inputSelectionEnd);

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


export const MultiSelectDropdown = ({
  name,
  selected,
  labelName,
  setSelected,
  options,
  readOnly = false,
  tabIndex = null,
  className = "",
  inputClass,
}) => {
  console.log(options, "options");
  console.log(selected, "selected");

  const customSelectStyles = {
    control: (provided, state) => ({
      ...provided,
      minHeight: '22px',
      height: '22px',
      fontSize: '12px',
      borderRadius: '0.5rem', // rounded-lg
      outline: 'none',
      transition: 'all 150ms', // transition-all duration-150
      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', // shadow-sm
      padding: '0.25rem', // p-1
      borderColor: state.isFocused ? '' : '#cbd5e1', // focus:border-blue-500
      boxShadow: state.isFocused ? '0 0 0 1px #3b82f6' : undefined, // focus:ring-1 focus:ring-blue-500
      '&:hover': {
        borderColor: '#94a3b8'
      }
    }),
    valueContainer: (provided) => ({
      ...provided,
      height: '22px',
      padding: '0 8px'
    }),
    input: (provided) => ({
      ...provided,
      margin: '0px',
    }),
    indicatorsContainer: (provided) => ({
      ...provided,
      height: '22px',
    }),
    option: (provided) => ({
      ...provided,
      fontSize: '14px',
      padding: '8px 12px'
    }),
  };

  return (
    <div
      className={`m-1  md:grid-cols-2 items-center z-0 data  ${className}`}
    >
      <label className={`md:text-start   block text-xs font-bold text-slate-700 mb-1${labelName}`}>{name}</label>
      <MultiSelect
        options={options}
        value={selected}
        onChange={readOnly ? () => { } : setSelected}
        labelledBy="Select"
        hasSelectAll={false}
        styles={{
          container: (base) => ({
            ...base,
            fontSize: "12px",
            minHeight: "28px",
          }),
          control: (base) => ({
            ...base,
            padding: "2px",
            borderRadius: "10px",
            boxShadow: "none",
            border: "1px solid #ccc",
            minHeight: "28px",
          }),
          option: (base, state) => ({
            ...base,
            fontSize: "12px",
            backgroundColor: state.isSelected ? "#e0e7ff" : "#fff",
            padding: "4px 8px",
          }),
          chips: (base) => ({
            ...base,
            fontSize: "12px",
            padding: "2px 4px",
          }),
          searchBox: (base) => ({
            ...base,
            fontSize: "12px",
            padding: "2px",
          }),
        }}
      />


    </div>
  );
};
export const TextInput = forwardRef(({
  name,
  label,
  type = "text",
  value,
  setValue,
  readOnly = false,
  className = "",
  required = false,
  disabled = false,
  tabIndex = null,
  onBlur = null,
  width = "full",

},ref) => {
  return (
    <div className={`mb-2 ${width}`}>
      {name && (
        <label className="block text-xs font-bold text-slate-700 mb-1">
          {required ? <RequiredLabel name={label ? label : name} /> : name}
        </label>
      )}
      <input
      ref={ref} 
        type={type}
        value={value}
        onChange={(e) =>
          type === "number"
            ? setValue(e.target.value)
            : handleOnChange(e, setValue)
        }
        onBlur={onBlur}
        placeholder={name}
        readOnly={readOnly}
        disabled={disabled}
        tabIndex={tabIndex ?? undefined}

        className={`w-full px-3 py-1 text-xs border border-gray-300 rounded-lg
          focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
          transition-all duration-150 shadow-sm
          ${readOnly || disabled
            ? "bg-gray-100 text-gray-500 cursor-not-allowed"
            : "bg-white hover:border-gray-400"}
          ${className}`
        }

      />
    </div>
  );
});

export const PasswordTextInput = ({
  name,
  type,
  value,
  setValue,
  readOnly,
  className,
  required = false,
  disabled = false,
  tabIndex = null,
  onBlur = null,
  width,

}) => {
  return (
    <>
      <div className="group input-group  text-sm">
        <label
          htmlFor="title"
          className="input-label group-hover:text-blue-600  font-weight: 100 "
        >
          <span className="flex items-center gap-2  font-weight: 100">
            {required ? <RequiredLabel name={name} /> : `${name}`}
          </span>
        </label>
        <TextField
          id={name}
          variant="standard"
          name={`${name}`}
          className={`input-base field-text p-0.5 rounded border border-gray-500 font-weight: 100 `}
          // placeholder={`${name}`}

          sx={{
            "& .MuiInputBase-input": { fontSize: "12px" },
            "& .MuiInputBase-input.Mui-disabled": {
              color: "#333",
              WebkitTextFillColor: "#333",
            },
          }}
          onBlur={onBlur}
          tabIndex={tabIndex ? tabIndex : undefined}
          type={type}
          // disabled={readOnly}
          required={required}
          value={value}
          onChange={(e) => {
            type === "number"
              ? setValue(e.target.value)
              : handleOnChangeforpassword(e, setValue);
          }}
          readOnly={readOnly}
        />
      </div>
    </>
  );
};

export const LongTextInput = ({
  name,
  type,
  value,
  setValue,
  className,
  readOnly,
  required = false,
  disabled = false,
  tabIndex = null,
}) => {
  return (
    <div className="input-group grid-cols-1 md:grid-cols-2 items-center md:my-0.5 md:px-1 data gap-1">
      <label className="md:text-start flex">
        {required ? <RequiredLabel name={name} /> : `${name}`}
      </label>
      <input
        tabIndex={tabIndex ? tabIndex : undefined}
        type={type}
        disabled={disabled}
        required={required}
        className={className}
        value={value}
        onChange={(e) => {
          type === "number"
            ? setValue(e.target.value)
            : handleOnChange(e, setValue);
        }}
        readOnly={readOnly}
      />
    </div>
  );
};

export const DisabledInput = ({
  name,
  type,
  value,
  className = "",
  textClassName = "",
  tabIndex = null,
}) => {
  return (
    <div
      className={`grid-cols-1 md:grid-cols-3 items-center md:my-0.5 md:px-1  font-size:11.5px ${className}`}
    >
      <label
        className={`md:text-start flex ${className} input-label group-hover:text-blue-600 `}
      >
        {name}
      </label>
      <input
        tabIndex={tabIndex ? tabIndex : undefined}
        type={type}
        className={`input-field ${textClassName}  p-0.5 focus:outline-none md:col-span-1 border-b border-b-gray-500 group-hover:text-blue-600  text-xs  w-32`}
        value={value}
        disabled
      />
    </div>
  );
};

export const SpecialInput = ({
  name,
  type,
  value,
  className = "",
  textClassName = "",
  tabIndex = null,
}) => {
  return (
    <div
      className={`flex flex-col  md:my-0.5 md:px-1  font-size:16.5px ${className}  gap-4 border-b border-b-gray-500 w-32 `}
    >
      <label
        className={`md:text-start flex ${className}  group-hover:text-blue-600  w-32`}
      >
        {name}
      </label>
      <input
        tabIndex={tabIndex ? tabIndex : undefined}
        type={type}
        className={` ${textClassName}   focus:outline-none md:col-span-1  group-hover:text-blue-600  text-xs  w-32`}
        value={value}
      />
    </div>
  );
};

export const FloatingLabelInput = ({
  label,
  type = "text",
  required = false,
  value,
  setValue,
  autoFocus = false,
  disabled = false,
}) => {
  const [focus, setFocus] = useState(autoFocus);
  return (
    <div className="static flex flex-col p-6">
      <label
        className={
          focus || value
            ? "z-0 absolute -translate-y-6 duration-300 "
            : "absolute mx-1 duration-300 text-gray-400"
        }
      >
        {label}
      </label>
      <input
        disabled={disabled}
        id={label}
        type={type}
        className="z-10 transparent border-2 rounded"
        required={required}
        value={value}
        onFocus={(e) => setFocus(true)}
        onBlur={(e) => setFocus(false)}
        onChange={(e) => {
          setValue(e.target.value);
        }}
        autoFocus={autoFocus}
      />
    </div>
  );
};

export const LongDisabledInput = ({
  name,
  type,
  value,
  className,
  tabIndex = null,
}) => {
  return (
    <div
      className={` grid-flow-col  items-center md:my-0.5 md:px-1 data ${className}`}
    >
      <label className={`md:text-start flex ${className} `}>{name}</label>
      <input
        type={type}
        className={`h-6 border border-gray-500 rounded`}
        value={value}
        disabled
      />
    </div>
  );
};

export const TextArea = ({
  name,
  value,
  setValue,
  readOnly,
  required = false,
  disabled = false,
  rows = 3,
  cols = 30,
  tabIndex = null,
  label = null,
  inputClass = "",
  onBlur = null,
}) => {
  return (
    <div className="mb-3 w-full">
      {name && (
        <label className="block text-xs font-bold text-gray-600 mb-1">
          {required ? <RequiredLabel name={label ?? name} /> : (label ?? name)}
        </label>
      )}

      <textarea
        id={name}
        name={name}
        rows={rows}
        cols={cols}
        tabIndex={tabIndex ?? undefined}
        disabled={disabled}
        required={required}
        readOnly={readOnly}
        value={value}
        onChange={(e) => handleOnChange(e, setValue)}
        onBlur={onBlur}
        placeholder={name}
        className={`w-full px-1.5 py-1.5 text-xs border border-gray-300 rounded-lg
          focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
          transition-all duration-150 shadow-sm resize-none
          ${readOnly || disabled
            ? "bg-gray-100 text-gray-500 cursor-not-allowed"
            : "bg-white hover:border-gray-400"}
          ${inputClass}`}
      ></textarea>
    </div>
  );
};


export const DropdownInput = ({
  name,
  beforeChange = () => { },
  onBlur = null,
  options,
  value,
  setValue,
  defaultValue,
  className = "",
  readOnly = false,
  required = false,
  disabled = false,
  clear = false,
  tabIndex = null,
  autoFocus = false,
  width = "full",
  country
}) => {
  const handleOnChange = (e) => {
    const val = e.target.value;
    
    const parsedValue = !isNaN(parseInt(val)) ? parseInt(val) : val;
    setValue(parsedValue);
  };

  const isDisabled = readOnly || disabled;

  


  return (
    <div className={`mb-2 ${width}`}>
      {name && (
        <label className="block text-xs font-bold text-slate-700 mb-1">
          {required ? <RequiredLabel name={name} /> : name}
        </label>
      )}
      <select
        onBlur={onBlur}
        autoFocus={autoFocus}
        tabIndex={tabIndex ?? undefined}
        defaultValue={defaultValue}
        required={required}
        readOnly={readOnly}
        className={`w-full px-3 py-1 text-xs border border-gray-300 rounded-lg
          focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
          transition-all duration-150 shadow-sm
          ${isDisabled
            ? "bg-gray-100 text-black-100 cursor-not-allowed"
            : "bg-white text-gray-900 hover:border-gray-400"}
          ${className}`}
        value={value}
        onChange={(e) => {
          beforeChange();
          handleOnChange(e);
        }}
        disabled={isDisabled}
      >
        <option value="" hidden={!clear} className="text-gray-800">
          Select {name || "option"}
        </option>
        {options?.map((option, index) => (
          <option
            key={index}
            value={option.value}
            className="text-xs py-1.5 text-gray-800"
          >
            {option.show}
          </option>
        ))}
      </select>
    </div>
  );
};

export const DropdownInputForm = ({
  name,
  beforeChange = () => { },
  onBlur = null,
  options,
  value,
  setValue,
  defaultValue,
  className,
  readOnly,
  required = false,
  disabled = false,
  clear = false,
  tabIndex = null,
  autoFocus = false,
  width = "32",
}) => {
  const handleOnChange = (e) => {
    setValue(e.target.value);
  };

  return (
    <div className="input-group items-center md:my-1 md:px-1 data ">
      <label className={`md:text-start flex  text-xs ${className}`}>
        {required ? <RequiredLabel name={name} /> : `${name}`}
      </label>
      <select
        onBlur={onBlur}
        autoFocus={autoFocus}
        tabIndex={tabIndex ? tabIndex : undefined}
        defaultValue={defaultValue}
        id="dd"
        required={required}
        name="name"
        className={` md:col-span-2 col-span-1 px-3  focus:outline-none focus:ring-2 focus:ring-blue-400 border border-gray-300 w-${width}`}
        value={value}
        onChange={(e) => {
          beforeChange();
          handleOnChange(e);
        }}
        disabled={readOnly}
      >
        <option value="" hidden={!clear}>
          Select
        </option>
        {options?.map((option, index) => (
          <option key={index} value={option.value}>
            {option.show}
          </option>
        ))}
      </select>
    </div>
  );
};

export const LongDropdownInput = ({
  name,
  options,
  value,
  setValue,
  defaultValue,
  className,
  readOnly,
  required = false,
  disabled = false,
  clear = false,
  tabIndex = null,
}) => {
  const handleOnChange = (e) => {
    setValue(e.target.value);
  };
  return (
    <div className=" grid-cols-12 items-center md:my-1 md:px-1 data">
      <label className={`text-start col-span-2 `}>
        {required ? <RequiredLabel name={name} /> : `${name}`}
      </label>
      <select
        tabIndex={tabIndex || undefined}
        defaultValue={defaultValue}
        id="dd"
        required={required}
        name="name"
        className={`border border-gray-500 h-6 rounded ${className} col-span-10`}
        value={value}
        onChange={handleOnChange}
        disabled={readOnly || disabled}
      >
        <option value="">Select</option>
        {(Array.isArray(options) ? options : []).map((option, index) => (
          <option key={index} value={option.value}>
            {option.show}
          </option>
        ))}
      </select>
    </div>
  );
};

export const RadioButton = ({
  label,
  value,
  onChange,
  readOnly,
  className,
  tabIndex = null,
}) => {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <input
        type="radio"
        tabIndex={tabIndex ? tabIndex : undefined}
        checked={value}
        onChange={onChange}
      />
      <label>{label}</label>
    </div>
  );
};

export const DropdownInputWithoutLabel = ({
  options,
  value,
  setValue,
  readOnly,
  required = false,
  disabled = false,
  tabIndex = null,
}) => {
  const handleOnChange = (e) => {
    setValue(e.target.value);
  };
  return (
    <div className=" grid-cols-1 md:grid-cols-3 items-center md:my-1 md:px-1 data">
      <select
        tabIndex={tabIndex ? tabIndex : undefined}
        required={required}
        name="name"
        className="input-field md:col-span-2 border col-span-1 rounded"
        value={value}
        onChange={(e) => {
          handleOnChange(e);
        }}
        disabled={readOnly}
      >
        <option value="" hidden>
          Select
        </option>
        {options.map((option, index) => (
          <option key={index} value={option.value}>
            {option.show}
          </option>
        ))}
      </select>
    </div>
  );
};

export const CurrencyInput = ({
  name,
  value,
  setValue,
  readOnly,
  required = false,
  disabled = false,
  tabIndex = null,
}) => {
  const handleOnChange = (e) => {
    setValue(e.target.value);
  };
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 items-center md:my-1 md:px-1 data">
      <label htmlFor="id" className="md:text-start flex">
        {required ? <RequiredLabel name={name} /> : `${name}`}
      </label>
      <input
        tabIndex={tabIndex ? tabIndex : undefined}
        type="number"
        disabled={disabled}
        required={required}
        className=" focus:outline-none md:col-span-2  rounded"
        min="1"
        step="any"
        id="id"
        value={value}
        onChange={(e) => {
          handleOnChange(e);
        }}
        readOnly={readOnly}
      />
    </div>
  );
};

const RequiredLabel = ({ name }) => (
  <p>
    {`${name}`}
    <span className="text-red-500">*</span>{" "}
  </p>
);

export const DateInput = ({
  name,
  value,
  setValue,
  readOnly,
  required = false,
  type = "date",
  disabled = false,
  tabIndex = null,
  inputClass = "",
  inputHead = null,
}) => {
  return (
    <div className="flex flex-col gap-1 w-full">
      <label className="block text-xs font-bold text-slate-700 ">

        {inputHead ?? name}
      </label>

      <div className="relative">
        <input
          id={name}
          name={name}
          type={type}
          tabIndex={tabIndex}
          disabled={disabled}
          required={required}
          readOnly={readOnly}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className={`
         w-full px-3 py-1 text-xs border border-gray-300 rounded-lg
          focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
          transition-all duration-150 shadow-sm
            ${readOnly ? "bg-gray-100 text-gray-500 cursor-not-allowed" : "bg-white"}
            ${disabled ? "opacity-50 bg-gray-100 cursor-not-allowed" : ""}
            ${inputClass}
          `}
        />
      </div>
    </div>
  );
};

export const DateInputNew = ({
  name,
  value,
  setValue,
  readOnly,
  required = false,
  type = "",
  disabled = false,
  tabIndex = null,
  inputClass,
  inputHead,
}) => {
  console.log(type, "type");

  const today = new Date().toISOString().split("T")[0];
  return (
    <div className="   grid-cols-1 md:grid-cols-3 items-center  md:px-1 w-24">
      <label
        htmlFor="id"
        className={`md:text-start flex  pb-[3px] text-xs ${inputHead} font-semibold group-hover:text-blue-600`}
      >
        {required ? <RequiredLabel name={name} /> : `${name}`}
      </label>
      <input
        tabIndex={tabIndex ? tabIndex : undefined}
        type={type}
        disabled={disabled}
        required={required}
        min={type === "date" ? today : undefined}
        className={`focus:outline-none md:col-span-2 border border-gray-400 text-xs p-0.5  rounded-md w-24 ${inputClass}`}
        id="id"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
        }}
        readOnly={readOnly}
      />
    </div>
  );
};

export const LongDateInput = ({
  name,
  value,
  setValue,
  readOnly,
  className,
  required = false,
  type = "date",
  disabled = false,
  tabIndex = null,
}) => {
  return (
    <div className=" grid-flow-col item-center justify-center gap-12 w-56 items-center md:px-1 data">
      <label htmlFor="id" className="md:text-start flex">
        {required ? <RequiredLabel name={name} /> : `${name}`}
      </label>
      <input
        tabIndex={tabIndex ? tabIndex : undefined}
        type={type}
        disabled={disabled}
        required={required}
        className={`${className} focus:outline-none border border-gray-500 form-border-color rounded h-6`}
        id="id"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
        }}
        readOnly={readOnly}
      />
    </div>
  );
};

export const CheckBox = ({
  name,
  value,
  setValue,
  readOnly = false,
  className,
  required = false,
  disabled = false,
  tabIndex = null,
}) => {
  const handleOnChange = (e) => {
    setValue(!value);
  };

  return (
    <div className="items-center md:my-1 md:px-1 data text-xs ">
      <label
        htmlFor="id"
        className={`md:text-start items-center ${className}  text-xs`}
      >
        <input
          tabIndex={tabIndex ? tabIndex : undefined}
          type="checkbox"
          required={required}
          className="mx-2 py-2"
          checked={value}
          onChange={(e) => {
            handleOnChange(e);
          }}
          disabled={readOnly}
        />
        {name}
      </label>
    </div>
  );
};

export const validateEmail = (data) => {
  return validator.isEmail(data);
};

export const validateMobile = (data) => {
  let regMobile = /^[6-9]\d{9}$/;
  return regMobile.test(data);
};

export const validatePan = (data) => {
  let regpan = /^([a-zA-Z]){5}([0-9]){4}([a-zA-Z]){1}?$/;
  return regpan.test(data);
};

export const validatePincode = (data) => {
  return data.toString().length === 6;
};

export const DropdownWithSearch = ({
  className,
  options,
  value,
  setValue,
  readOnly,
  disabled,
  required = false,

  labelField,
  label,
}) => {
  console.log(options, "options");

  const dispatch = useDispatch();


  const [currentIndex, setCurrentIndex] = useState("");
  useEffect(() => setCurrentIndex(new Date()), []);
  useEffect(() => {
    const dropDownElement = document.getElementById(`dropdown${currentIndex}`);
    dropDownElement.addEventListener("keydown", function (ev) {
      var focusableElementsString = '[tabindex="0"]';
      let ol = dropDownElement.querySelectorAll(focusableElementsString);
      if (ev.key === "ArrowDown") {
        for (let i = 0; i < ol.length; i++) {
          if (ol[i] === ev.target) {
            let o = i < ol.length - 1 ? ol[i + 1] : ol[0];
            o.focus();
            break;
          }
        }
        ev.preventDefault();
      } else if (ev.key === "ArrowUp") {
        for (let i = 0; i < ol.length; i++) {
          if (ol[i] === ev.target) {
            let o = ol[i - 1];
            o.focus();
            break;
          }
        }
        ev.preventDefault();
      }
    });

    return () => {
      dropDownElement.removeEventListener("keydown", () => { });
    };
  }, [currentIndex]);

  return (
    <div id={`dropdown${currentIndex}`} className={`${className} mb-2`}>
      {label && (
        <label className="block text-xs font-bold text-slate-700 mb-1">
          {required ? <RequiredLabel name={label} /> : `${label}`}

        </label>
      )}
      <select
        // className="border border-gray-300 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400 w-full"
        className={`w-full px-2 py-1 text-xs border border-slate-300 rounded-md 
          focus:border-indigo-300 focus:outline-none transition-all duration-200
          hover:border-slate-400 ${readOnly || disabled ? "bg-slate-100" : ""
          } ${className}`}

        disabled={disabled}
        readOnly={readOnly}
        value={value || ""}
        onChange={(e) => {
          setValue(e.target.value)
        }}
      >
        {/* {!value && <option value="">Select {optionName}</option>} */}

        <option value={""}>Select</option>
        {(options || []).map((option) => (
          <option key={option.id} value={option.id} classname>
            {option[labelField]}
          </option>
        ))}
      </select>
    </div>
  );
};

export const Modal = ({ isOpen, onClose = null, children, widthClass }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center  justify-center overflow-auto bg-gray-800 bg-opacity-50 mb-5">
      <div className={`relative bg-white rounded-lg ${widthClass}`}>
        {onClose ? (
          <button
            className="absolute top-0 hover:bg-red-400 right-0 m-4 text-gray-600 hover:text-gray-800 focus:outline-none mb-5"
            onClick={onClose}
          >
            <svg
              className="h-6 w-6 fill-current "
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <title>Close</title>
              <path
                d="M14.348 5.652a.999.999 0 00-1.414 0L10 8.586l-2.93-2.93a.999.999 0 10-1.414 1.414L8.586 10l-2.93 2.93a.999.999 0 101.414 1.414L10 11.414l2.93 2.93a.999.999 0 101.414-1.414L11.414 10l2.93-2.93a.999.999 0 000-1.414z"
                fillRule="evenodd"
              />
            </svg>
          </button>
        ) : (
          ""
        )}
        {children}
      </div>
    </div>
  );
};

export const ToggleButton = ({
  name,
  value,
  setActive,
  required,
  readOnly,
  disabled = false,
}) => {
  const [isToggled, setIsToggled] = useState(false);

  useEffect(() => {
    if (value) {
      setIsToggled(true);
    } else {
      setIsToggled(false);
    }
  }, [value, isToggled]);

  return (
    <div>
      <div className="">
        {/* <label className={`md:text-start flex`}>{required ? <RequiredLabel name={name} /> : `${name}`}</label> */}
        <div className="flex items-center">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={isToggled}
              onChange={() => {
                if (!readOnly) {
                  setIsToggled(!isToggled);
                  setActive(!value);
                }
              }}
              disabled={disabled}
              required
            />
            <div className="w-12 h-6 bg-gray-300 rounded-full peer-checked:bg-green-500 peer transition duration-300"></div>
            <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full peer-checked:translate-x-6 transition-transform duration-300 shadow-sm"></div>
          </label>

          <span className="ml-2 block text-xs font-bold text-gray-600">{value ? "Active" : "Inactive"}</span>
        </div>
      </div>
    </div>
  );
};


const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
export function isValidPAN(pan) {
  return panRegex.test(pan.toUpperCase());
}
const ACTIVE = (
  <div className="bg-gradient-to-r from-green-200 to-green-500 inline-flex items-center justify-center rounded-full border-2 w-6 border-green-500 shadow-lg text-white hover:scale-110 transition-transform duration-300">
    <Power size={10} />
  </div>
);
const INACTIVE = (
  <div className="bg-gradient-to-r from-red-200 to-red-500 inline-flex items-center justify-center rounded-full border-2 w-6 border-red-500 shadow-lg text-white hover:scale-110 transition-transform duration-300">
    <Power size={10} />
  </div>
);

export const ReusableTable = ({
  columns,
  data,
  itemsPerPage = 10,
  onView,
  onEdit,
  onDelete,
  emptyStateMessage = 'No data available',
  rowActions = true,
  width
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math?.ceil(data?.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = data?.slice(indexOfFirstItem, indexOfLastItem);



  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const Pagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex flex-col font-segoe sm:flex-row justify-between items-center p-2 bg-white border-t border-gray-200">
        <div className="text-sm text-gray-600 mb-2 sm:mb-0">
          Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, data?.length)} of {data?.length} entries
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded-md ${currentPage === 1
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
          >
            <FaChevronLeft className="inline" />
          </button>

          {Array?.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }

            return (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={`px-3 py-1 rounded-md ${currentPage === pageNum
                  ? 'bg-indigo-800 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
              >
                {pageNum}
              </button>
            );
          })}

          {totalPages > 5 && currentPage < totalPages - 2 && (
            <span className="px-3 py-1">...</span>
          )}

          {totalPages > 5 && currentPage < totalPages - 2 && (
            <button
              onClick={() => handlePageChange(totalPages)}
              className={`px-3 py-1 rounded-md ${currentPage === totalPages
                ? 'bg-indigo-800 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
            >
              {totalPages}
            </button>
          )}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-3 py-1 rounded-md ${currentPage === totalPages
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
          >
            <FaChevronRight className="inline" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-[#F1F1F0] shadow-sm overflow-hidden">
      <table className=" border-collapse">
        <thead className="bg-gray-200 text-gray-800">
          <tr>

            {columns?.map((column, index) => (
              <th
                key={index}
                className={` font-medium text-gray-900 py-2 text-[12px] px-8 text-center uppercase  ${column.header !== "" ? 'border-r border-white/50' : ''} `}

              >
                {column.header}
              </th>
            ))}
            {rowActions && (
              <th className="px-4 py-2 text-center text-[12px] font-medium justify-end">ACTIONS</th>
            )}
          </tr>
        </thead>
        <tbody>
          {currentItems?.length === 0 ? (
            <tr>
              <td colSpan={columns?.length + (rowActions ? 1 : 0)} className="px-4 py-4 text-center text-gray-500">
                {emptyStateMessage}
              </td>
            </tr>
          ) : (
            currentItems?.map((item, index) => (
              <tr
                key={item.id}
                className={`hover:bg-gray-50 transition-colors border-b   border-gray-200 text-[12px] ${index % 2 === 0 ? "bg-white" : "bg-gray-100"
                  }`}
              >
                {columns?.map((column, colIndex) => (
                  <td
                    key={colIndex}
                    className={` ${column.className ? column.className : ""} ${column.header !== "" ? 'border-r  border-white/50' : ''} h-8 `}
                  >
                    {column.accessor(item, index)}
                  </td>
                ))}
                {rowActions && (
                  <td className=" w-[40px]  border-gray-200 gap-1 border-l p-2  h-8 justify-end">
                    <div className="flex">
                      {onView && (
                        <button
                          className="text-blue-600  flex items-center   px-2 mr-2  bg-blue-50 rounded"
                          onClick={() => onView(item.id)}
                          title="View"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                      )}
                      {onEdit && (
                        <button
                          className="text-green-600 gap-1 px-1 mr-2   bg-green-50 rounded"
                          onClick={() => onEdit(item.id)}
                          title="Edit"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                        </button>
                      )}
                      {onDelete && (
                        <button
                          className=" text-red-800 flex items-center gap-1 px-1  bg-red-50 rounded"
                          onClick={() => onDelete(item.id)}
                          title="Delete"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          {/* <span className="text-xs">delete</span> */}
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
      <Pagination />
    </div>


  );
};

export const TextAreaInput = ({
  name,
  value,
  setValue,
  readOnly = false,
  required = false,
  disabled = false,
  tabIndex = null,
  rows = 2,
  className = ""
}) => {
  return (
    <div className="group input-group text-md">
      <label htmlFor={name} className="input-label group-hover:text-blue-600 font-weight: 100">
        <span className="flex items-center gap-2 font-weight: 100">
          {required ? <RequiredLabel name={name} /> : `${name}`}
        </span>
      </label>
      <textarea
        id={name}
        name={name}
        rows={rows}
        className={`w-full px-2 py-1 text-sm border border-slate-300 rounded-md 
          focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all duration-200 
          hover:border-slate-400 resize-none ${className}`}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        readOnly={readOnly}
        disabled={disabled}
        tabIndex={tabIndex ?? undefined}
      />
    </div>
  );
};