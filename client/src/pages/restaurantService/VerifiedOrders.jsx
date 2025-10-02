import React, { useState } from 'react';
import {
    ChevronDown,
    ChevronUp,
    Eye,
    Calendar,
    User,
    CreditCard,
    Package,
    Truck,
    CheckCircle,
    Clock,
    Filter
} from 'lucide-react';

const VerifiedOrders = ({ orders, viewOrderDetails }) => {
    const [expandedOrders, setExpandedOrders] = useState({});
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortBy, setSortBy] = useState('newest');

    const toggleOrder = (orderId) => {
        setExpandedOrders(prev => ({
            ...prev,
            [orderId]: !prev[orderId]
        }));
    };

    // Filter and sort orders
    const filteredAndSortedOrders = React.useMemo(() => {
        let filtered = orders;

        // Apply status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(order => order.status === statusFilter);
        }

        // Apply sorting
        filtered = [...filtered].sort((a, b) => {
            switch (sortBy) {
                case 'newest':
                    return new Date(b.placedAt) - new Date(a.placedAt);
                case 'oldest':
                    return new Date(a.placedAt) - new Date(b.placedAt);
                case 'highest':
                    return b.total - a.total;
                case 'lowest':
                    return a.total - b.total;
                default:
                    return 0;
            }
        });

        return filtered;
    }, [orders, statusFilter, sortBy]);

    const getStatusIcon = (status) => {
        switch (status) {
            case 'accepted':
                return <CheckCircle size={16} className="text-green-500" />;
            case 'completed':
                return <Package size={16} className="text-blue-500" />;
            case 'collected':
                return <Truck size={16} className="text-orange-500" />;
            default:
                return <Clock size={16} className="text-gray-500" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'accepted':
                return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800';
            case 'completed':
                return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800';
            case 'collected':
                return 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800';
            default:
                return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-800';
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-LK', {
            style: 'currency',
            currency: 'LKR',
            minimumFractionDigits: 2
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-LK', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    console.log('Verified orders data:', orders);

    if (!orders || orders.length === 0) {
        return (
            <div className="text-center py-16">
                <div className="max-w-md mx-auto">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center">
                        <Package className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        No Verified Orders
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                        Verified orders from customers will appear here once they are processed.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Verified Orders</h1>
                    <p className="text-gray-600 dark:text-gray-300 mt-1">
                        Manage and track your restaurant's confirmed orders
                    </p>
                </div>

                <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                    <Package size={16} />
                    <span>{filteredAndSortedOrders.length} order{filteredAndSortedOrders.length !== 1 ? 's' : ''}</span>
                </div>
            </div>

            {/* Filters and Controls */}
            <div className="flex flex-col sm:flex-row gap-4 p-4 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
                <div className="flex items-center gap-2">
                    <Filter size={16} className="text-gray-400" />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="all">All Status</option>
                        <option value="accepted">Accepted</option>
                        <option value="collected">Collected</option>
                        <option value="completed">Completed</option>
                    </select>
                </div>

                <div className="flex items-center gap-2">
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="highest">Highest Amount</option>
                        <option value="lowest">Lowest Amount</option>
                    </select>
                </div>
            </div>

            {/* Orders List */}
            <div className="space-y-4">
                {filteredAndSortedOrders.map((order) => (
                    <div
                        key={order.order_id}
                        className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 hover:shadow-md transition-all duration-200"
                    >
                        {/* Order Header */}
                        <div
                            className="p-6 cursor-pointer transition-colors"
                            onClick={() => toggleOrder(order.order_id)}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-start space-x-4 flex-1">
                                    <div className="flex-shrink-0 mt-1">
                                        {expandedOrders[order.order_id] ? (
                                            <ChevronUp size={20} className="text-gray-400" />
                                        ) : (
                                            <ChevronDown size={20} className="text-gray-400" />
                                        )}
                                    </div>

                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                                <CreditCard size={14} />
                                                <span>Order ID</span>
                                            </div>
                                            <p className="font-semibold text-gray-900 dark:text-white">{order.order_id}</p>
                                        </div>

                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                                <User size={14} />
                                                <span>Customer</span>
                                            </div>
                                            <p className="font-medium text-gray-900 dark:text-white">
                                                {order.customerName || order.customer}
                                            </p>
                                        </div>

                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                                <Calendar size={14} />
                                                <span>Order Date</span>
                                            </div>
                                            <p className="text-sm text-gray-900 dark:text-white">
                                                {formatDate(order.placedAt)}
                                            </p>
                                        </div>

                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                                <span>Total Amount</span>
                                            </div>
                                            <p className="font-bold text-lg text-gray-900 dark:text-white">
                                                {formatCurrency(order.total)}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 ml-4">
                                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-medium ${getStatusColor(order.status)}`}>
                                        {getStatusIcon(order.status)}
                                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                    </div>

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            viewOrderDetails(order);
                                        }}
                                        className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700"
                                        title="View full order details"
                                    >
                                        <Eye size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Expanded Order Details */}
                        {expandedOrders[order.order_id] && (
                            <div className="border-t border-gray-200 dark:border-slate-700">
                                <div className="p-6 bg-gray-50/50 dark:bg-slate-900/50">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                        {/* Order Items */}
                                        <div>
                                            <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                                <Package size={18} />
                                                Order Items ({order.items.length})
                                            </h4>
                                            <div className="space-y-3">
                                                {order.items.map((item, index) => (
                                                    <div
                                                        key={index}
                                                        className="flex justify-between items-center p-3 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700"
                                                    >
                                                        <div className="flex-1">
                                                            <p className="font-medium text-gray-900 dark:text-white">
                                                                {item.menuItemName}
                                                            </p>
                                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                                {formatCurrency(item.menuItemPrice)} × {item.qty}
                                                            </p>
                                                        </div>
                                                        <p className="font-semibold text-gray-900 dark:text-white">
                                                            {formatCurrency(item.menuItemPrice * item.qty)}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Order Summary & Details */}
                                        <div className="space-y-6">
                                            <div>
                                                <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                                                    Order Summary
                                                </h4>
                                                <div className="space-y-3 p-4 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                                                        <span className="font-medium">{formatCurrency(order.orderAmount)}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-gray-600 dark:text-gray-400">Delivery Fee</span>
                                                        <span className="font-medium">{formatCurrency(order.deliveryFee)}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-slate-700">
                                                        <span className="font-semibold text-gray-900 dark:text-white">Total</span>
                                                        <span className="font-bold text-lg text-gray-900 dark:text-white">
                                                            {formatCurrency(order.total)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                                                    Order Information
                                                </h4>
                                                <div className="space-y-3 p-4 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-gray-600 dark:text-gray-400">Payment Method</span>
                                                        <span className="font-medium capitalize flex items-center gap-2">
                                                            <CreditCard size={14} />
                                                            {order.paymentMethod}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-gray-600 dark:text-gray-400">Order Status</span>
                                                        <span className={`flex items-center gap-2 font-medium ${getStatusColor(order.status)} px-2 py-1 rounded-full text-xs`}>
                                                            {getStatusIcon(order.status)}
                                                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-gray-600 dark:text-gray-400">Placed At</span>
                                                        <span className="font-medium text-sm">
                                                            {formatDate(order.placedAt)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Empty State for Filters */}
            {filteredAndSortedOrders.length === 0 && orders.length > 0 && (
                <div className="text-center py-12">
                    <div className="max-w-md mx-auto">
                        <Filter className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            No Orders Match Your Filters
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400">
                            Try adjusting your filter criteria to see more orders.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VerifiedOrders;