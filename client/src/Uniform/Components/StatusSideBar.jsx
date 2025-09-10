import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import { useState } from 'react';


const StatusSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const statusItems = [
    { title: 'PR', status: 'Po Received', code: 'PR' },
    { title: 'AS', status: 'Assigned', code: 'AS' },
    { title: 'SA', status: 'Send to Approval', code: 'SA' },
    { title: 'N', status: 'Approval Status', code: 'N' },
  ];

  // You can map status code to colors if needed
  const statusColorMap = {
    PR: 'bg-blue-100 text-blue-700',
    AS: 'bg-yellow-100 text-yellow-700',
    SA: 'bg-purple-100 text-purple-700',
    N: 'bg-green-100 text-green-700',
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80">
      <div className="bg-white shadow-xl border border-gray-200 rounded-2xl overflow-hidden transition-all duration-300">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-sm transition-colors"
        >
          <span>Status Overview</span>
          {isOpen ? (
            <ChevronDownIcon className="w-5 h-5" />
          ) : (
            <ChevronUpIcon className="w-5 h-5" />
          )}
        </button>

        <div
          className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-88 opacity-100 py-4 px-5' : 'max-h-0 opacity-0 overflow-hidden'
            }`}
        >
          <div className="space-y-1">
            {statusItems.map((item) => (
              <div
                key={item.code}
                className="flex items-center justify-between bg-gray-50 p-1 rounded-lg shadow-sm"
              >
                <p className="text-sm font-medium text-gray-700">{item.title}</p>
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full ${statusColorMap[item.code] || 'bg-gray-100 text-gray-700'
                    }`}
                >
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusSidebar;
