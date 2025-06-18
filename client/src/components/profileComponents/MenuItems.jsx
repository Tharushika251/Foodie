import React from 'react';

const MenuItems = ({
  menuItems,
  isAddingMenuItem,
  editingMenuItem,
  setIsAddingMenuItem,
  setEditingMenuItem,
  handleMenuItemChange,
  handleAddMenuItem,
  handleUpdateMenuItem,
  handleDeleteMenuItem,
  handleMenuItemImageUpload
}) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Menu Items</h2>
        <button
          onClick={() => {
            setIsAddingMenuItem(true);
            setEditingMenuItem({
              name: '',
              description: '',
              price: 0,
              isAvailable: true,
              category: '',
              imageUrls: []
            });
          }}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
        >
          Add New Item
        </button>
      </div>

      {isAddingMenuItem || editingMenuItem ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            {isAddingMenuItem ? 'Add New Menu Item' : 'Edit Menu Item'}
          </h3>
          <form onSubmit={isAddingMenuItem ? handleAddMenuItem : handleUpdateMenuItem} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Item Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={editingMenuItem.name}
                  onChange={handleMenuItemChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-slate-700 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category
                </label>
                <select
                  name="category"
                  value={editingMenuItem.category || ''}
                  onChange={handleMenuItemChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-slate-700 dark:text-white"
                >
                  <option value="">Select a category</option>
                  <option value="Appetizers">Appetizers</option>
                  <option value="Salads">Salads</option>
                  <option value="Main Course">Main Course</option>
                  <option value="Pizzas">Pizzas</option>
                  <option value="Burgers & Sandwiches">Burgers & Sandwiches</option>
                  <option value="Asian Specials">Asian Specials</option>
                  <option value="Mexican">Mexican</option>
                  <option value="Beverages">Beverages</option>
                  <option value="Desserts">Desserts</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Price (LKR)
                </label>
                <input
                  type="number"
                  name="price"
                  value={editingMenuItem.price}
                  onChange={handleMenuItemChange}
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-slate-700 dark:text-white"
                  required
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isAvailable"
                  name="isAvailable"
                  checked={editingMenuItem.isAvailable}
                  onChange={handleMenuItemChange}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="isAvailable" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Available
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={editingMenuItem.description || ''}
                onChange={handleMenuItemChange}
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-slate-700 dark:text-white"
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Item Images
              </label>
              <div className="flex flex-wrap gap-4 mb-2">
                {editingMenuItem.imageUrls && editingMenuItem.imageUrls.map((url, index) => (
                  <div key={index} className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
                    <img src={url} alt={`Item ${index + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        const newUrls = [...editingMenuItem.imageUrls];
                        newUrls.splice(index, 1);
                        setEditingMenuItem({ ...editingMenuItem, imageUrls: newUrls });
                      }}
                      className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-bl-lg"
                    >
                      ×
                    </button>
                  </div>
                ))}
                {(!editingMenuItem.imageUrls || editingMenuItem.imageUrls.length === 0) && (
                  <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                    <span className="text-gray-500 dark:text-gray-400 text-xs text-center">No Images</span>
                  </div>
                )}
              </div>
              <label className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600 transition inline-block">
                Upload Image
                <input
                  type="file"
                  className="hidden"
                  onChange={handleMenuItemImageUpload}
                  accept="image/*"
                />
              </label>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setIsAddingMenuItem(false);
                  setEditingMenuItem(null);
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
              >
                {isAddingMenuItem ? 'Add Item' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.length > 0 ? (
            menuItems.map((item) => (
              <div key={item._id} className="bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-hidden">
                <div className="h-48 w-full overflow-hidden">
                  {item.imageUrls && item.imageUrls.length > 0 ? (
                    <img
                      src={item.imageUrls[0]}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <span className="text-gray-500 dark:text-gray-400">No Image</span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{item.name}</h3>
                      {item.category && (
                        <span className="inline-block px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300 mt-1">
                          {item.category}
                        </span>
                      )}
                    </div>
                    <span className="text-lg font-bold text-green-600 dark:text-green-400">LKR {item.price.toFixed(2)}</span>
                  </div>
                  {item.description && (
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{item.description}</p>
                  )}
                  <div className="mt-3 flex justify-between items-center">
                    <span className={`px-2 py-1 text-xs rounded-full ${item.isAvailable ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                      {item.isAvailable ? 'Available' : 'Unavailable'}
                    </span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setEditingMenuItem(item)}
                        className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteMenuItem(item._id)}
                        className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">No menu items found. Add your first item!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MenuItems;
