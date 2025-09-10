import { useState } from 'react';
import { HiX, HiCheck } from 'react-icons/hi';

export default function AddItemPopup({ onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    hsn: '',
    barcode: '',
    rate: 0,
    unit: 'pcs'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'rate' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Item name is required');
      return;
    }

    onSave({
      name: formData.name,
      hsn: formData.hsn,
      barcode: formData.barcode,
      rate: formData.rate,
      unit: formData.unit
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
      <div className="bg-[f1f1f0] rounded-lg p-4 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium text-lg">Add New Item</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <HiX className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Item Name*</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Barcode</label>
              <input
                type="text"
                name="barcode"
                value={formData.barcode}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">HSN/SAC</label>
                <input
                  type="text"
                  name="hsn"
                  value={formData.hsn}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Unit</label>
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="pcs">Pieces</option>
                  <option value="kg">Kilogram</option>
                  <option value="m">Meter</option>
                  <option value="l">Liter</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Rate (₹)*</label>
              <input
                type="number"
                name="rate"
                min="0"
                step="0.01"
                value={formData.rate}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center px-4 py-2 text-red-700 shadow-sm text-sm font-medium rounded-md tbg-white border border-red-700 rounded-lg hover:bg-red-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-1 border border-green-600  text-sm font-medium
               rounded-md shadow-sm hover:text-white text-green-600 hover:bg-green-700 
               focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <HiCheck className="w-4 h-4 mr-1" />
              Add Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
