import React from 'react';
import { X } from 'lucide-react';

const OrderDetails = ({ order, closeOrderDetails }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Order Details</h2>
                        <button
                            onClick={closeOrderDetails}
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between border-b pb-2 dark:border-slate-700">
                            <span className="font-medium text-gray-600 dark:text-gray-300">Order ID:</span>
                            <span className="text-gray-800 dark:text-white">{order.id}</span>
                        </div>

                        <div className="flex justify-between border-b pb-2 dark:border-slate-700">
                            <span className="font-medium text-gray-600 dark:text-gray-300">Restaurant:</span>
                            <span className="text-gray-800 dark:text-white">{order.restaurant}</span>
                        </div>

                        <div className="flex justify-between border-b pb-2 dark:border-slate-700">
                            <span className="font-medium text-gray-600 dark:text-gray-300">Date:</span>
                            <span className="text-gray-800 dark:text-white">{order.date}</span>
                        </div>

                        <div className="flex justify-between border-b pb-2 dark:border-slate-700">
                            <span className="font-medium text-gray-600 dark:text-gray-300">Status:</span>
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                {order.status}
                            </span>
                        </div>

                        <div className="flex justify-between border-b pb-2 dark:border-slate-700">
                            <span className="font-medium text-gray-600 dark:text-gray-300">Payment Method:</span>
                            <span className="text-gray-800 dark:text-white">{order.paymentMethod}</span>
                        </div>

                        <div>
                            <h3 className="font-medium text-gray-600 dark:text-gray-300 mb-2">Order Items:</h3>
                            <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-3">
                                {order.items && order.items.map((item, index) => (
                                    <div key={index} className="flex justify-between py-2 border-b last:border-0 dark:border-slate-600">
                                        <div>
                                            <span className="text-gray-800 dark:text-white">{item.menuItemName}</span>
                                            <span className="text-gray-500 dark:text-gray-400 ml-2">x{item.qty}</span>
                                        </div>
                                        <span className="text-gray-800 dark:text-white">${(item.menuItemPrice * item.qty).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="pt-4 space-y-2">
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-300">Subtotal:</span>
                                <span className="text-gray-800 dark:text-white">${order.orderAmount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-300">Delivery Fee:</span>
                                <span className="text-gray-800 dark:text-white">${order.deliveryFee.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between font-bold pt-2 border-t dark:border-slate-700">
                                <span className="text-gray-800 dark:text-white">Total:</span>
                                <span className="text-gray-800 dark:text-white">${order.total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetails;
