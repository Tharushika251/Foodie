import React from 'react';
import { X, MapPin, Clock } from 'lucide-react';

const DeliveryDetails = ({ delivery, closeDeliveryDetails }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Delivery Details</h2>
                        <button
                            onClick={closeDeliveryDetails}
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between border-b pb-2 dark:border-slate-700">
                            <span className="font-medium text-gray-600 dark:text-gray-300">Delivery ID:</span>
                            <span className="text-gray-800 dark:text-white">{delivery.id}</span>
                        </div>

                        <div className="flex justify-between border-b pb-2 dark:border-slate-700">
                            <span className="font-medium text-gray-600 dark:text-gray-300">Order ID:</span>
                            <span className="text-gray-800 dark:text-white">{delivery.order_id}</span>
                        </div>

                        <div className="flex justify-between border-b pb-2 dark:border-slate-700">
                            <span className="font-medium text-gray-600 dark:text-gray-300">Status:</span>
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${delivery.status === 'completed'
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                    : delivery.status === 'in progress'
                                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                }`}>
                                {delivery.status}
                            </span>
                        </div>

                        <div className="flex justify-between border-b pb-2 dark:border-slate-700">
                            <span className="font-medium text-gray-600 dark:text-gray-300">Date:</span>
                            <span className="text-gray-800 dark:text-white">{delivery.date}</span>
                        </div>

                        <div className="space-y-2">
                            <h3 className="font-medium text-gray-600 dark:text-gray-300">Locations:</h3>

                            <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4 mb-3">
                                <div className="flex items-start">
                                    <div className="bg-green-100 dark:bg-green-900 p-2 rounded-full mr-3">
                                        <MapPin size={18} className="text-green-600 dark:text-green-300" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-800 dark:text-white">Restaurant Location</p>
                                        <p className="text-gray-600 dark:text-gray-300 mt-1">{delivery.restaurantAddress}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4">
                                <div className="flex items-start">
                                    <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full mr-3">
                                        <MapPin size={18} className="text-blue-600 dark:text-blue-300" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-800 dark:text-white">Customer Location</p>
                                        <p className="text-gray-600 dark:text-gray-300 mt-1">{delivery.customerAddress}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2 pt-4">
                            <h3 className="font-medium text-gray-600 dark:text-gray-300">Delivery Timeline:</h3>

                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-300 flex items-center">
                                        <Clock size={16} className="mr-2 text-green-500" /> Accepted:
                                    </span>
                                    <span className="text-gray-800 dark:text-white">{delivery.acceptedAt}</span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-300 flex items-center">
                                        <Clock size={16} className="mr-2 text-yellow-500" /> Food Collected:
                                    </span>
                                    <span className="text-gray-800 dark:text-white">{delivery.collectedAt}</span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-300 flex items-center">
                                        <Clock size={16} className="mr-2 text-blue-500" /> Delivered:
                                    </span>
                                    <span className="text-gray-800 dark:text-white">{delivery.deliveredAt}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeliveryDetails;
