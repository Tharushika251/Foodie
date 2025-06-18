const USER_SERVICE_API_URL = 'http://localhost:5000/api';
const RESTUARANT_SERVICE_API_URL = 'http://localhost:5001/api';
const PAYMENT_SERVICE_API_URL = 'http://localhost:5002/api';
const ORDER_SERVICE_API_URL = 'http://localhost:5003/api';
const NOTIFICATION_SERVICE_API_URL = 'http://localhost:5004/api';
const DELIVERY_SERVICE_API_URL = 'http://localhost:5005/api';
;

const fetchApi = async (endpoint, options = {}) => {
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    const token = localStorage.getItem('token');
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const config = {
        ...options,
        headers,
    };

    try {
        const response = await fetch(`${endpoint}`, config);
        // console.log('API Request:', { endpoint, options });
        // console.log('API Response:', response);

        if (response.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
            return null;
        }

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            const text = await response.text();
            const data = text ? JSON.parse(text) : {};

            if (!response.ok) {
                throw new Error(data.message || 'Something went wrong');
            }

            return data;
        } else {

            if (!response.ok) {
                throw new Error('Something went wrong');
            }

            return { success: true };
        }
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
};



export const api = {
    // User
    login: (credentials) =>
        fetchApi(USER_SERVICE_API_URL + '/users/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        }),

    register: (userData) =>
        fetchApi(USER_SERVICE_API_URL + '/users', {
            method: 'POST',
            body: JSON.stringify(userData)
        }),

    getCurrentUser: (user_id) =>
        fetchApi(USER_SERVICE_API_URL + '/users/' + user_id, {
            method: 'GET'
        }),

    editProfile: (userData, user_id) =>
        fetchApi(USER_SERVICE_API_URL + '/users/' + user_id, {
            method: 'PUT',
            body: JSON.stringify(userData)
        }),

    updateProfileImage: (userData, user_id) =>
        fetchApi(USER_SERVICE_API_URL + '/users/pic/' + user_id, {
            method: 'PUT',
            body: JSON.stringify(userData)
        }),

    getCurrentUser: (email) =>
        fetchApi(`${USER_SERVICE_API_URL}/users/${email}`),

    
    //Restaurant
    createRestaurant: (restaurantData) =>
        fetchApi(RESTUARANT_SERVICE_API_URL + '/restaurant', {
            method: 'POST',
            body: JSON.stringify(restaurantData)
        }),

    updateRestaurant: (id, restaurantData) =>
        fetchApi(RESTUARANT_SERVICE_API_URL + '/restaurant/' + id, {
            method: 'PUT',
            body: JSON.stringify(restaurantData)
        }),

    createMenuItem: (restaurantData) =>
        fetchApi(RESTUARANT_SERVICE_API_URL + '/menu', {
            method: 'POST',
            body: JSON.stringify(restaurantData)
        }),

    updateMenuItem: (restaurantId, restaurantData) =>
        fetchApi(RESTUARANT_SERVICE_API_URL + '/menu/' + restaurantId, {
            method: 'PUT',
            body: JSON.stringify(restaurantData)
        }),

    verifyRestaurant: (restaurantId, status) =>
        fetchApi(RESTUARANT_SERVICE_API_URL + '/restaurant/verify/' + restaurantId, {
            method: 'PUT',
            body: JSON.stringify({ status: status })
        }),

    getRestaurantByOwnerId: (userId) =>
        fetchApi(RESTUARANT_SERVICE_API_URL + '/restaurant/owner/' + userId, {
            method: 'GET'
        }),

    getUnverifiedRestuarants: () =>
        fetchApi(RESTUARANT_SERVICE_API_URL + '/restaurant/unverified', {
            method: 'GET'
        }),

    deleteMenuItem: (menuId) =>
        fetchApi(RESTUARANT_SERVICE_API_URL + '/menu/' + menuId, {
            method: 'DELETE'
        }),

    getMenuItemsByRestaurant: (restaurantId) =>
        fetchApi(RESTUARANT_SERVICE_API_URL + '/menu/restaurant/' + restaurantId, {
            method: 'GET'
        }),

    getAllRestuarants: () =>
        fetchApi(RESTUARANT_SERVICE_API_URL + '/restaurant', {
            method: 'GET'
        }),

    getRestaurantById: (id) =>
        fetchApi(RESTUARANT_SERVICE_API_URL + '/restaurant/' + id, {
            method: 'GET'
        }),

    getMenuItemsByRestaurant: (restaurantId) =>
        fetchApi(RESTUARANT_SERVICE_API_URL + '/menu/restaurant/' + restaurantId, {
            method: 'GET'
        }),


    //Order
    createOrder: (orderDetails) =>
        fetchApi(ORDER_SERVICE_API_URL + '/order/', {
            method: 'POST',
            body: JSON.stringify(orderDetails)
        }),

    getOrderByUser: (user_id) =>
        fetchApi(ORDER_SERVICE_API_URL + '/order/user/' + user_id, {
            method: 'GET'
        }),

    getUnverifiedOrders: (restaurantId) =>
        fetchApi(ORDER_SERVICE_API_URL + '/order/verify/' + restaurantId, {
            method: 'GET'
        }),

    updateOrderStatus: (orderId, status) =>
        fetchApi(ORDER_SERVICE_API_URL + `/order/verify/${orderId}/${status}`, {
            method: 'PUT',
        }),

    //Payment
    createPaymentLink: (orderDetails) =>
        fetchApi(PAYMENT_SERVICE_API_URL + '/payment/', {
            method: 'POST',
            body: JSON.stringify(orderDetails)
        }),

    // Delivery
    getNearbyDeliveries: (longitude, latitude, maxDistance = 10000) =>
        fetchApi(`${DELIVERY_SERVICE_API_URL}/deliveries/nearby?longitude=${longitude}&latitude=${latitude}&maxDistance=${maxDistance}`),

    getRiderDeliveries: (riderId) =>
        fetchApi(`${DELIVERY_SERVICE_API_URL}/deliveries/rider/${riderId}`),

    getDeliveryById: (deliveryId) =>
        fetchApi(`${DELIVERY_SERVICE_API_URL}/deliveries/${deliveryId}`),

    acceptDelivery: (deliveryId, riderId) =>
        fetchApi(`${DELIVERY_SERVICE_API_URL}/deliveries/${deliveryId}/accept`, {
            method: 'PUT',
            body: JSON.stringify({ riderId })
        }),

    updateDeliveryStatus: (deliveryId, status) =>
        fetchApi(`${DELIVERY_SERVICE_API_URL}/deliveries/${deliveryId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        }),

    getDeliverIdByOrder: (orderId,) =>
        fetchApi(`${DELIVERY_SERVICE_API_URL}/deliveries/order/${orderId}`, {
            method: 'GET'
        }),

    getDeliveriesByRider: (riderId,) =>
        fetchApi(`${DELIVERY_SERVICE_API_URL}/deliveries/rider/${riderId}`, {
            method: 'GET'
        }),

    updateRiderLocation: (deliveryId, latitude, longitude) =>
        fetchApi(`${DELIVERY_SERVICE_API_URL}/deliveries/${deliveryId}/location`, {
            method: 'PUT',
            body: JSON.stringify({ latitude, longitude })
        }),

    getActiveDelivery: (riderId) =>
        fetchApi(`${DELIVERY_SERVICE_API_URL}/deliveries/rider/${riderId}/active`),

    trackDelivery: (deliveryId) =>
        fetchApi(`${DELIVERY_SERVICE_API_URL}/deliveries/${deliveryId}/track`),

    getDeliveryByOrderId: (orderId) =>
        fetchApi(`${DELIVERY_SERVICE_API_URL}/deliveries/order/${orderId}`),

};

export default api;
