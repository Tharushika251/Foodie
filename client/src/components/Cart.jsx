// components/Cart.jsx
import React from 'react';
import { getCart, getCartTotal, updateItemQuantity, removeItemFromCart, clearCart } from '../utils/cartUtils';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Cart = ({ isOpen, onClose }) => {
  const cart = getCart();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  if (!isOpen) return null;
  
  if (!cart || cart.items.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-md w-full mx-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Your Cart</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-center py-8">Your cart is empty</p>
          <button 
            onClick={onClose}
            className="w-full py-2 bg-green-500 text-white rounded-md hover:bg-green-600 mt-4"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }
  
  const handleCheckout = () => {
    const isAuthenticated = Boolean(currentUser && Object.keys(currentUser).length > 0);
    if (!isAuthenticated) {
        onClose();
        sessionStorage.setItem('redirectAfterLogin', '/pickup');
        navigate('/login');
        return;
      }
      
      navigate('/pickup');
      onClose();
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Your Cart</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">{cart.restaurantName}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{cart.restaurantAddress}</p>
        </div>
        
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {cart.items.map((item) => (
            <div key={item.menuItemId} className="py-4">
              <div className="flex justify-between">
                <div>
                  <h4 className="text-gray-800 dark:text-gray-200 font-medium">{item.menuItemName}</h4>
                  <p className="text-gray-600 dark:text-gray-400">LKR {item.menuItemPrice.toFixed(2)}</p>
                </div>
                <div className="flex items-center">
                  <button 
                    onClick={() => updateItemQuantity(item.menuItemId, item.qty - 1)}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                  >
                    -
                  </button>
                  <span className="mx-2 w-6 text-center">{item.qty}</span>
                  <button 
                    onClick={() => updateItemQuantity(item.menuItemId, item.qty + 1)}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="flex justify-between mt-2">
                <button 
                  onClick={() => removeItemFromCart(item.menuItemId)}
                  className="text-sm text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
                <span className="font-medium text-gray-800 dark:text-gray-200">
                  LKR {(item.menuItemPrice * item.qty).toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
          <div className="flex justify-between font-medium text-lg mb-4">
            <span>Total:</span>
            <span>LKR {getCartTotal().toFixed(2)}</span>
          </div>
          
          <div className="flex space-x-4">
            <button 
              onClick={() => {
                clearCart();
                onClose();
              }}
              className="flex-1 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Clear Cart
            </button>
            <button 
              onClick={handleCheckout}
              className="flex-1 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
