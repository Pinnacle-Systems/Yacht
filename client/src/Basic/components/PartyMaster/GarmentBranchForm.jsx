import { useState } from 'react';
import { XMarkIcon, MapPinIcon, BuildingStorefrontIcon, PhoneIcon, EnvelopeIcon, GlobeAltIcon } from '@heroicons/react/24/outline';

const GarmentBranchForm = ({ onClose }) => {
    const [formData, setFormData] = useState({
        branchName: '',
        address: '',
        contactNumber: '',
        email: '',
        website: '',
        openingHours: '',
        managerName: '',
        isMainBranch: false
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle form submission
        console.log(formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-[F1F1F0] rounded-lg shadow-xl w-full max-w-md overflow-hidden">
                <div className="flex justify-between bg-white items-center my-2 rounded-md mx-3 px-4 py-1">
                    <h3 className="text-gray-800 font-semibold text-sm">Add New Branch</h3>
                    <button onClick={onClose} className="text-white hover:text-indigo-200">
                        <XMarkIcon className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-3">
                    <div className="space-y-2">
                        <label className="block text-xs font-medium text-gray-700">Branch Name*</label>
                        <div className="relative">
                            <BuildingStorefrontIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                name="branchName"
                                value={formData.branchName}
                                onChange={handleChange}
                                required
                                className="pl-9 w-full px-3 py-2 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                placeholder="Main Showroom"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-xs font-medium text-gray-700">Full Address*</label>
                        <div className="relative">
                            <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                required
                                rows={2}
                                className="pl-9 w-full px-3 py-2 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                placeholder="123 Fashion St, Textile District"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <label className="block text-xs font-medium text-gray-700">Contact Number*</label>
                            <div className="relative">
                                <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="tel"
                                    name="contactNumber"
                                    value={formData.contactNumber}
                                    onChange={handleChange}
                                    required
                                    className="pl-9 w-full px-3 py-2 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    placeholder="+1234567890"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-xs font-medium text-gray-700">Email</label>
                            <div className="relative">
                                <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="pl-9 w-full px-3 py-2 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    placeholder="branch@example.com"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <label className="block text-xs font-medium text-gray-700">Website</label>
                            <div className="relative">
                                <GlobeAltIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="url"
                                    name="website"
                                    value={formData.website}
                                    onChange={handleChange}
                                    className="pl-9 w-full px-3 py-2 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    placeholder="https://example.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-xs font-medium text-gray-700">Opening Hours</label>
                            <input
                                type="text"
                                name="openingHours"
                                value={formData.openingHours}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                placeholder="9:00 AM - 8:00 PM"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-xs font-medium text-gray-700">Manager Name</label>
                        <input
                            type="text"
                            name="managerName"
                            value={formData.managerName}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            placeholder="John Doe"
                        />
                    </div>

                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            name="isMainBranch"
                            id="isMainBranch"
                            checked={formData.isMainBranch}
                            onChange={handleChange}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <label htmlFor="isMainBranch" className="ml-2 block text-xs text-gray-700">
                            This is the main branch
                        </label>
                    </div>

                    <div className="pt-2 flex justify-end space-x-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded-md text-xs font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-indigo-600 rounded-md text-xs font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Save Branch
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default GarmentBranchForm;