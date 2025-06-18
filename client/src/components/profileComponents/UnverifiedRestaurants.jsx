import React from 'react';

const UnverifiedRestaurants = ({ restaurants, handleVerify, handleDecline }) => {
    return (
        <div>
            <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Unverified Restaurants</h2>
            
            {restaurants.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">No unverified restaurants found.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {restaurants.map(restaurant => (
                        <div key={restaurant._id} className="bg-white dark:bg-slate-700 rounded-lg shadow-md overflow-hidden">
                            <div className="h-40 bg-gray-200 dark:bg-slate-600 relative">
                                {restaurant.imageUrl ? (
                                    <img 
                                        src={restaurant.imageUrl} 
                                        alt={restaurant.name} 
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <span className="text-gray-400 dark:text-gray-500">No Image</span>
                                    </div>
                                )}
                            </div>
                            
                            <div className="p-4">
                                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">{restaurant.name}</h3>
                                <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">{restaurant.address}</p>
                                
                                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
                                    <span>Open: {restaurant.openTime} - {restaurant.closeTime}</span>
                                </div>
                                
                                <div className="flex space-x-3">
                                    <button
                                        onClick={() => handleVerify(restaurant._id)}
                                        className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-md transition-colors"
                                    >
                                        Verify
                                    </button>
                                    <button
                                        onClick={() => handleDecline(restaurant._id)}
                                        className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-md transition-colors"
                                    >
                                        Decline
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default UnverifiedRestaurants;
