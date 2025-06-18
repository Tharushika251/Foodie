import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { createClient } from '@supabase/supabase-js';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { api } from '../../utils/fetchapi';

const supabaseUrl = 'https://nelqemsnxiomtaosceui.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5lbHFlbXNueGlvbXRhb3NjZXVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU4NTA1OTEsImV4cCI6MjA2MTQyNjU5MX0.blyjPV4hGnAQpaCyWJD1LAljPt5SWa8o4SxvWEAGAUU';
const supabase = createClient(supabaseUrl, supabaseKey);

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

function LocationMarker({ position, setPosition }) {
    useMapEvents({
        click(e) {
            setPosition([e.latlng.lat, e.latlng.lng]);
        },
    });

    return position ? <Marker position={position} /> : null;
}

const RestaurantRegistration = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        name: '',
        address: '',
        openTime: '09:00',
        closeTime: '22:00',
        ownerName: '',
        ownerEmail: '',
        ownerPhone: '',
        password: '',
        confirmPassword: '',
        acceptTerms: false
    });

    const [position, setPosition] = useState([6.914, 79.972]);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [errors, setErrors] = useState({});
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => {
                navigate('/');
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [success, navigate]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleImageChange = (e) => {
        if (!e.target.files || e.target.files.length === 0) {
            return;
        }

        const file = e.target.files[0];
        setImageFile(file);

        const previewUrl = URL.createObjectURL(file);
        setImagePreview(previewUrl);
    };

    const uploadImage = async () => {
        if (!imageFile) return null;

        try {
            setUploading(true);

            const fileExt = imageFile.name.split('.').pop();
            const fileName = `${Date.now()}.${fileExt}`;
            const filePath = `restaurants/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('foodie')
                .upload(filePath, imageFile);

            if (uploadError) {
                throw uploadError;
            }

            const { data } = await supabase.storage
                .from('foodie')
                .getPublicUrl(filePath);

            return data.publicUrl;
        } catch (error) {
            console.error('Error uploading image:', error);
            return null;
        } finally {
            setUploading(false);
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) newErrors.name = 'Restaurant name is required';
        if (!formData.address.trim()) newErrors.address = 'Address is required';
        if (!formData.openTime) newErrors.openTime = 'Opening time is required';
        if (!formData.closeTime) newErrors.closeTime = 'Closing time is required';

        if (!formData.ownerName.trim()) newErrors.ownerName = 'Owner name is required';
        if (!formData.ownerEmail.trim()) {
            newErrors.ownerEmail = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.ownerEmail)) {
            newErrors.ownerEmail = 'Email is invalid';
        }

        if (!formData.ownerPhone.trim()) {
            newErrors.ownerPhone = 'Phone number is required';
        } else if (!/^\d{10}$/.test(formData.ownerPhone)) {
            newErrors.ownerPhone = 'Phone number must be 10 digits';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        if (!imageFile) newErrors.image = 'Restaurant image is required';

        if (!formData.acceptTerms) {
            newErrors.acceptTerms = 'You must accept the terms and conditions';
        }

        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});

        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        try {
            const imageUrl = await uploadImage();
            if (!imageUrl) {
                setErrors({ form: 'Failed to upload image. Please try again.' });
                return;
            }

            const restaurantData = {
                name: formData.name,
                address: formData.address,
                openTime: formData.openTime,
                closeTime: formData.closeTime,
                imageUrl: imageUrl,
                location: {
                    latitude: position[0],
                    longitude: position[1]
                },

                owner: {
                    name: formData.ownerName,
                    email: formData.ownerEmail,
                    phone_number: formData.ownerPhone,
                    password: formData.password
                }
            };

            const response = await api.createRestaurant(restaurantData);
            console.log(response)
            if (response.status !== 0) {
                throw new Error('Failed to register restaurant');
            }

            setSuccess(true);

        } catch (error) {
            setErrors({ form: error.message || 'Registration failed. Please try again.' });
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-700 to-primary-500 dark:from-slate-900 dark:to-green-900 p-4">
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-6">
                    <img src="/logo.png" alt="Foodie Logo" className="h-16 w-30 mx-auto" />
                    <h1 className="mt-4 text-3xl font-bold text-white">Register Your Restaurant</h1>
                    <p className="mt-2 text-gray-200">Join our platform and start receiving orders!</p>
                </div>

                {success ? (
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl backdrop-blur-sm backdrop-filter bg-opacity-80 dark:bg-opacity-80 p-6 border border-gray-200 dark:border-slate-700">
                        <div className="rounded-xl bg-green-50 dark:bg-green-900/20 p-6 border border-green-200 dark:border-green-800 text-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-green-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <h2 className="text-2xl font-bold text-green-700 dark:text-green-400 mb-2">Registration Successful!</h2>
                            <p className="text-green-600 dark:text-green-300 mb-4">Your restaurant has been registered successfully. Please wait for verification.</p>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl backdrop-blur-sm backdrop-filter bg-opacity-80 dark:bg-opacity-80 p-6 border border-gray-200 dark:border-slate-700">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Restaurant Information</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Restaurant Name
                                        </label>
                                        <input
                                            id="name"
                                            name="name"
                                            type="text"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="mt-1 appearance-none block w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 dark:bg-slate-700 dark:text-white"
                                            placeholder="Your Restaurant Name"
                                        />
                                        {errors.name && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>}
                                    </div>

                                    <div>
                                        <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Address
                                        </label>
                                        <textarea
                                            id="address"
                                            name="address"
                                            rows={2}
                                            value={formData.address}
                                            onChange={handleChange}
                                            className="mt-1 appearance-none block w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 dark:bg-slate-700 dark:text-white"
                                            placeholder="123 Main St, City, Country"
                                        />
                                        {errors.address && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.address}</p>}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="openTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Opening Time
                                            </label>
                                            <input
                                                id="openTime"
                                                name="openTime"
                                                type="time"
                                                value={formData.openTime}
                                                onChange={handleChange}
                                                className="mt-1 appearance-none block w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 dark:bg-slate-700 dark:text-white"
                                            />
                                            {errors.openTime && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.openTime}</p>}
                                        </div>

                                        <div>
                                            <label htmlFor="closeTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Closing Time
                                            </label>
                                            <input
                                                id="closeTime"
                                                name="closeTime"
                                                type="time"
                                                value={formData.closeTime}
                                                onChange={handleChange}
                                                className="mt-1 appearance-none block w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 dark:bg-slate-700 dark:text-white"
                                            />
                                            {errors.closeTime && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.closeTime}</p>}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Restaurant Image</h2>
                                <div className="flex flex-col md:flex-row gap-6 items-start">
                                    <div className="w-full md:w-1/2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Upload Restaurant Image
                                        </label>
                                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-slate-600 border-dashed rounded-xl">
                                            <div className="space-y-2 text-center">
                                                <div className="flex flex-col items-center">
                                                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                    <div className="flex text-sm text-gray-600 dark:text-gray-400">
                                                        <label htmlFor="file-upload" className="relative cursor-pointer bg-white dark:bg-slate-700 rounded-md font-medium text-green-600 hover:text-green-500 dark:text-green-400 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-green-500">
                                                            <span>Upload a file</span>
                                                            <input
                                                                id="file-upload"
                                                                name="file-upload"
                                                                type="file"
                                                                className="sr-only"
                                                                accept="image/*"
                                                                onChange={handleImageChange}
                                                                ref={fileInputRef}
                                                            />
                                                        </label>
                                                        <p className="pl-1">or drag and drop</p>
                                                    </div>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        PNG, JPG, GIF up to 10MB
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        {errors.image && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.image}</p>}
                                    </div>

                                    <div className="w-full md:w-1/2">
                                        {imagePreview ? (
                                            <div className="mt-2">
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Preview
                                                </label>
                                                <div className="h-48 w-full overflow-hidden rounded-xl border border-gray-300 dark:border-slate-600">
                                                    <img
                                                        src={imagePreview}
                                                        alt="Restaurant Preview"
                                                        className="h-full w-full object-cover"
                                                    />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="mt-2">
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Preview
                                                </label>
                                                <div className="h-48 w-full bg-gray-100 dark:bg-slate-700 rounded-xl flex items-center justify-center">
                                                    <p className="text-gray-500 dark:text-gray-400">No image selected</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Restaurant Location</h2>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                    Click on the map to set your restaurant's location
                                </p>
                                <div className="h-[400px] w-full rounded-xl overflow-hidden border border-gray-300 dark:border-slate-600">
                                    <MapContainer
                                        center={position}
                                        zoom={13}
                                        style={{ height: '100%', width: '100%' }}
                                    >
                                        <TileLayer
                                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        />
                                        <LocationMarker position={position} setPosition={setPosition} />
                                    </MapContainer>
                                </div>
                                <div className="mt-2 flex gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Latitude
                                        </label>
                                        <input
                                            type="text"
                                            value={position[0]}
                                            readOnly
                                            className="mt-1 appearance-none block w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-xl shadow-sm bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-gray-300"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Longitude
                                        </label>
                                        <input
                                            type="text"
                                            value={position[1]}
                                            readOnly
                                            className="mt-1 appearance-none block w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-xl shadow-sm bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-gray-300"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Owner Information</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="ownerName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Full Name
                                        </label>
                                        <input
                                            id="ownerName"
                                            name="ownerName"
                                            type="text"
                                            value={formData.ownerName}
                                            onChange={handleChange}
                                            className="mt-1 appearance-none block w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 dark:bg-slate-700 dark:text-white"
                                            placeholder="John Doe"
                                        />
                                        {errors.ownerName && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.ownerName}</p>}
                                    </div>

                                    <div>
                                        <label htmlFor="ownerEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Email Address
                                        </label>
                                        <input
                                            id="ownerEmail"
                                            name="ownerEmail"
                                            type="email"
                                            value={formData.ownerEmail}
                                            onChange={handleChange}
                                            className="mt-1 appearance-none block w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 dark:bg-slate-700 dark:text-white"
                                            placeholder="you@example.com"
                                        />
                                        {errors.ownerEmail && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.ownerEmail}</p>}
                                    </div>

                                    <div>
                                        <label htmlFor="ownerPhone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Phone Number
                                        </label>
                                        <input
                                            id="ownerPhone"
                                            name="ownerPhone"
                                            type="tel"
                                            value={formData.ownerPhone}
                                            onChange={handleChange}
                                            className="mt-1 appearance-none block w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 dark:bg-slate-700 dark:text-white"
                                            placeholder="07x 2345 6789"
                                        />
                                        {errors.ownerPhone && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.ownerPhone}</p>}
                                    </div>

                                    <div>
                                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Password
                                        </label>
                                        <input
                                            id="password"
                                            name="password"
                                            type="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            className="mt-1 appearance-none block w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 dark:bg-slate-700 dark:text-white"
                                            placeholder="••••••••"
                                        />
                                        {errors.password && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password}</p>}
                                    </div>

                                    <div>
                                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Confirm Password
                                        </label>
                                        <input
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            type="password"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            className="mt-1 appearance-none block w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 dark:bg-slate-700 dark:text-white"
                                            placeholder="••••••••"
                                        />
                                        {errors.confirmPassword && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.confirmPassword}</p>}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center">
                                <input
                                    id="acceptTerms"
                                    name="acceptTerms"
                                    type="checkbox"
                                    checked={formData.acceptTerms}
                                    onChange={handleChange}
                                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                />
                                <label htmlFor="acceptTerms" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                                    I accept the <a href="#" className="text-blue-600 hover:text-blue-500 dark:text-blue-400">Terms and Conditions</a>
                                </label>
                            </div>
                            {errors.acceptTerms && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.acceptTerms}</p>}

                            {errors.form && (
                                <div className="rounded-xl bg-red-50 dark:bg-red-900/20 p-4 border border-red-200 dark:border-red-800">
                                    <p className="text-sm text-red-600 dark:text-red-400">{errors.form}</p>
                                </div>
                            )}

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={uploading}
                                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-[#208C27] to-[#36BF3F] hover:from-[#16601d] hover:to-[#2eaa36] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#36BF3F] transition-all duration-200 transform hover:scale-[1.02] active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {uploading ? 'Registering...' : 'Register Restaurant'}
                                </button>
                            </div>

                            <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                                Already have an account?{' '}
                                <Link to="/login" className="font-medium text-green-600 hover:text-green-500 dark:text-green-400">
                                    Sign in
                                </Link>
                            </p>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RestaurantRegistration;

