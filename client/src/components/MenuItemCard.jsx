import React from 'react';
import { useNavigate } from 'react-router-dom';

const MenuItemCard = ({ menuItem }) => {
    const navigate = useNavigate();

    const handleCardClick = () => {
        navigate(`/restaurant/${menuItem.restaurantId}`);
    };

    return (
        <div
            className="bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
            onClick={handleCardClick}
        >
            <div className="h-48 w-full overflow-hidden">
                {menuItem.imageUrls && menuItem.imageUrls.length > 0 ? (
                    <img
                        src={menuItem.imageUrls[0]}
                        alt={menuItem.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <span className="text-gray-500 dark:text-gray-400">No Image</span>
                    </div>
                )}
            </div>

            <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{menuItem.name}</h3>
                    <span className="text-lg font-bold text-green-600 dark:text-green-400">
                        LKR {menuItem.price.toFixed(2)}
                    </span>
                </div>

                {menuItem.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                        {menuItem.description}
                    </p>
                )}

                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-800 dark:text-white">
                            {menuItem.restaurantName}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {menuItem.restaurantCategory}
                        </p>
                    </div>

                    <span className={`px-2 py-1 text-xs rounded-full ${menuItem.isAvailable
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                        {menuItem.isAvailable ? 'Available' : 'Unavailable'}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default MenuItemCard;