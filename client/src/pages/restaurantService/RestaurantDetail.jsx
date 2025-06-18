import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../utils/fetchapi';
import { addItemToCart } from '../../utils/cartUtils';

const RestaurantDetail = () => {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [categories, setCategories] = useState(['All']);
  const [cartMessage, setCartMessage] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [itemToAdd, setItemToAdd] = useState(null);

  useEffect(() => {
    const fetchRestaurantData = async () => {
      try {
        setIsLoading(true);
        
        const restaurantData = await api.getRestaurantById(id);
        setRestaurant(restaurantData);
        
        const menuData = await api.getMenuItemsByRestaurant(id);
        setMenuItems(menuData);
        
        const uniqueCategories = [...new Set(menuData.map(item => item.category).filter(Boolean))];
        setCategories(['All', ...uniqueCategories]);
        
      } catch (err) {
        setError(err.message);
        console.error('Error fetching restaurant data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRestaurantData();
  }, [id]);

  const filteredMenuItems = activeCategory === 'All' 
    ? menuItems 
    : menuItems.filter(item => item.category === activeCategory);

  const handleAddToCart = (menuItem) => {
    if (!restaurant) return;
    
    const result = addItemToCart(restaurant, menuItem);
    
    if (result.needsConfirmation) {
      setShowConfirmation(true);
      setItemToAdd(menuItem);
      setCartMessage(result.message);
    } else {
      setCartMessage(result.message);
      setTimeout(() => setCartMessage(null), 3000);
    }
  };

  const handleConfirmClearCart = () => {
    if (itemToAdd && restaurant) {
      localStorage.removeItem('orderDetails');
      const result = addItemToCart(restaurant, itemToAdd);
      setCartMessage(result.message);
      setTimeout(() => setCartMessage(null), 3000);
    }
    setShowConfirmation(false);
    setItemToAdd(null);
  };

  const handleCancelClearCart = () => {
    setShowConfirmation(false);
    setItemToAdd(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">Error: {error || 'Restaurant not found'}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Restaurant Header */}
      <div className="relative h-64 md:h-80">
        <div className="absolute inset-0">
          <img 
            src={restaurant.imageUrl || '/placeholder-restaurant.jpg'} 
            alt={restaurant.name} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        </div>
        <div className="absolute inset-0 flex items-end">
          <div className="p-6 md:p-8 w-full">
            <div className="max-w-7xl mx-auto">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{restaurant.name}</h1>
              <p className="text-gray-200 mb-1">{restaurant.address}</p>
              <div className="flex items-center space-x-4 mt-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  restaurant.isOpen 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {restaurant.isOpen ? 'Open Now' : 'Closed'}
                </span>
                <span className="text-white text-sm">
                  {restaurant.openTime} - {restaurant.closeTime}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Section */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Menu</h2>
        
        {/* Category Filter */}
        <div className="mb-8 overflow-x-auto">
          <div className="flex space-x-2 pb-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                  activeCategory === category
                    ? 'bg-green-500 text-white'
                    : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-slate-600 hover:bg-gray-100 dark:hover:bg-slate-700'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
        
        {/* Cart Message */}
        {cartMessage && (
          <div className="fixed top-20 right-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-md z-50">
            <p>{cartMessage}</p>
          </div>
        )}

        {/* Confirmation Modal */}
        {showConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Replace Cart Items?</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Your cart already contains items from another restaurant. Would you like to clear your cart and add this item instead?
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={handleCancelClearCart}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmClearCart}
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                >
                  Replace Items
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Menu Items */}
        {filteredMenuItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMenuItems.map((item) => (
              <div 
                key={item._id} 
                className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden flex flex-col"
              >
                <div className="h-48 overflow-hidden">
                  {item.imageUrls && item.imageUrls.length > 0 ? (
                    <img 
                      src={item.imageUrls[0]} 
                      alt={item.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 dark:bg-slate-700 flex items-center justify-center">
                      <span className="text-gray-400 dark:text-gray-500">No image</span>
                    </div>
                  )}
                </div>
                <div className="p-4 flex-grow">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">{item.name}</h3>
                    <span className="text-green-600 dark:text-green-400 font-medium">LKR {item.price.toFixed(2)}</span>
                  </div>
                  {item.category && (
                    <span className="inline-block mt-1 px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300">
                      {item.category}
                    </span>
                  )}
                  {item.description && (
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{item.description}</p>
                  )}
                </div>
                <div className="p-4 pt-0">
                  <button 
                    className={`w-full py-2 rounded-md text-white font-medium ${
                      item.isAvailable 
                        ? 'bg-green-500 hover:bg-green-600' 
                        : 'bg-gray-400 cursor-not-allowed'
                    }`}
                    disabled={!item.isAvailable}
                    onClick={() => item.isAvailable && handleAddToCart(item)}
                  >
                    {item.isAvailable ? 'Add to Cart' : 'Not Available'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              {activeCategory === 'All' 
                ? 'No menu items available for this restaurant.' 
                : `No items found in the "${activeCategory}" category.`}
            </p>
            {activeCategory !== 'All' && (
              <button 
                onClick={() => setActiveCategory('All')}
                className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                View All Items
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantDetail;
