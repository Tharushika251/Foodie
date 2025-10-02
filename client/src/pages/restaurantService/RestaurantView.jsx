import React, { useState, useEffect } from 'react';
import RestaurantCard from '../../components/RestaurantCard';
import MenuItemCard from '../../components/MenuItemCard';
import { api } from '../../utils/fetchapi';

const RestaurantList = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [filteredMenuItems, setFilteredMenuItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeTab, setActiveTab] = useState('restaurants');

  const categories = ['All', 'Pizza', 'Pasta', 'Burger', 'Chinese', 'Indian', 'Thai', 'Lankan'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch restaurants
        const restaurantsResponse = await api.getAllRestaurants();
        setRestaurants(restaurantsResponse);
        setFilteredRestaurants(restaurantsResponse);

        // Fetch menu items from all restaurants
        const allMenuItems = [];
        for (const restaurant of restaurantsResponse) {
          try {
            const menuItemsResponse = await api.getMenuItemsByRestaurant(restaurant._id);
            const menuItemsWithRestaurant = menuItemsResponse.map(item => ({
              ...item,
              restaurantId: restaurant._id,
              restaurantName: restaurant.name,
              restaurantImage: restaurant.imageUrl,
              restaurantCategory: restaurant.category,
              restaurantAddress: restaurant.address
            }));
            allMenuItems.push(...menuItemsWithRestaurant);
          } catch (err) {
            console.error(`Error fetching menu items for ${restaurant.name}:`, err);
          }
        }

        setMenuItems(allMenuItems);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const searchTermLower = searchTerm.toLowerCase().trim();

    // Filter restaurants
    const restaurantResults = restaurants.filter(restaurant => {
      const matchesCategory = selectedCategory === 'All' || restaurant.category === selectedCategory;
      if (!matchesCategory) return false;

      if (!searchTermLower) return true;

      return (
        restaurant.name.toLowerCase().includes(searchTermLower) ||
        (restaurant.category && restaurant.category.toLowerCase().includes(searchTermLower)) ||
        (restaurant.address && restaurant.address.toLowerCase().includes(searchTermLower))
      );
    });

    // Filter menu items
    const menuItemResults = menuItems.filter(menuItem => {
      const restaurant = restaurants.find(r => r._id === menuItem.restaurantId);
      if (!restaurant) return false;

      const matchesCategory = selectedCategory === 'All' || restaurant.category === selectedCategory;
      if (!matchesCategory) return false;

      if (!searchTermLower) return false;

      return (
        menuItem.name.toLowerCase().includes(searchTermLower) ||
        (menuItem.description && menuItem.description.toLowerCase().includes(searchTermLower)) ||
        (menuItem.category && menuItem.category.toLowerCase().includes(searchTermLower))
      );
    });

    setFilteredRestaurants(restaurantResults);
    setFilteredMenuItems(menuItemResults);

    // Auto-switch to menu items tab if menu items are found in search
    if (searchTermLower && menuItemResults.length > 0) {
      setActiveTab('menuItems');
    } else if (searchTermLower && menuItemResults.length === 0 && restaurantResults.length > 0) {
      setActiveTab('restaurants');
    } else if (!searchTermLower) {
      setActiveTab('restaurants');
    }
  }, [searchTerm, selectedCategory, restaurants, menuItems]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  const getTotalResults = () => {
    if (!searchTerm.trim()) {
      return filteredRestaurants.length;
    }
    return filteredRestaurants.length + filteredMenuItems.length;
  };

  const renderContent = () => {
    // When no search term, show restaurants with category filter
    if (!searchTerm.trim()) {
      if (filteredRestaurants.length > 0) {
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRestaurants.map((restaurant) => (
              <RestaurantCard key={restaurant._id} restaurant={restaurant} />
            ))}
          </div>
        );
      } else {
        return (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">No restaurants found matching your criteria.</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('All');
              }}
              className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        );
      }
    }

    // When searching, show tabs
    return (
      <>
        {/* Results Header with Tabs */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {getTotalResults()} results for "{searchTerm}"
            </h2>
          </div>

          {/* Tabs for switching between restaurants and menu items */}
          <div className="flex border-b border-gray-200 dark:border-slate-700">
            <button
              onClick={() => setActiveTab('restaurants')}
              className={`px-4 py-2 font-medium text-sm ${activeTab === 'restaurants'
                  ? 'border-b-2 border-green-500 text-green-600 dark:text-green-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
            >
              Restaurants ({filteredRestaurants.length})
            </button>
            {filteredMenuItems.length > 0 && (
              <button
                onClick={() => setActiveTab('menuItems')}
                className={`px-4 py-2 font-medium text-sm ${activeTab === 'menuItems'
                    ? 'border-b-2 border-green-500 text-green-600 dark:text-green-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
              >
                Menu Items ({filteredMenuItems.length})
              </button>
            )}
          </div>
        </div>

        {/* Results Content */}
        {activeTab === 'restaurants' ? (
          filteredRestaurants.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRestaurants.map((restaurant) => (
                <RestaurantCard key={restaurant._id} restaurant={restaurant} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="max-w-md mx-auto">
                <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">No restaurants found</p>
                <p className="text-gray-400 dark:text-gray-500 text-sm mb-4">
                  No restaurants match your search for "{searchTerm}"{selectedCategory !== 'All' ? ` in ${selectedCategory}` : ''}.
                </p>
                {filteredMenuItems.length > 0 && (
                  <button
                    onClick={() => setActiveTab('menuItems')}
                    className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    View {filteredMenuItems.length} Menu Items Instead
                  </button>
                )}
              </div>
            </div>
          )
        ) : (
          // Menu Items Tab
          filteredMenuItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMenuItems.map((menuItem) => (
                <MenuItemCard key={`${menuItem._id}-${menuItem.restaurantId}`} menuItem={menuItem} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="max-w-md mx-auto">
                <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">No menu items found</p>
                <p className="text-gray-400 dark:text-gray-500 text-sm mb-4">
                  No menu items match your search for "{searchTerm}"{selectedCategory !== 'All' ? ` in ${selectedCategory}` : ''}.
                </p>
                <button
                  onClick={() => setActiveTab('restaurants')}
                  className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  View Restaurants Instead
                </button>
              </div>
            </div>
          )
        )}
      </>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Restaurants</h1>

        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search for restaurants, food items, or dishes..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full px-4 py-3 pl-10 rounded-xl border border-gray-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 dark:bg-slate-800 dark:text-white"
            />
            <div className="absolute left-3 top-3.5 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="mb-8 overflow-x-auto">
          <div className="flex space-x-2 pb-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${selectedCategory === category
                    ? 'bg-green-500 text-white'
                    : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-slate-600 hover:bg-gray-100 dark:hover:bg-slate-700'
                  }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {renderContent()}
      </div>
    </div>
  );
};

export default RestaurantList;