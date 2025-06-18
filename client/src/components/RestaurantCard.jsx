import React from 'react';
import { Link } from 'react-router-dom';

const RestaurantCard = ({ restaurant }) => {
  return (
    <Link to={`/restaurant/${restaurant._id}`} className="restaurant-card-link">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02]">
        <div className="h-48 w-full overflow-hidden">
          <img 
            src={restaurant.imageUrl || '/placeholder-restaurant.jpg'} 
            alt={restaurant.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{restaurant.name}</h3>
            <span className={`px-2 py-1 text-xs rounded-full ${restaurant.isOpen ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
              {restaurant.isOpen ? 'Open' : 'Closed'}
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{restaurant.address}</p>
          <div className="mt-2 flex flex-wrap gap-1">
            {restaurant.tags && restaurant.tags.map((tag, index) => (
              <span key={index} className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300">
                {tag}
              </span>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {restaurant.openTime} - {restaurant.closeTime}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default RestaurantCard;