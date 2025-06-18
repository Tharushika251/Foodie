import React from 'react';

const RestaurantDetails = ({ 
  restaurant, 
  isEditingRestaurant, 
  setIsEditingRestaurant, 
  handleRestaurantChange, 
  handleRestaurantSubmit,
  handleRestaurantImageUpload 
}) => {
  if (!restaurant) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">No restaurant details found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Restaurant Details</h2>
        {!isEditingRestaurant && (
          <button
            onClick={() => setIsEditingRestaurant(true)}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
          >
            Edit Details
          </button>
        )}
      </div>

      {isEditingRestaurant ? (
        <form onSubmit={handleRestaurantSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Restaurant Name
              </label>
              <input
                type="text"
                name="name"
                value={restaurant.name}
                onChange={handleRestaurantChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-slate-700 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Address
              </label>
              <input
                type="text"
                name="address"
                value={restaurant.address}
                onChange={handleRestaurantChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-slate-700 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Opening Time
              </label>
              <input
                type="time"
                name="openTime"
                value={restaurant.openTime}
                onChange={handleRestaurantChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-slate-700 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Closing Time
              </label>
              <input
                type="time"
                name="closeTime"
                value={restaurant.closeTime}
                onChange={handleRestaurantChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-slate-700 dark:text-white"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Restaurant Image
            </label>
            <div className="flex items-center space-x-4">
              <div className="w-32 h-32 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
                {restaurant.imageUrl ? (
                  <img
                    src={restaurant.imageUrl}
                    alt={restaurant.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <span className="text-gray-500 dark:text-gray-400">No Image</span>
                  </div>
                )}
              </div>
              <label className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600 transition">
                Upload Image
                <input
                  type="file"
                  className="hidden"
                  onChange={handleRestaurantImageUpload}
                  accept="image/*"
                />
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setIsEditingRestaurant(false)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
            >
              Save Changes
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-gray-50 dark:bg-slate-700 rounded-xl p-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center">
            <div className="md:w-1/3">
              <div className="w-full md:w-48 h-48 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
                {restaurant.imageUrl ? (
                  <img
                    src={restaurant.imageUrl}
                    alt={restaurant.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <span className="text-gray-500 dark:text-gray-400">No Image</span>
                  </div>
                )}
              </div>
            </div>
            <div className="md:w-2/3 mt-4 md:mt-0 md:ml-6 space-y-3">
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Restaurant Name</h3>
                <p className="text-lg font-semibold text-gray-800 dark:text-white">{restaurant.name}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Address</h3>
                <p className="text-lg font-semibold text-gray-800 dark:text-white">{restaurant.address}</p>
              </div>
              <div className="flex space-x-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Opening Time</h3>
                  <p className="text-lg font-semibold text-gray-800 dark:text-white">{restaurant.openTime}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Closing Time</h3>
                  <p className="text-lg font-semibold text-gray-800 dark:text-white">{restaurant.closeTime}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantDetails;
