import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { ThemeContext } from '../../contexts/ThemeContext';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const LocationMarker = ({ position, setPosition }) => {
    const map = useMapEvents({
        click(e) {
            setPosition(e.latlng);
            map.flyTo(e.latlng, map.getZoom());
        },
    });

    return position ? (
        <Marker
            position={position}
            draggable={true}
            eventHandlers={{
                dragend: (e) => {
                    setPosition(e.target.getLatLng());
                },
            }}
        />
    ) : null;
};

const DeliverLocation = () => {
    const navigate = useNavigate();
    const { darkMode } = useContext(ThemeContext);

    const [position, setPosition] = useState(null);
    const [address, setAddress] = useState('');
    const [loading, setLoading] = useState(true);
    const [locationError, setLocationError] = useState(null);
    const [addressNote, setAddressNote] = useState('');
    const [orderDetails, setOrderDetails] = useState({});

    useEffect(() => {

        if (!localStorage.getItem("orderDetails")) {
            navigate("/restaurant");
        } else {
            setOrderDetails(JSON.parse(localStorage.getItem("orderDetails")));
        }
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setPosition({ lat: latitude, lng: longitude });
                    fetchAddress(latitude, longitude);
                    setLoading(false);
                },
                (error) => {
                    console.error("Error obtaining location", error);
                    setLocationError("Unable to access your location. Please enable location services or select a location manually.");
                    setPosition({ lat: 40.7128, lng: -74.0060 });
                    setLoading(false);
                },
                { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
            );
        } else {
            setLocationError("Geolocation is not supported by your browser");
            setPosition({ lat: 40.7128, lng: -74.0060 });
            setLoading(false);
        }
    }, []);

    const fetchAddress = async (lat, lng) => {
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            const data = await response.json();
            if (data && data.display_name) {
                setAddress(data.display_name);
            } else {
                setAddress("Address not found");
            }
        } catch (error) {
            console.error("Error fetching address", error);
            setAddress("Error fetching address");
        }
    };

    useEffect(() => {
        if (position) {
            fetchAddress(position.lat, position.lng);
        }
    }, [position]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!position) {
            alert("Please select a delivery location");
            return;
        }

        setOrderDetails({
            ...orderDetails,
            customerLocation: {
                latitude: position.lat,
                longitude: position.lng
            },
            deliveryDistance: calculateDistance(
                { lat: 6.712431, lng: 79.907180 },
                position
            ).toFixed(2),
            deliveryAddress: address,
            deliveryAddressNote: addressNote,
            deliveryLocation: position,
        });


        localStorage.setItem("orderDetails", JSON.stringify({
            ...orderDetails,
            customerLocation: {
                latitude: position.lat,
                longitude: position.lng
            },
            deliveryDistance: calculateDistance(
                { lat: orderDetails.restaurantLocation.latitude, lng: orderDetails.restaurantLocation.longitude },
                position
            ).toFixed(2),
            deliveryAddress: address,
            deliveryAddressNote: addressNote,
            deliveryLocation: position,
        }))

        navigate('/order');
    };

    const calculateDistance = (point1, point2) => {
        const toRad = (value) => (value * Math.PI) / 180;
        const R = 6371;
        const dLat = toRad(point2.lat - point1.lat);
        const dLng = toRad(point2.lng - point1.lng);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(point1.lat)) * Math.cos(toRad(point2.lat)) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    if (loading) {
        return (
            <div className={`min-h-screen ${darkMode ? 'bg-slate-900 text-white' : 'bg-gray-100 text-gray-800'} flex items-center justify-center`}>
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen ${darkMode ? 'bg-slate-900 text-white' : 'bg-gray-100 text-gray-800'}`}>
            <div className="container mx-auto py-8 px-4">
                <div className={`max-w-4xl mx-auto rounded-xl shadow-lg ${darkMode ? 'bg-slate-800' : 'bg-white'} p-6`}>
                    <h1 className="text-2xl font-bold mb-6 text-center">Select Delivery Location</h1>

                    {locationError && (
                        <div className={`mb-4 p-4 rounded-lg ${darkMode ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800'}`}>
                            <p>{locationError}</p>
                        </div>
                    )}

                    <div className="mb-6">
                        <div className="h-96 rounded-lg overflow-hidden">
                            {position && (
                                <MapContainer
                                    center={position}
                                    zoom={16}
                                    style={{ height: '100%', width: '100%' }}
                                >
                                    <TileLayer
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    />
                                    <LocationMarker position={position} setPosition={setPosition} />
                                </MapContainer>
                            )}
                        </div>
                        <p className="text-sm mt-2 mb-4 text-center">Click on the map to set your delivery location or drag the marker</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold mb-3">Delivery Address</h3>
                            <div className={`p-4 rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-gray-100'}`}>
                                <p>{address || "No address selected"}</p>
                            </div>
                        </div>

                        <div className="mb-6">
                            <h3 className="text-lg font-semibold mb-3">Address Note (Optional)</h3>
                            <textarea
                                className={`w-full p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${darkMode ? 'bg-slate-700 border-slate-600' : 'bg-white border-gray-300'
                                    } border`}
                                placeholder="Add delivery instructions (e.g., apartment number, building access code, etc.)"
                                rows="3"
                                value={addressNote}
                                onChange={(e) => setAddressNote(e.target.value)}
                            ></textarea>
                        </div>

                        <button
                            type="submit"
                            className={`w-full py-3 px-6 ${darkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-primary-500 hover:bg-primary-600'
                                } text-white font-bold rounded-xl transition duration-200`}
                        >
                            Confirm Delivery Location
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default DeliverLocation;