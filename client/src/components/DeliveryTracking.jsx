// EnhancedDeliveryTracking.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../utils/fetchapi';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import {
  initSocket, getSocket,
  joinDeliveryTracking, leaveDeliveryTracking,
  onDeliveryLocationUpdate, offDeliveryLocationUpdate,
  onDeliveryStatusUpdate, offDeliveryStatusUpdate
} from '../utils/socketService';

// Leaflet marker icons setup (same as your original)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const restaurantIcon = new L.Icon({
  iconUrl: '/restaurant.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
});

const customerIcon = new L.Icon({
  iconUrl: '/customer.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
});

const riderIcon = new L.Icon({
  iconUrl: '/delivery.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
});

// Map center setter
function MapCenterSetter({ center }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

const statusSteps = [
  { label: "Accepted", key: "accepted" },
  { label: "Collected", key: "collected" },
  { label: "Delivered", key: "delivered" }
];

const statusColors = {
  accepted: "bg-blue-500",
  collected: "bg-orange-500",
  delivered: "bg-green-500"
};

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.7, ease: "easeOut" } }
};

const progressVariants = {
  hidden: { width: 0 },
  visible: i => ({
    width: `${i * 50}%`,
    transition: { duration: 0.7, delay: i * 0.2 }
  })
};

const DeliveryTracking = () => {
  const { orderId } = useParams();
  const [delivery, setDelivery] = useState(null);
  const [riderLocation, setRiderLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState([7.8731, 80.7718]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [routeToDestination, setRouteToDestination] = useState(null);
  const [estimatedTime, setEstimatedTime] = useState(null);
  const [estimatedDistance, setEstimatedDistance] = useState(null);
  const [deliveryId, setDeliveryId] = useState(null);
  //const currentLocation = { latitude: 6.699677, longitude: 79.910938 };
  const currentLocation = { latitude: 6.915545, longitude: 79.974161 };

  // Fetch delivery and set up socket
  useEffect(() => {
    initSocket();
    const fetchDelivery = async () => {
      try {
        const did = await api.getDeliverIdByOrder(orderId);
        setDeliveryId(did.delivery_id)
        const data = await api.trackDelivery(did.delivery_id);
        setDelivery(data);
        if (data.restaurant_location) {
          setMapCenter([data.restaurant_location.latitude, data.restaurant_location.longitude]);
        }
        setLoading(false);
      } catch {
        setError('Failed to load delivery details');
        setLoading(false);
      }
    };
    fetchDelivery();
    return () => offDeliveryLocationUpdate();
  }, [deliveryId]);

  console.log(delivery);

  useEffect(() => {
    let timeoutId;
    if (delivery) {
      joinDeliveryTracking(deliveryId);
      onDeliveryLocationUpdate((data) => {
        if (data.deliveryId === deliveryId) {
          // Correctly use the location data from the socket event
          const updatedLocation = {
            latitude: data.location.latitude,
            longitude: data.location.longitude
          };

          console.log("Received rider location update:", updatedLocation);
          setRiderLocation(updatedLocation);

          if (delivery.status === 'accepted' || delivery.status === 'collected') {
            const destination = delivery.status === 'accepted'
              ? delivery.restaurant_location
              : delivery.customer_location;

            // Use the updated location to calculate the route
            updateRouteToDestination(updatedLocation, destination);
          }
        }
      });

      // Set up status updates - use the improved function
      onDeliveryStatusUpdate((data) => {
        if (data.deliveryId === deliveryId) {
          console.log("Received status update in tracking:", data);
          setDelivery(prev => ({
            ...prev,
            status: data.status,
            updated_at: data.timestamp
          }));

          if (data.status === 'accepted' && delivery.restaurant_location) {
            setMapCenter([delivery.restaurant_location.latitude, delivery.restaurant_location.longitude]);
          } else if (data.status === 'collected' && delivery.customer_location) {
            setMapCenter([delivery.customer_location.latitude, delivery.customer_location.longitude]);
          }
        }
      });

      // If we don't receive a location update within 5 seconds, use default location
      if (delivery.status === 'accepted' || delivery.status === 'collected') {

        timeoutId = setTimeout(() => {
          if (!riderLocation) {
            console.log("No rider location received, using default");

            setRiderLocation(currentLocation);

            if (delivery.status === 'accepted' || delivery.status === 'collected') {
              const destination = delivery.status === 'accepted'
                ? delivery.restaurant_location
                : delivery.customer_location;
              updateRouteToDestination(currentLocation, destination);
            }
          }
        }, 2000);
      }

      const socket = getSocket();
      socket.on('delivery:status_updated', (data) => {
        if (data.deliveryId === deliveryId) {
          setDelivery(prev => ({
            ...prev,
            status: data.status,
            updated_at: data.timestamp
          }));

          if (data.status === 'accepted' && delivery.restaurant_location) {
            setMapCenter([delivery.restaurant_location.latitude, delivery.restaurant_location.longitude]);
          } else if (data.status === 'collected' && delivery.customer_location) {
            setMapCenter([delivery.customer_location.latitude, delivery.customer_location.longitude]);
          }
        }
      });

      return () => {
        leaveDeliveryTracking(deliveryId);
        offDeliveryLocationUpdate();
        offDeliveryStatusUpdate();
        socket.off('delivery:status_updated');
        clearTimeout(timeoutId);
      };
    }
  }, [delivery, deliveryId]);


  // Route calculation
  const updateRouteToDestination = (origin, destination) => {
    try {
      const routePoints = [
        [origin.latitude, origin.longitude],
        [destination.latitude, destination.longitude]
      ];
      setRouteToDestination(routePoints);
      const distance = calculateDistance(
        origin.latitude, origin.longitude,
        destination.latitude, destination.longitude
      );
      setEstimatedDistance(distance);
      const timeInHours = distance / 30;
      setEstimatedTime(Math.round(timeInHours * 60));
    } catch { }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <motion.div
          className="rounded-full h-12 w-12 border-b-4 border-blue-500"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        />
      </div>
    );
  }

  if (error) {
    return (
      <motion.div
        className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg shadow-lg my-8 mx-auto max-w-lg"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {error}
      </motion.div>
    );
  }

  if (!delivery) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">Delivery not found.</p>
      </div>
    );
  }

  // Status step index
  const currentStep = statusSteps.findIndex(s => s.key === delivery.status);

  return (
    <motion.div
      className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden max-w-2xl mx-auto my-10 border border-gray-200"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div className="p-6 border-b border-gray-100"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}
      >
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-gradient-to-tr from-blue-500 to-green-400 animate-pulse"></span>
          Delivery Tracking
        </h2>
        <div className="flex flex-wrap gap-4 mt-2">
          <span className="text-gray-500">Order ID: <span className="font-semibold">{delivery.order_id}</span></span>
          <span className="text-gray-500">Status:
            <span className={`ml-2 font-semibold ${statusColors[delivery.status] || "text-gray-600"}`}>
              {delivery.status.charAt(0).toUpperCase() + delivery.status.slice(1)}
            </span>
          </span>
        </div>
        <div className="flex gap-6 mt-2">
          {estimatedDistance && (
            <span className="text-gray-600">
              <span className="font-semibold">{estimatedDistance.toFixed(1)} km</span> distance
            </span>
          )}
          {estimatedTime && (
            <span className="text-gray-600">
              <span className="font-semibold">{estimatedTime}</span> min
            </span>
          )}
        </div>
      </motion.div>

      <motion.div
        className="h-[350px] bg-gradient-to-br from-blue-50 via-white to-green-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { delay: 0.3 } }}
      >
        <MapContainer
          center={mapCenter}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          className="rounded-b-3xl"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap contributors'
          />
          <Marker
            position={[
              delivery.restaurant_location.latitude,
              delivery.restaurant_location.longitude
            ]}
            icon={restaurantIcon}
          >
            <Popup>Restaurant Location</Popup>
          </Marker>
          <Marker
            position={[
              delivery.customer_location.latitude,
              delivery.customer_location.longitude
            ]}
            icon={customerIcon}
          >
            <Popup>Your Location</Popup>
          </Marker>

          {riderLocation && (
            <Marker
              position={[riderLocation.latitude, riderLocation.longitude]}
              icon={riderIcon}
            >
              <Popup>Rider Location</Popup>
            </Marker>
          )}


          {routeToDestination && (
            <Polyline
              positions={routeToDestination}
              color={delivery.status === 'accepted' ? 'blue' : 'green'}
              weight={4}
              opacity={0.7}
              dashArray={delivery.status === 'accepted' ? '10, 10' : ''}
            />
          )}
          <MapCenterSetter center={mapCenter} />
        </MapContainer>
      </motion.div>

      {/* Animated Progress Bar */}
      <motion.div className="p-6 bg-gradient-to-r from-white via-gray-50 to-white">
        <h3 className="font-medium text-gray-800 mb-4">Delivery Status</h3>
        <div className="flex items-center justify-between relative">
          {statusSteps.map((step, i) => (
            <div className="flex-1 flex flex-col items-center" key={step.key}>
              <motion.div
                className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg
                  ${i <= currentStep ? 'bg-gradient-to-tr from-blue-400 to-green-400 text-white' : 'bg-gray-200 text-gray-400'}
                  border-4 border-white`}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1, transition: { delay: 0.4 + i * 0.15 } }}
                whileHover={{ scale: 1.1 }}
              >
                {/* Custom icons for each step */}
                {i === 0 && (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
                {i === 1 && (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M12 3v3m0 12v3m9-9h-3M6 12H3m15.364-6.364l-2.121 2.121M6.343 17.657l-2.121 2.121m12.728 0l2.121-2.121M6.343 6.343L4.222 4.222" />
                  </svg>
                )}
                {i === 2 && (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 8v4l3 3" />
                  </svg>
                )}
              </motion.div>
              <span className={`mt-2 text-xs font-medium ${i <= currentStep ? 'text-blue-600' : 'text-gray-400'}`}>
                {step.label}
              </span>
              {/* Progress bar between steps */}
              {i < statusSteps.length - 1 && (
                <motion.div
                  className="absolute top-1/2 left-1/2 h-1 bg-gradient-to-r from-blue-400 to-green-400 rounded"
                  style={{
                    width: '50%',
                    left: 'calc(50% + 20px)',
                    zIndex: -1,
                    transform: `translateY(-50%)`
                  }}
                  initial="hidden"
                  animate={i < currentStep ? "visible" : "hidden"}
                  custom={i + 1}
                  variants={progressVariants}
                />
              )}
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

// Helper function to calculate distance between two points
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

export default DeliveryTracking;
