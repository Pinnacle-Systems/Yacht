import { useState, useEffect, useMemo } from 'react';
import { FaChevronRight } from 'react-icons/fa';
import { useModal } from '../../../Basic/pages/home/context/ModalContext';
import Select from 'react-select';
import { Country, State, City } from 'country-state-city'; // Updated import

export default function PartyDetailModal() {
  const [isAddressExpanded, setIsAddressExpanded] = useState(false);
  const { closeAddModal } = useModal();
  
  // State for country-state-city dropdowns
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  
  // Generate country options
  const countryOptions = useMemo(() => {
    return Country.getAllCountries().map(country => ({ // Updated method call
      label: country.name,
      value: country.isoCode,
      ...country
    }));
  }, []);
  
  // Generate state options based on selected country
  const stateOptions = useMemo(() => {
    if (!selectedCountry) return [];
    return State.getStatesOfCountry(selectedCountry.value).map(state => ({ // Updated method call
      label: state.name,
      value: state.isoCode,
      ...state
    }));
  }, [selectedCountry]);
  
  // Generate city options based on selected state
  const cityOptions = useMemo(() => {
    if (!selectedState) return [];
    return City.getCitiesOfState(selectedCountry.value, selectedState.value).map(city => ({ // Updated method call
      label: city.name,
      value: city.name,
      ...city
    }));
  }, [selectedState, selectedCountry]);
  
  // Custom styles for react-select to match your design
  const customSelectStyles = {
    control: (provided) => ({
      ...provided,
      minHeight: '36px',
      height: '36px',
      border: '1px solid #cbd5e1',
      borderRadius: '0.375rem',
      fontSize: '0.875rem',
      boxShadow: 'none',
      '&:hover': {
        borderColor: '#cbd5e1'
      }
    }),
    valueContainer: (provided) => ({
      ...provided,
      height: '36px',
      padding: '0 8px'
    }),
    input: (provided) => ({
      ...provided,
      margin: 0,
      padding: 0
    }),
    option: (provided) => ({
      ...provided,
      fontSize: '0.875rem'
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      padding: '4px'
    }),
    indicatorSeparator: () => ({
      display: 'none'
    })
  };

  const handleSave = () => {
    // Handle save logic here
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[#f1f1f0] p-6 rounded-lg shadow-xl w-[50%] max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4 text-slate-800 border-b pb-2">Party Detail</h2>

        <div className="space-y-4">
             <div className="grid grid-cols-5 gap-4 items-start">
            <div className="col-span-3">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Business Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg shadow-sm focus:border-indigo-400 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 text-sm"
                placeholder="Enter business name"
              />
            </div>

            <div className="col-span-2">
              <div className="flex gap-2">
                <div className="w-1/4">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:border-indigo-400 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 text-sm"
                  >
                    <option>Mr.</option>
                    <option>Mrs.</option>
                    <option>Ms.</option>
                    <option>Dr.</option>
                  </select>
                </div>

                <div className="w-3/4">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:border-indigo-400 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 text-sm"
                    placeholder="Enter name"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Mobile <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <select className="w-1/4 px-2 py-2 border border-slate-300 rounded-md focus:border-indigo-300 focus:outline-none text-sm">
                  <option>+91</option>
                  <option>+1</option>
                  <option>+44</option>
                </select>
                <input
                  type="tel"
                  className="w-3/4 px-3 py-2 border border-slate-300 rounded-md focus:border-indigo-300 focus:outline-none text-sm"
                  placeholder="Enter mobile number"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Email</label>
              <input
                type="email"
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:border-indigo-300 focus:outline-none text-sm"
                placeholder="Enter email address"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Industry & Segment</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:border-indigo-300 focus:outline-none text-sm"
                placeholder="Enter industry type"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Website</label>
              <input
                type="url"
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:border-indigo-300 focus:outline-none text-sm"
                placeholder="https://example.com"
              />
            </div>
          </div>

          <div className="border-t pt-4 mt-4">
            <div
              className="flex justify-between items-center mb-3 cursor-pointer"
              onClick={() => setIsAddressExpanded(!isAddressExpanded)}
            >
              <h3 className="text-sm font-semibold text-slate-700 flex items-center">
                <FaChevronRight
                  className={`mr-2 text-xs transition-transform ${isAddressExpanded ? 'rotate-90' : ''}`}
                />
                Address & GST Details
              </h3>
            </div>

            {isAddressExpanded && (
              <div className="space-y-3">
                <div className="grid md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Country
                    </label>
                    <Select
                      styles={customSelectStyles}
                      options={countryOptions}
                      value={selectedCountry}
                      onChange={(option) => {
                        setSelectedCountry(option);
                        setSelectedState(null);
                        setSelectedCity(null);
                      }}
                      placeholder="Select Country"
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      State
                    </label>
                    <Select
                      styles={customSelectStyles}
                      options={stateOptions}
                      value={selectedState}
                      onChange={(option) => {
                        setSelectedState(option);
                        setSelectedCity(null);
                      }}
                      placeholder="Select State"
                      isDisabled={!selectedCountry}
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      City
                    </label>
                    <Select
                      styles={customSelectStyles}
                      options={cityOptions}
                      value={selectedCity}
                      onChange={setSelectedCity}
                      placeholder="Select City"
                      isDisabled={!selectedState}
                      className="text-sm"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">MSME No.</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:border-indigo-300 focus:outline-none text-sm"
                      placeholder="Enter MSME number"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">PAN No.</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:border-indigo-300 focus:outline-none text-sm"
                      placeholder="Enter PAN number"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t mt-4">
            <button
              onClick={() => {
                closeAddModal(); 
                setIsAddressExpanded(false);
              }}
              className="px-5 py-1 text-red-600 hover:text-white bg-white border border-red-700 hover:bg-red-800 rounded-md transition-colors"
            >
              Cancel
            </button>

            <button
              onClick={handleSave}
              className="px-5 py-1 hover:bg-green-600 bg-white text-green-600 border border-green-600 hover:text-white rounded-md transition-colors shadow-sm"
            >
              Save
            </button>
          </div>

          <p className="text-xs text-slate-500 mt-4">
            Fields marked with <span className="text-red-500">*</span> are required
          </p>
        </div>
      </div>
    </div>
  );
}