import { useState } from 'react';
import { HiX, HiQrcode, HiChevronDown } from 'react-icons/hi';

const barcodeDatabase = {
  '890123456789': {
    description: 'Premium Product X',
    hsn: '1234',
    rate: 2499,
    unit: 'pcs'
  },
  '890987654321': {
    description: 'Standard Product Y',
    hsn: '5678',
    rate: 1299,
    unit: 'pcs'
  },
  '890111222333': {
    description: 'Deluxe Product Z',
    hsn: '9012',
    rate: 3499,
    unit: 'pcs'
  },
  '890444555666': {
    description: 'Economy Product A',
    hsn: '3456',
    rate: 799,
    unit: 'pcs'
  }
};

export default function BarcodeScanner({ onClose, onScan }) {
  const [barcodeInput, setBarcodeInput] = useState('');
  const [isManualEntry, setIsManualEntry] = useState(false);
  const [showBarcodeList, setShowBarcodeList] = useState(false);

  const handleScan = () => {
    if (!barcodeInput) return;
    
    const itemData = barcodeDatabase[barcodeInput] || {
      description: `Scanned Item (${barcodeInput})`,
      hsn: '',
      rate: 0,
      unit: 'pcs'
    };
    
    onScan(itemData);
    setBarcodeInput('');
    setShowBarcodeList(false);
  };

  const handleBarcodeSelect = (barcode) => {
    setBarcodeInput(barcode);
    setShowBarcodeList(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-4 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium text-lg flex items-center">
            <HiQrcode className="w-5 h-5 mr-2" />
            Barcode Scanner
          </h3>
          <button onClick={onClose} className="text-white bg-red-500 p-1 rounded-full hover:bg-red-700">
            <HiX className="w-5 h-5" />
          </button>
        </div>
        
        <div className="space-y-4">
          {isManualEntry ? (
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700">Enter Barcode</label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <input
                  type="text"
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  className="flex-1 block w-full border border-gray-300 rounded-l-md py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  autoFocus
                  placeholder="Scan or select barcode"
                />
                <button
                  onClick={() => setShowBarcodeList(!showBarcodeList)}
                  className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 hover:bg-gray-100"
                >
                  <HiChevronDown className="h-5 w-5" />
                </button>
              </div>
              
              {showBarcodeList && (
                <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                  {Object.keys(barcodeDatabase).map((barcode) => (
                    <div
                      key={barcode}
                      onClick={() => handleBarcodeSelect(barcode)}
                      className="cursor-pointer hover:bg-indigo-100 px-4 py-2"
                    >
                      <div className="font-medium">{barcode}</div>
                      <div className="text-sm text-gray-500">{barcodeDatabase[barcode].description}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gray-100 h-48 flex items-center justify-center rounded-md">
              <p className="text-gray-500">Barcode scanner view would appear here</p>
            </div>
          )}
          
          <div className="flex justify-between items-center">
            <button
              onClick={() => {
                setIsManualEntry(!isManualEntry);
                setShowBarcodeList(false);
              }}
              className="text-sm text-indigo-600 hover:text-indigo-800"
            >
              {isManualEntry ? 'Use Camera Scanner' : 'Enter Barcode Manually'}
            </button>
            
            <button
              onClick={handleScan}
              disabled={isManualEntry && !barcodeInput}
              className={`px-4 py-1 text- rounded-md border border-green-600 hover:text-white text-green-600 hover:bg-green-700 ${isManualEntry && !barcodeInput ? 'bg-white' : 'bg-white hover:bg-green-700'}`}
            >
              {isManualEntry ? 'Add Item' : 'Simulate Scan'}
            </button>
          </div>
        </div>
        
        <div className="mt-4 text-xs text-gray-500">
          <p>Note: This is a simulation. In a real app, this would interface with a barcode scanner.</p>
        </div>
      </div>
    </div>
  );
}