export const getCart = () => {
    const cart = localStorage.getItem('orderDetails');
    return cart ? JSON.parse(cart) : null;
  };
  
  export const saveCart = (cart) => {
    localStorage.setItem('orderDetails', JSON.stringify(cart));
  };
  
  export const clearCart = () => {
    localStorage.removeItem('orderDetails');
  };
  
  export const addItemToCart = (restaurant, menuItem, quantity = 1) => {
    const currentCart = getCart();
    
    if (currentCart && currentCart.restaurantId !== restaurant._id) {
      return {
        success: false,
        message: 'You already have items from another restaurant in your cart.',
        needsConfirmation: true,
        currentRestaurant: currentCart.restaurantName
      };
    }
    
    const cart = currentCart || {
      restaurantId: restaurant._id,
      restaurantName: restaurant.name,
      restaurantLocation: restaurant.location,
      restaurantAddress: restaurant.address,
      items: []
    };
    
    const existingItemIndex = cart.items.findIndex(item => item.menuItemId === menuItem._id);
    
    if (existingItemIndex >= 0) {
      cart.items[existingItemIndex].qty += quantity;
    } else {
      cart.items.push({
        menuItemId: menuItem._id,
        menuItemName: menuItem.name,
        menuItemPrice: menuItem.price,
        qty: quantity
      });
    }
    
    saveCart(cart);
    return { success: true, message: 'Item added to cart' };
  };
  
  export const removeItemFromCart = (menuItemId) => {
    const cart = getCart();
    if (!cart) return;
    
    cart.items = cart.items.filter(item => item.menuItemId !== menuItemId);
    
    if (cart.items.length === 0) {
      clearCart();
    } else {
      saveCart(cart);
    }
  };
  
  export const updateItemQuantity = (menuItemId, quantity) => {
    const cart = getCart();
    if (!cart) return;
    
    const itemIndex = cart.items.findIndex(item => item.menuItemId === menuItemId);
    if (itemIndex >= 0) {
      if (quantity <= 0) {
        removeItemFromCart(menuItemId);
      } else {
        cart.items[itemIndex].qty = quantity;
        saveCart(cart);
      }
    }
  };
  
  export const getCartTotal = () => {
    const cart = getCart();
    if (!cart) return 0;
    
    return cart.items.reduce((total, item) => total + (item.menuItemPrice * item.qty), 0);
  };
  
  export const getCartItemCount = () => {
    const cart = getCart();
    if (!cart) return 0;
    
    return cart.items.reduce((count, item) => count + item.qty, 0);
  };
  