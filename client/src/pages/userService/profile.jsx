import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../utils/fetchapi';
import { createClient } from '@supabase/supabase-js';
import PersonalInformation from '../../components/profileComponents/PersonalInformation';
import EditProfileForm from '../../components/profileComponents/EditProfileForm';
import OrderHistory from '../../components/profileComponents/OrderHistory';
import DeliveryHistory from '../../components/profileComponents/DeliveryHistory';
import OrderDetails from '../../components/profileComponents/OrderDetails';
import DeliveryDetails from '../../components/profileComponents/DeliveryDetails';
import LoadingProfile from '../../components/profileComponents/LoadingProfile';
import SuccessMessage from '../../components/profileComponents/SuccessMessage';
import { Camera, Shield } from 'lucide-react';
import RestaurantDetails from '../../components/profileComponents/RestaurantDetails';
import MenuItems from '../../components/profileComponents/MenuItems';
import UnverifiedRestaurants from '../../components/profileComponents/UnverifiedRestaurants';
import UnverifiedOrders from '../../components/profileComponents/UnverifiedOrders';

const supabaseUrl = 'https://nelqemsnxiomtaosceui.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5lbHFlbXNueGlvbXRhb3NjZXVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU4NTA1OTEsImV4cCI6MjA2MTQyNjU5MX0.blyjPV4hGnAQpaCyWJD1LAljPt5SWa8o4SxvWEAGAUU';
const supabase = createClient(supabaseUrl, supabaseKey);

