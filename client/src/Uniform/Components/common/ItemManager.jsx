import { useState } from 'react';
import {
  HiX, HiPlus, HiSearch, HiOutlineSelector,
  HiChevronUp, HiChevronDown
} from 'react-icons/hi';
import AddItemPopup from './AddItempopup';

export default function ItemManager({ onClose, onSave }) {
  const initialItems = [
    {
      id: '890123456789',
      description: 'Premium Product X',
      hsn: '1234',
      rate: 2499,
      unit: 'pcs',
      qty: 1,
      discount: 0,
      taxable: 2499,
      cgst: 0,
      sgst: 0,
      amount: 2499,
      checked: false
    },
    {
      id: '890987654321',
      description: 'Standard Product Y',
      hsn: '5678',
      rate: 1299,
      unit: 'pcs',
      qty: 1,
      discount: 0,
      taxable: 1299,
      cgst: 0,
      sgst: 0,
      amount: 1299,
      checked: false
    },
    {
      id: '891123456789',
      description: 'Premium Product Z',
      hsn: '1234',
      rate: 2499,
      unit: 'pcs',
      qty: 1,
      discount: 0,
      taxable: 2499,
      cgst: 0,
      sgst: 0,
      amount: 2499,
      checked: false
    },
    {
      id: '892987654321',
      description: 'Standard Product A',
      hsn: '5678',
      rate: 1299,
      unit: 'pcs',
      qty: 1,
      discount: 0,
      taxable: 1299,
      cgst: 0,
      sgst: 0,
      amount: 1299,
      checked: false
    },
  ];

  const [items, setItems] = useState(initialItems);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'description', direction: 'asc' });

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedItems = [...items].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
    if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const filteredItems = sortedItems.filter(item =>
    item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.hsn.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleCheckbox = (index) => {
    setItems(prev =>
      prev.map((item, i) =>
        i === index ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const handleAddNew = () => {
    setIsAdding(true);
  };

  const handleAddItem = (newItem) => {
    setItems(prev => [...prev, {
      ...newItem,
      id: Date.now().toString(),
      qty: 1,
      discount: 0,
      taxable: newItem.rate,
      cgst: 0,
      sgst: 0,
      amount: newItem.rate,
      checked: false
    }]);
    setIsAdding(false);
  };

  const handleSave = () => {
    const checkedItems = items.filter(item => item.checked);
    if (checkedItems.length === 0) {
      alert('Please select at least one item to add');
      return;
    }
    onSave(checkedItems);
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <HiOutlineSelector className="inline ml-1 opacity-30" />;
    return sortConfig.direction === 'asc' ?
      <HiChevronUp className="inline ml-1" /> :
      <HiChevronDown className="inline ml-1" />;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
      <div className="bg-[#f1f1f0] rounded-lg shadow-2xl w-[50%] max-h-[95vh] flex flex-col overflow-hidden border border-gray-300">
        <div className="flex justify-between items-center bg-[#f1f1f0] px-4 py-3 border-b border-gray-300">
          <h3 className="text-lg font-bold text-gray-800">Item Manager</h3>
          <button onClick={onClose} className="text-white bg-red-500 p-1 rounded-full hover:bg-red-700">
            <HiX className="w-5 h-5" />
          </button>
        </div>

        <div className="px-4 py-3 border-b border-gray-300 bg-[#f1f1f0]">
          <div className="flex items-center gap-2">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <HiSearch className="text-gray-500 w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Search by name or HSN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-full border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={handleAddNew}
              className="flex items-center gap-1 px-3 py-1 border border-green-700 hover:text-white hover:bg-green-700 text-green-600 rounded-lg transition-colors text-sm"
            >
              <HiPlus className="w-4 h-4" />
              <span>Add Item</span>
            </button>
          </div>
        </div>

        {isAdding && (
          <AddItemPopup 
            onClose={() => setIsAdding(false)}
            onSave={handleAddItem}
          />
        )}

        <div className="flex-1 overflow-y-auto bg-[#f1f1f0]">
          <table className="w-full border-collapse">
            <thead className="bg-gray-200 text-gray-800 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-[13px] border-r border-white/50 w-8">
                  <input
                    type="checkbox"
                    className="h-3 w-3"
                    checked={items.length > 0 && items.every(item => item.checked)}
                    onChange={() => {
                      const allChecked = items.every(item => item.checked);
                      setItems(items.map(item => ({ ...item, checked: !allChecked })));
                    }}
                  />
                </th>
                {[
                  "Item & Description",
                  "HSN/SAC",
                  "Unit",
                  "Rate (₹)",
                ].map((header, index) => (
                  <th 
                    key={header}
                    onClick={() => requestSort(header.toLowerCase().split(' ')[0].replace('(₹)', '').replace('&', ''))}
                    className={`px-4 py-2 text-left font-medium text-[13px] ${index < 9 ? 'border-r border-white/50' : ''} cursor-pointer hover:bg-gray-300`}
                  >
                    <div className="flex items-center">
                      {header}
                      {getSortIcon(header.toLowerCase().split(' ')[0].replace('(₹)', '').replace('&', ''))}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredItems.length > 0 ? (
                filteredItems.map((item, index) => (
                  <tr
                    key={item.id}
                    className={`hover:bg-gray-50 transition-colors border-b  border-gray-200 text-[14px] ${item.checked ? "bg-green-50" : index % 2 === 0 ? "bg-white" : "bg-gray-100"}`}
                  >
                    <td className="px-4 py-2 border-r border-gray-200">
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={() => toggleCheckbox(items.findIndex(i => i.id === item.id))}
                        className="h-3 w-3 text-green-600"
                      />
                    </td>
                    <td className="px-4 py-1 border-r border-gray-200 text-[12px]">{item.description}</td>
                    <td className="px-4 py-1 border-r border-gray-200 text-[12px]">{item.hsn}</td>
                    <td className="px-4 py-1 border-r border-gray-200 text-[12px]">{item.unit}</td>
                    <td className="px-4 py-1 border-r border-gray-200 text-[12px]">{item.rate.toFixed(2)}</td>
                   
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={11} className="px-4 py-4 text-center text-gray-500">
                    No items found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-gray-300 px-4 py-3 bg-[f1f1f0] flex justify-end">
          <button
            onClick={handleSave}
            className="bg-white text-green-700 border border-green-700 text-[12px] hover:bg-green-700 hover:text-white font-medium py-1 px-4 rounded-lg"
          >
            Save Selected
          </button>
        </div>
      </div>
    </div>
  );
}