import { useState } from 'react';
import { HiPlus, HiPencil, HiTrash } from 'react-icons/hi';
import { FaBarcode } from 'react-icons/fa';
import BarcodeScanner from './BarcodeScanner';
import ItemManager from './ItemManager';
import { FaArrowRight } from 'react-icons/fa';

export default function ItemList() {
  const [items, setItems] = useState([]);
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const addNewItem = (newItem) => {
    if (editingItem) {
      setItems(items.map(item => item.id === editingItem.id ? newItem : item));
      setEditingItem(null);
    } else {
      setItems([...items, { ...newItem, id: Date.now() }]);
    }
    setShowAddPopup(false);
  };

  const handleBarcodeScanned = (barcodeData) => {
    const newItem = {
      id: Date.now(),
      description: barcodeData.description || 'Scanned Item',
      hsn: barcodeData.hsn || '',
      qty: 1,
      unit: barcodeData.unit || 'pcs',
      rate: barcodeData.rate || 0,
      discount: 0,
      taxable: barcodeData.rate || 0,
      cgst: 0,
      sgst: 0,
      amount: barcodeData.rate || 0
    };
    setItems([...items, newItem]);
    setShowBarcodeScanner(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowAddPopup(true);
  };

  const handleDelete = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleQtyChange = (id, newQty) => {
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, qty: newQty } : item
      )
    );
  };

  return (
    <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm">
      <div className="flex justify-between items-center mb-2">
        <h2 className="font-medium text-slate-700">Item List</h2>
        <div className="flex gap-2 items-center">
  <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
    <input
      type="text"
      placeholder="Enter Barcode"
      className="px-2 py-1 text-sm outline-none"
    />
    <button
      className="bg-indigo-600 hover:bg-indigo-700 text-white px-2 py-1"
    >
      <FaArrowRight className="w-4 h-4" />
    </button>
  </div>

  {/* Existing Barcode Button */}
  <button
    onClick={() => setShowBarcodeScanner(true)}
    className="hover:bg-indigo-600 text-indigo-600 hover:text-white px-2 py-1 rounded-md border border-indigo-600 flex items-center text-sm"
  >
    <FaBarcode className="w-3 h-3 mr-1" />
    Barcode
  </button>

  {/* Existing Add Item Button */}
  <button
    onClick={() => {
      setEditingItem(null);
      setShowAddPopup(true);
    }}
    className="hover:bg-green-600 text-green-600 hover:text-white border border-green-600 px-2 py-1 rounded-md flex items-center text-sm"
  >
    <HiPlus className="w-3 h-3 mr-1" />
    Add Item
  </button>
</div>

      </div>

      <div className="overflow-x-auto">
        <ItemTable
          items={items}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onQtyChange={handleQtyChange}
        />
      </div>

      {showAddPopup && (
        <ItemManager
          item={editingItem}
          onClose={() => setShowAddPopup(false)}
          onSave={addNewItem}
        />
      )}

      {showBarcodeScanner && (
        <BarcodeScanner
          onClose={() => setShowBarcodeScanner(false)}
          onScan={handleBarcodeScanned}
        />
      )}
    </div>
  );
}

function ItemTable({ items, onEdit, onDelete, onQtyChange }) {
  return (
    <table className="w-full border-collapse">
      <thead className="bg-gray-200 text-gray-800">
        <tr>
          {[
            "No.",
            "Item & Description",
            "HSN/SAC",
            "Qty",
            "Unit",
            "Rate (₹)",
            "Discount (₹)",
            "Taxable (₹)",
            "CGST (₹)",
            "SGST (₹)",
            "Amt (₹)",
            "Actions"
          ].map((header, index, arr) => (
            <th
              key={header}
              className={`px-4 py-2 text-left font-medium text-[13px] ${index < arr.length - 1 ? 'border-r border-white/50' : ''}`}
            >
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {items.length === 0 ? (
          <tr>
            <td colSpan={12} className="px-4 py-4 text-center text-gray-500">
              No items found
            </td>
          </tr>
        ) : (
          items.map((item, index) => (
            <tr
              key={item.id}
              className={`hover:bg-gray-50 transition-colors border-b border-gray-200 text-[12px] ${index % 2 === 0 ? "bg-white" : "bg-gray-100"}`}
            >
              <td className="px-4 py-1 border-r border-gray-200">{index + 1}</td>
              <td className="px-4 py-1 border-r border-gray-200">{item.description}</td>
              <td className="px-4 py-1 border-r border-gray-200">{item.hsn}</td>
              <td className="px-4 py-1 border-r border-gray-200">
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => onQtyChange(item.id, Math.max(0, item.qty - 1))}
                    className="px-2 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={item.qty}
                    onChange={(e) => onQtyChange(item.id, parseInt(e.target.value) || 0)}
                    className="w-12 text-center border border-gray-300 rounded px-1 text-xs"
                  />
                  <button
                    onClick={() => onQtyChange(item.id, item.qty + 1)}
                    className="px-2 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                  >
                    +
                  </button>
                </div>
              </td>
              <td className="px-4 py-1 border-r border-gray-200">{item.unit}</td>
              <td className="px-4 py-1 border-r border-gray-200">
                {typeof item.rate === 'number' ? item.rate.toFixed(2) : '0.00'}
              </td>
                <td className="px-4 py-1 border-r border-gray-200">
                {typeof item.discount === 'number' ? item.discount.toFixed(2) : '0.00'}
              </td>
               <td className="px-4 py-1 border-r border-gray-200">
                {typeof item.taxable === 'number' ? item.taxable.toFixed(2) : '0.00'}
              </td>
                <td className="px-4 py-1 border-r border-gray-200">
                {typeof item.cgst === 'number' ? item.cgst.toFixed(2) : '0.00'}
              </td>
               <td className="px-4 py-1 border-r border-gray-200">
                {typeof item.sgst === 'number' ? item.sgst.toFixed(2) : '0.00'}
              </td>
                 <td className="px-4 py-1 border-r border-gray-200">
                {typeof item.amount === 'number' ? item.amount.toFixed(2) : '0.00'}
              </td>
           
              <td className="px-4 py-1">
                <div className="flex space-x-2">
                  <button
                    onClick={() => onEdit(item)}
                    className="text-green-600 hover:text-green-800 bg-green-50 px-2 py-1 rounded text-xs flex items-center gap-1"
                  >
                    <HiPencil className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(item.id)}
                    className="text-red-600 hover:text-red-800 bg-red-50 px-2 py-1 rounded text-xs flex items-center gap-1"
                  >
                    <HiTrash className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}