const Profile = () => {
    const { currentUser, loading: authLoading } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [selectedDelivery, setSelectedDelivery] = useState(null);
    const [deliveries, setDeliveries] = useState([]);
    const [restaurant, setRestaurant] = useState(null);
    const [menuItems, setMenuItems] = useState([]);
    const [isEditingRestaurant, setIsEditingRestaurant] = useState(false);
    const [isAddingMenuItem, setIsAddingMenuItem] = useState(false);
    const [editingMenuItem, setEditingMenuItem] = useState(null);
    const [unverifiedRestaurants, setUnverifiedRestaurants] = useState([]);
    const [unverifiedOrders, setUnverifiedOrders] = useState([]);

    const navigate = useNavigate();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const getOrders = async () => {
        try {
            const response = await api.getOrderByUser(currentUser.user_id);
            const transformedOrders = response.map(order => ({
                id: order.order_id,
                restaurant: order.restaurant,
                date: new Date(order.placedAt).toISOString().split('T')[0],
                status: order.status,
                total: order.total,
                items: order.items,
                orderAmount: order.orderAmount,
                deliveryFee: order.deliveryFee,
                paymentMethod: order.paymentMethod,
                restaurantName: order.restaurantName
            }));

            setFormData(prev => ({
                ...prev,
                recent_orders: transformedOrders
            }));
        } catch (error) {
            console.error('Error getting orders:', error);
            setSuccessMessage('Failed to get orders. Please try again.');
        }
    };

    const getDeliveries = async () => {
        try {
            const response = await api.getDeliveriesByRider(currentUser.user_id);
            const transformedDeliveries = await Promise.all(response.map(async delivery => {
                const restaurantAddress = await getAddressFromCoordinates(
                    delivery.restaurant_location.latitude,
                    delivery.restaurant_location.longitude
                );
                const customerAddress = await getAddressFromCoordinates(
                    delivery.customer_location.latitude,
                    delivery.customer_location.longitude
                );

                return {
                    id: delivery.delivery_id,
                    order_id: delivery.order_id,
                    status: delivery.status,
                    restaurantAddress,
                    customerAddress,
                    date: new Date(delivery.created_at).toISOString().split('T')[0],
                    acceptedAt: delivery.accepted_at ? new Date(delivery.accepted_at).toLocaleString() : '-',
                    collectedAt: delivery.collected_at ? new Date(delivery.collected_at).toLocaleString() : '-',
                    deliveredAt: delivery.delivered_at ? new Date(delivery.delivered_at).toLocaleString() : '-'
                };
            }));

            setDeliveries(transformedDeliveries);
        } catch (error) {
            console.error('Error getting deliveries:', error);
            setSuccessMessage('Failed to get delivery history. Please try again.');
        }
    };

    const getAddressFromCoordinates = async (lat, lng) => {
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            const data = await response.json();
            return data?.display_name || "Address not found";
        } catch (error) {
            console.error("Error fetching address", error);
            return "Error fetching address";
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const updateData = {
                name: formData.name,
                email: formData.email,
                phone_number: formData.phone_number,
                address: formData.address
            };

            const response = await api.editProfile(updateData, currentUser.user_id);
            if (response.status === 200) {
                setIsEditing(false);
                setSuccessMessage('Profile updated successfully!');
                setTimeout(() => setSuccessMessage(''), 3000);
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            setSuccessMessage('Failed to update profile. Please try again.');
            setTimeout(() => setSuccessMessage(''), 3000);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setLoading(true);
            // Preview image
            const reader = new FileReader();
            reader.onload = () => {
                setFormData({ ...formData, profile_image: reader.result });
            };
            reader.readAsDataURL(file);

            // Upload to Supabase
            const fileExt = file.name.split('.').pop();
            const fileName = `${currentUser.user_id}-${Date.now()}.${fileExt}`;
            const filePath = `profile-images/${fileName}`;

            const { error } = await supabase.storage
                .from('foodie')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (error) throw error;

            const { data: urlData } = supabase.storage
                .from('foodie')
                .getPublicUrl(filePath);

            const imageUrl = urlData.publicUrl;
            await api.updateProfileImage({ profileImage: imageUrl }, currentUser.user_id);

            setSuccessMessage('Profile image updated successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            console.error('Error uploading image:', error);
            setSuccessMessage('Failed to update profile image. Please try again.');
            setTimeout(() => setSuccessMessage(''), 3000);
        } finally {
            setLoading(false);
        }
    };

    const getRestaurantDetails = async () => {
        try {
            const response = await api.getRestaurantByOwnerId(currentUser.user_id);
            setRestaurant(response);
            getMenuItems(response);
        } catch (error) {
            navigate('/login')
            console.error('Error getting restaurant details:', error);
            setSuccessMessage('Failed to get restaurant details. Please try again.');
        }
    };

    const getUnverifiedOrders = async () => {
        try {
            if (!restaurant) return;

            const response = await api.getUnverifiedOrders(restaurant._id);
            setUnverifiedOrders(response);
        } catch (error) {
            console.error('Error getting unverified orders:', error);
            setSuccessMessage('Failed to get unverified orders. Please try again.');
        }
    };

    const handleVerifyOrder = async (orderId) => {
        try {
            setLoading(true);
            const response = await api.updateOrderStatus(orderId, 1);
            if (response) {
                setUnverifiedOrders(unverifiedOrders.filter(order => order.order_id !== orderId));
                setSuccessMessage('Order verified successfully!');
                setTimeout(() => setSuccessMessage(''), 3000);
            }
        } catch (error) {
            console.error('Error verifying order:', error);
            setSuccessMessage('Failed to verify order. Please try again.');
            setTimeout(() => setSuccessMessage(''), 3000);
        } finally {
            setLoading(false);
        }
    };

    const handleDeclineOrder = async (orderId) => {
        try {
            setLoading(true);
            const response = await api.updateOrderStatus(orderId, 0);
            if (response) {
                setUnverifiedOrders(unverifiedOrders.filter(order => order.order_id !== orderId));
                setSuccessMessage('Order declined successfully!');
                setTimeout(() => setSuccessMessage(''), 3000);
            }
        } catch (error) {
            console.error('Error declining order:', error);
            setSuccessMessage('Failed to decline order. Please try again.');
            setTimeout(() => setSuccessMessage(''), 3000);
        } finally {
            setLoading(false);
        }
    };

    const getMenuItems = async (restaurant) => {
        try {
            const response = await api.getMenuItemsByRestaurant(restaurant._id);
            setMenuItems(response);
            console.log(response)
            console.log(menuItems)
        } catch (error) {
            console.error('Error getting menu items:', error);
            setSuccessMessage('Failed to get menu items. Please try again.');
        }
    };

    const handleRestaurantChange = (e) => {
        const { name, value } = e.target;
        setRestaurant({ ...restaurant, [name]: value });
    };

    const handleRestaurantSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const response = await api.updateRestaurant(restaurant._id, restaurant);
            if (response) {
                setIsEditingRestaurant(false);
                setSuccessMessage('Restaurant details updated successfully!');
                setTimeout(() => setSuccessMessage(''), 3000);
            }
        } catch (error) {
            console.error('Error updating restaurant:', error);
            setSuccessMessage('Failed to update restaurant details. Please try again.');
            setTimeout(() => setSuccessMessage(''), 3000);
        } finally {
            setLoading(false);
        }
    };

    const handleMenuItemChange = (e, item = null) => {
        const { name, value, type, checked } = e.target;
        const val = type === 'checkbox' ? checked : value;

        if (item) {
            setEditingMenuItem({
                ...editingMenuItem,
                [name]: val
            });
        } else {
            setEditingMenuItem({
                ...editingMenuItem,
                [name]: val
            });
        }
    };

    const handleAddMenuItem = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const newItem = {
                ...editingMenuItem,
                restaurantId: restaurant._id
            };
            const response = await api.createMenuItem(newItem);
            if (response) {
                setMenuItems([...menuItems, response]);
                setIsAddingMenuItem(false);
                setEditingMenuItem(null);
                setSuccessMessage('Menu item added successfully!');
                setTimeout(() => setSuccessMessage(''), 3000);
            }
        } catch (error) {
            console.error('Error adding menu item:', error);
            setSuccessMessage('Failed to add menu item. Please try again.');
            setTimeout(() => setSuccessMessage(''), 3000);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateMenuItem = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const response = await api.updateMenuItem(editingMenuItem._id, editingMenuItem);
            if (response) {
                setMenuItems(menuItems.map(item =>
                    item._id === editingMenuItem._id ? response : item
                ));
                setEditingMenuItem(null);
                setSuccessMessage('Menu item updated successfully!');
                setTimeout(() => setSuccessMessage(''), 3000);
            }
        } catch (error) {
            console.error('Error updating menu item:', error);
            setSuccessMessage('Failed to update menu item. Please try again.');
            setTimeout(() => setSuccessMessage(''), 3000);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteMenuItem = async (itemId) => {
        try {
            setLoading(true);
            const response = await api.deleteMenuItem(itemId);
            if (response) {
                setMenuItems(menuItems.filter(item => item._id !== itemId));
                setSuccessMessage('Menu item deleted successfully!');
                setTimeout(() => setSuccessMessage(''), 3000);
            }
        } catch (error) {
            console.error('Error deleting menu item:', error);
            setSuccessMessage('Failed to delete menu item. Please try again.');
            setTimeout(() => setSuccessMessage(''), 3000);
        } finally {
            setLoading(false);
        }
    };

    const handleRestaurantImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setLoading(true);
            // Upload to Supabase
            const fileExt = file.name.split('.').pop();
            const fileName = `restaurant-${restaurant._id}-${Date.now()}.${fileExt}`;
            const filePath = `restaurant-images/${fileName}`;

            const { error } = await supabase.storage
                .from('foodie')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (error) throw error;

            const { data: urlData } = supabase.storage
                .from('foodie')
                .getPublicUrl(filePath);

            const imageUrl = urlData.publicUrl;

            // Update restaurant with new image URL
            const updatedRestaurant = { ...restaurant, imageUrl };
            await api.updateRestaurant(restaurant._id, { imageUrl });

            setRestaurant(updatedRestaurant);
            setSuccessMessage('Restaurant image updated successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            console.error('Error uploading image:', error);
            setSuccessMessage('Failed to update restaurant image. Please try again.');
            setTimeout(() => setSuccessMessage(''), 3000);
        } finally {
            setLoading(false);
        }
    };

    const handleMenuItemImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setLoading(true);
            const fileExt = file.name.split('.').pop();
            const fileName = `menu-item-${Date.now()}.${fileExt}`;
            const filePath = `menu-item-images/${fileName}`;

            const { error } = await supabase.storage
                .from('foodie')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (error) throw error;

            const { data: urlData } = supabase.storage
                .from('foodie')
                .getPublicUrl(filePath);

            const imageUrl = urlData.publicUrl;

            setEditingMenuItem({
                ...editingMenuItem,
                imageUrls: [...(editingMenuItem.imageUrls || []), imageUrl]
            });

            setSuccessMessage('Menu item image uploaded successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            console.error('Error uploading image:', error);
            setSuccessMessage('Failed to upload menu item image. Please try again.');
            setTimeout(() => setSuccessMessage(''), 3000);
        } finally {
            setLoading(false);
        }
    };

    const getUnverifiedRestaurants = async () => {
        try {
            const response = await api.getUnverifiedRestuarants();
            setUnverifiedRestaurants(response);
        } catch (error) {
            console.error('Error getting unverified restaurants:', error);
            setSuccessMessage('Failed to get unverified restaurants. Please try again.');
        }
    };

    const handleVerifyRestaurant = async (restaurantId) => {
        try {
            setLoading(true);
            const response = await api.verifyRestaurant(restaurantId, 1);
            if (response) {
                setUnverifiedRestaurants(unverifiedRestaurants.filter(r => r._id !== restaurantId));
                setSuccessMessage('Restaurant verified successfully!');
                setTimeout(() => setSuccessMessage(''), 3000);
            }
        } catch (error) {
            console.error('Error verifying restaurant:', error);
            setSuccessMessage('Failed to verify restaurant. Please try again.');
            setTimeout(() => setSuccessMessage(''), 3000);
        } finally {
            setLoading(false);
        }
    };

    const handleDeclineRestaurant = async (restaurantId) => {
        try {
            setLoading(true);
            const response = await api.verifyRestaurant(restaurantId, 2);
            if (response) {
                setUnverifiedRestaurants(unverifiedRestaurants.filter(r => r._id !== restaurantId));
                setSuccessMessage('Restaurant declined successfully!');
                setTimeout(() => setSuccessMessage(''), 3000);
            }
        } catch (error) {
            console.error('Error declining restaurant:', error);
            setSuccessMessage('Failed to decline restaurant. Please try again.');
            setTimeout(() => setSuccessMessage(''), 3000);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        if (authLoading) return;
        setLoading(true);
        const timer = setTimeout(() => {
            if (currentUser) {
                setFormData({
                    user_id: currentUser.user_id || '',
                    name: currentUser.name || '',
                    email: currentUser.email || '',
                    phone_number: currentUser.phone_number || '',
                    address: currentUser.address || '',
                    role: currentUser.role || '',
                    profile_image: currentUser.profile_image || '',
                    member_since: 'April 2025',
                    recent_orders: []
                });

                if (currentUser.role === 'customer') {
                    getOrders();
                } else if (currentUser.role === 'rider') {
                    getDeliveries();
                } else if (currentUser.role === 'restaurant') {
                    getRestaurantDetails();
                } else if (currentUser.role === 'admin') {
                    getUnverifiedRestaurants();
                }

                setLoading(false);
            } else {
                console.log("No user found, redirecting to login");
                navigate('/login');
            }
        }, 1000);
        return () => clearTimeout(timer);
    }, [currentUser, navigate, authLoading]);

    useEffect(() => {
        if (restaurant && currentUser?.role === 'restaurant') {
            getUnverifiedOrders();
        }
    }, [restaurant]);

    if (loading || authLoading) {
        return <LoadingProfile />;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-700 to-primary-500 dark:from-slate-900 dark:to-green-900 py-12 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-white">My Profile</h1>
                    <p className="text-green-100 mt-2">Manage your account details and preferences</p>
                </div>

                {successMessage && <SuccessMessage message={successMessage} />}

                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl overflow-hidden">
                    <div className="relative bg-gradient-to-r from-green-500 to-green-700 h-48">
                        <div className="absolute -bottom-16 left-8">
                            <div className="relative">
                                {formData.profile_image ? (
                                    <img
                                        src={formData.profile_image}
                                        alt={formData.name}
                                        className="w-32 h-32 rounded-full border-4 border-white object-cover"
                                    />
                                ) : (
                                    <div className="w-32 h-32 rounded-full bg-white flex items-center justify-center border-4 border-white">
                                        <span className="text-5xl font-bold text-green-500">
                                            {formData.name ? formData.name.charAt(0) : ''}
                                        </span>
                                    </div>
                                )}
                                <label className="absolute bottom-0 right-0 bg-green-600 p-2 rounded-full text-white cursor-pointer shadow-lg hover:bg-green-700 transition">
                                    <Camera size={20} />
                                    <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*" />
                                </label>
                            </div>
                        </div>
                        <div className="absolute bottom-4 right-6">
                            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg px-4 py-1 text-white flex items-center">
                                <Shield size={16} className="mr-2" />
                                <span>{formData.role}</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-20 px-8 pb-8">
                        <div className="border-b border-gray-200 dark:border-slate-700">
                            <nav className="flex space-x-8">
                                {[
                                    { id: 'profile', label: 'Personal Information', visible: true },
                                    { id: 'restaurant', label: 'Restaurant Details', visible: formData.role === 'restaurant' },
                                    { id: 'menu', label: 'Menu Items', visible: formData.role === 'restaurant' },
                                    { id: 'pending-orders', label: 'Pending Orders', visible: formData.role === 'restaurant' },
                                    { id: 'orders', label: 'Order History', visible: formData.role === 'customer' },
                                    { id: 'riding', label: 'Riding History', visible: formData.role === 'rider' },
                                    { id: 'unverified', label: 'Unverified Restaurants', visible: formData.role === 'admin' },
                                ].filter(tab => tab.visible).map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                                            ? 'border-green-500 text-green-600 dark:text-green-400'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                                            }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </nav>
                        </div>

                        <div className="pt-6">
                            {activeTab === 'profile' && (
                                isEditing ? (
                                    <EditProfileForm
                                        formData={formData}
                                        handleInputChange={handleInputChange}
                                        handleSubmit={handleSubmit}
                                        setIsEditing={setIsEditing}
                                    />
                                ) : (
                                    <PersonalInformation
                                        formData={formData}
                                        setIsEditing={setIsEditing}
                                    />
                                )
                            )}

                            {activeTab === 'orders' && formData.role === 'customer' && (
                                <OrderHistory
                                    orders={formData.recent_orders}
                                    viewOrderDetails={(order) => setSelectedOrder(order)}
                                />
                            )}

                            {activeTab === 'riding' && formData.role === 'rider' && (
                                <DeliveryHistory
                                    deliveries={deliveries}
                                    viewDeliveryDetails={(delivery) => setSelectedDelivery(delivery)}
                                />
                            )}

                            {activeTab === 'restaurant' && formData.role === 'restaurant' && (
                                <RestaurantDetails
                                    restaurant={restaurant}
                                    isEditingRestaurant={isEditingRestaurant}
                                    setIsEditingRestaurant={setIsEditingRestaurant}
                                    handleRestaurantChange={handleRestaurantChange}
                                    handleRestaurantSubmit={handleRestaurantSubmit}
                                    handleRestaurantImageUpload={handleRestaurantImageUpload}
                                />
                            )}

                            {activeTab === 'menu' && formData.role === 'restaurant' && (
                                <MenuItems
                                    menuItems={menuItems}
                                    isAddingMenuItem={isAddingMenuItem}
                                    editingMenuItem={editingMenuItem}
                                    setIsAddingMenuItem={setIsAddingMenuItem}
                                    setEditingMenuItem={setEditingMenuItem}
                                    handleMenuItemChange={handleMenuItemChange}
                                    handleAddMenuItem={handleAddMenuItem}
                                    handleUpdateMenuItem={handleUpdateMenuItem}
                                    handleDeleteMenuItem={handleDeleteMenuItem}
                                    handleMenuItemImageUpload={handleMenuItemImageUpload}
                                />
                            )}

                            {activeTab === 'pending-orders' && formData.role === 'restaurant' && (
                                <UnverifiedOrders
                                    orders={unverifiedOrders}
                                    handleVerify={handleVerifyOrder}
                                    handleDecline={handleDeclineOrder}
                                    viewOrderDetails={(order) => setSelectedOrder(order)}
                                />
                            )}

                            {activeTab === 'unverified' && formData.role === 'admin' && (
                                <UnverifiedRestaurants
                                    restaurants={unverifiedRestaurants}
                                    handleVerify={handleVerifyRestaurant}
                                    handleDecline={handleDeclineRestaurant}
                                />
                            )}

                            {selectedOrder && (
                                <OrderDetails
                                    order={selectedOrder}
                                    closeOrderDetails={() => setSelectedOrder(null)}
                                />
                            )}

                            {selectedDelivery && (
                                <DeliveryDetails
                                    delivery={selectedDelivery}
                                    closeDeliveryDetails={() => setSelectedDelivery(null)}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;