import { HiX, HiHome, HiOfficeBuilding, HiLocationMarker } from "react-icons/hi";
import { useState } from "react";

export default function AddressForm({ onSave, onCancel, initialData = {}, setAddressForm }) {
  const [formData, setFormData] = useState({
    name: initialData.name || "",
    street: initialData.street || "",
    apartment: initialData.apartment || "",
    city: initialData.city || "",
    state: initialData.state || "",
    zip: initialData.zip || "",
    country: initialData.country || "",
    phone: initialData.phone || "",
    type: initialData.type || "home",
    instructions: initialData.instructions || "",
    isDefault: initialData.isDefault || false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center p-2 z-50">
      <div className="bg-[f1f1f0] rounded-xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white z-10 flex justify-between items-center border-b border-slate-200 p-4">
          <h3 className="text-lg font-semibold text-slate-800">
            {initialData.name ? "Edit Address" : "Add New Address"}
          </h3>
          <button
            onClick={() => setAddressForm(false)}
            className="text-white hover:bg-red-700 bg-red-700 p-1 rounded-full transition-colors"
          >
            <HiX className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          <div className="space-y-3">
            {/* Address Type Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Address Type
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({...formData, type: "home"})}
                  className={`flex items-center justify-center p-2 text-sm rounded-md border transition-all ${formData.type === "home" ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-slate-300 hover:border-indigo-300"}`}
                >
                  <HiHome className="mr-1" />
                  Home
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, type: "work"})}
                  className={`flex items-center justify-center p-2 text-sm rounded-md border transition-all ${formData.type === "work" ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-slate-300 hover:border-indigo-300"}`}
                >
                  <HiOfficeBuilding className="mr-1" />
                  Work
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, type: "other"})}
                  className={`flex items-center justify-center p-2 text-sm rounded-md border transition-all ${formData.type === "other" ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-slate-300 hover:border-indigo-300"}`}
                >
                  <HiLocationMarker className="mr-1" />
                  Other
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  placeholder="+1 (123) 456-7890"
                  required
                />
              </div>
            </div>

            {/* Address Line 1 */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Street Address
              </label>
              <input
                type="text"
                name="street"
                value={formData.street}
                onChange={handleChange}
                className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                placeholder="123 Main St"
                required
              />
            </div>

            {/* Address Line 2 */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Apartment, Suite, etc. <span className="text-slate-400">(Optional)</span>
              </label>
              <input
                type="text"
                name="apartment"
                value={formData.apartment}
                onChange={handleChange}
                className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                placeholder="Apt 4B"
              />
            </div>

            {/* City, State, ZIP */}
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  State
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Pin Code
                </label>
                <input
                  type="text"
                  name="zip"
                  value={formData.zip}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  required
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Country
                </label>
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  required
                >
                  <option value="">Select Country</option>
                  <option value="US">United States</option>
                  <option value="CA">Canada</option>
                  <option value="UK">United Kingdom</option>
                  <option value="AU">Australia</option>
                  <option value="IN">India</option>
                </select>
              </div>
            </div>

           
            {/* Default Address Toggle */}
            <div className="flex items-center pt-1">
              <input
                type="checkbox"
                id="defaultAddress"
                name="isDefault"
                checked={formData.isDefault}
                onChange={handleChange}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
              />
              <label htmlFor="defaultAddress" className="ml-2 block text-sm text-slate-700">
                Set as default address
              </label>
            </div>
          </div>

          {/* Form Actions */}
          <div className="mt-6 flex justify-end space-x-2">
          
            <button
              type="submit"
              className="px-4 py-2 text-sm bg-white text-indigo-700 border border-indigo-600  hover:text-white rounded-md hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-indigo-500"
            >
              Save Address
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}