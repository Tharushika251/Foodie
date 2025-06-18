import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useContext } from 'react';
import { ThemeContext } from '../../contexts/ThemeContext';
import { api } from '../../utils/fetchapi'

const Order = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { darkMode } = useContext(ThemeContext);
  const [searchParams] = useSearchParams();
  const status = searchParams.get('status');
  const customerId = searchParams.get('customer');
  const [orderCreated, setOrderCreated] = useState(false);
  const [paymentFailed, setPaymentFailed] = useState(false);


  if (!localStorage.getItem("orderDetails")) {
    navigate("/")
  }

  const initialOrderDetails = JSON.parse(localStorage.getItem("orderDetails"));
  const [orderDetails, setOrderDetails] = useState(initialOrderDetails);

  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [isLoading, setIsLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);

  const subtotal = orderDetails.items.reduce((sum, item) => {
    return sum + (item.menuItemPrice * item.qty);
  }, 0);

  const deliveryFee = 100 + (30 * orderDetails.deliveryDistance);
  const total = subtotal + deliveryFee;

  const handlePaymentMethodChange = (e) => {
    setPaymentMethod(e.target.value);
  };

  const updateItemQuantity = (menuItemId, newQty) => {
    if (newQty <= 0) {
      removeItem(menuItemId);
      return;
    }

    const updatedItems = orderDetails.items.map(item =>
      item.menuItemId === menuItemId ? { ...item, qty: newQty } : item
    );

    const updatedOrderDetails = { ...orderDetails, items: updatedItems };
    setOrderDetails(updatedOrderDetails);
    localStorage.setItem("orderDetails", JSON.stringify(updatedOrderDetails));
  };

  const removeItem = (menuItemId) => {
    const updatedItems = orderDetails.items.filter(item => item.menuItemId !== menuItemId);

    if (updatedItems.length === 0) {
      localStorage.removeItem("orderDetails");
      navigate("/");
      return;
    }

    const updatedOrderDetails = { ...orderDetails, items: updatedItems };
    setOrderDetails(updatedOrderDetails);
    localStorage.setItem("orderDetails", JSON.stringify(updatedOrderDetails));
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    console.log('Order submitted:', {
      customer: currentUser?.user_id,
      restaurant: orderDetails.restaurantId,
      restaurantLocation: orderDetails.restaurantLocation,
      customerLocation: orderDetails.customerLocation,
      items: orderDetails.items,
      paymentMethod,
      orderAmount: subtotal,
      deliveryFee,
      total
    });

    if (paymentMethod == "cash") {
      createOrder(currentUser?.user_id);
    } else {
      setIsLoading(true)
      api.createPaymentLink({
        customer: currentUser?.user_id,
        restaurant: orderDetails.restaurantId,
        restaurantLocation: orderDetails.restaurantLocation,
        customerLocation: orderDetails.customerLocation,
        items: orderDetails.items,
        paymentMethod,
        orderAmount: subtotal,
        deliveryFee,
        total
      }).then((paymentLink) => {
        console.log(paymentLink)
        window.location.href = paymentLink;
      });

    }
    setIsLoading(false);
    setOrderComplete(true)
  };

  const createOrder = (userid) => {
    api.createOrder({
      customer: userid,
      restaurant: orderDetails.restaurantId,
      restaurantLocation: orderDetails.restaurantLocation,
      customerLocation: orderDetails.customerLocation,
      items: orderDetails.items,
      paymentMethod,
      orderAmount: subtotal,
      deliveryFee,
      total
    });

    localStorage.removeItem("orderDetails")
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  useEffect(() => {
    if (status && !orderCreated) {
      console.log(status);
      if (status == "success") {
        createOrder(customerId);
        setOrderComplete(true);
        setOrderCreated(true);
      } else if (status == "failed" || status == "cancel") {
        setPaymentFailed(true);
      }
    }
  }, [status, orderCreated]);

  const handleTryAgain = () => {
    setPaymentFailed(false);
    navigate('/order');
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-slate-900 text-white' : 'bg-gray-100 text-gray-800'}`}>
      <div className="container mx-auto py-8 px-4">
        <div className={`max-w-4xl mx-auto rounded-xl shadow-lg ${darkMode ? 'bg-slate-800' : 'bg-white'} p-6`}>
          {paymentFailed ? (
            <div className="text-center py-8">
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-16 w-16 mx-auto ${darkMode ? 'text-red-500' : 'text-red-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h2 className="mt-4 text-2xl font-bold">Payment Failed</h2>
              <p className={`mt-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Your payment was not successful. Please try again or choose a different payment method.
              </p>
              <div className="mt-6 flex justify-center space-x-4">
                <button
                  onClick={handleTryAgain}
                  className={`py-2 px-6 ${darkMode ? 'bg-primary-600 hover:bg-primary-700' : 'bg-primary-500 hover:bg-primary-600'} text-white font-bold rounded-xl transition duration-200`}
                >
                  Try Again
                </button>
                <button
                  onClick={handleBackToHome}
                  className={`py-2 px-6 ${darkMode ? 'bg-gray-600 hover:bg-gray-700' : 'bg-gray-500 hover:bg-gray-600'} text-white font-bold rounded-xl transition duration-200`}
                >
                  Back to Home
                </button>
              </div>
            </div>
          ) : orderComplete ? (
            <div className="text-center py-8">
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-16 w-16 mx-auto ${darkMode ? 'text-green-500' : 'text-green-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="mt-4 text-2xl font-bold">Order Placed Successfully!</h2>
              <p className={`mt-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Your order has been placed and will be delivered shortly.
              </p>
              <button
                onClick={handleBackToHome}
                className={`mt-6 py-2 px-6 ${darkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-primary-500 hover:bg-primary-600'} text-white font-bold rounded-xl transition duration-200`}
              >
                Back to Home
              </button>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold mb-6 text-center">Complete Your Order</h1>

              <div className={`p-4 mb-6 rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-gray-100'}`}>
                <h2 className="text-xl font-semibold">{orderDetails.restaurantName}</h2>
                <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{orderDetails.restaurantAddress}</p>
                <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Delivery Distance: {orderDetails.deliveryDistance} Kilo Metres</p>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Order Items</h3>
                <div className={`rounded-lg overflow-hidden ${darkMode ? 'bg-slate-700' : 'bg-gray-50'}`}>
                  <table className="w-full">
                    <thead className={`${darkMode ? 'bg-slate-600' : 'bg-gray-100'}`}>
                      <tr>
                        <th className="py-2 px-4 text-left">Item</th>
                        <th className="py-2 px-4 text-right">Qty</th>
                        <th className="py-2 px-4 text-right">Price</th>
                        <th className="py-2 px-4 text-right">Subtotal</th>
                        <th className="py-2 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orderDetails.items.map((item) => (
                        <tr key={item.menuItemId} className={`border-t ${darkMode ? 'border-slate-600' : 'border-gray-200'}`}>
                          <td className="py-3 px-4">{item.menuItemName}</td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end">
                              <button
                                onClick={() => updateItemQuantity(item.menuItemId, item.qty - 1)}
                                className={`w-8 h-8 flex items-center justify-center rounded-full ${darkMode ? 'bg-slate-600 hover:bg-slate-500' : 'bg-gray-200 hover:bg-gray-300'}`}
                              >
                                -
                              </button>
                              <span className="mx-2">{item.qty}</span>
                              <button
                                onClick={() => updateItemQuantity(item.menuItemId, item.qty + 1)}
                                className={`w-8 h-8 flex items-center justify-center rounded-full ${darkMode ? 'bg-slate-600 hover:bg-slate-500' : 'bg-gray-200 hover:bg-gray-300'}`}
                              >
                                +
                              </button>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right">LKR {item.menuItemPrice.toFixed(2)}</td>
                          <td className="py-3 px-4 text-right">LKR {(item.menuItemPrice * item.qty).toFixed(2)}</td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => removeItem(item.menuItemId)}
                              className={`p-1 rounded ${darkMode ? 'bg-red-600 hover:bg-red-700' : 'bg-red-500 hover:bg-red-600'} text-white`}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className={`p-4 mb-6 rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-gray-100'}`}>
                <h3 className="text-lg font-semibold mb-3">Order Summary</h3>
                <div className="flex justify-between mb-2">
                  <span>Subtotal</span>
                  <span>LKR {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Delivery Fee</span>
                  <span>LKR {deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg mt-3 pt-3 border-t border-gray-300">
                  <span>Total</span>
                  <span>LKR {total.toFixed(2)}</span>
                </div>
              </div>

              <form onSubmit={handleSubmitOrder}>
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-3">Payment Method</h3>
                  <div className="flex flex-col space-y-3">
                    <label className={`flex items-center p-3 rounded-lg cursor-pointer ${paymentMethod === 'cash'
                      ? (darkMode ? 'bg-green-600 text-white' : 'bg-green-100 border-green-500')
                      : (darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-white hover:bg-gray-50')
                      } border`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cash"
                        checked={paymentMethod === 'cash'}
                        onChange={handlePaymentMethodChange}
                        className="mr-3"
                      />
                      <div>
                        <div className="font-medium">Cash on Delivery</div>
                        <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Pay when your order arrives</div>
                      </div>
                    </label>

                    <label className={`flex items-center p-3 rounded-lg cursor-pointer ${paymentMethod === 'card'
                      ? (darkMode ? 'bg-green-600 text-white' : 'bg-green-100 border-green-500')
                      : (darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-white hover:bg-gray-50')
                      } border`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="card"
                        checked={paymentMethod === 'card'}
                        onChange={handlePaymentMethodChange}
                        className="mr-3"
                      />
                      <div>
                        <div className="font-medium">Card Payment</div>
                        <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Pay now with your credit/debit card</div>
                      </div>
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || orderDetails.items.length === 0}
                  className={`w-full py-3 px-6 ${darkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-primary-500 hover:bg-primary-600'
                    } text-white font-bold rounded-xl transition duration-200 flex justify-center ${(isLoading || orderDetails.items.length === 0) ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                >
                  {isLoading ? (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    `Place Order - LKR ${total.toFixed(2)}`
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Order;
