import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../utils/fetchapi';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import {
  initSocket,
  getSocket,
  joinDeliveryTracking,
  leaveDeliveryTracking,
  updateRiderLocation,
  onDeliveryLocationUpdate,
  offDeliveryLocationUpdate,
  onDeliveryStatusUpdate,
  updateDeliveryStatus
} from '../utils/socketService';

// Fix for Leaflet marker icons
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
  // Use different property names for fallbacks
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
});

const customerIcon = new L.Icon({
  iconUrl: '/customer.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  // Use different property names for fallbacks
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
});

const riderIcon = new L.Icon({
  iconUrl: '/delivery.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  // Use different property names for fallbacks
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
});

// Component to recenter map
function MapCenterSetter({ center }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

const Delivery = () => {
  const { currentUser } = useAuth();
  const [nearbyDeliveries, setNearbyDeliveries] = useState([]);
  const [activeDelivery, setActiveDelivery] = useState(null);
  //const [userLocation, setUserLocation] = useState({ latitude: 6.699677, longitude: 79.910938 }); //home
  const [userLocation, setUserLocation] = useState({ latitude: 6.915185, longitude: 79.973575 }); //sliit
  const [mapCenter, setMapCenter] = useState([6.699677, 79.910938]); // Default to Sri Lanka center
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [routeToDestination, setRouteToDestination] = useState(null);
  const [estimatedTime, setEstimatedTime] = useState(null);
  const [estimatedDistance, setEstimatedDistance] = useState(null);
  //const CurrentLocation = { latitude: 6.699677, longitude: 79.910938 };
  const CurrentLocation = { latitude: 6.915545, longitude: 79.974161 };

  console.log("Current User:", currentUser);

  useEffect(() => {
    setUserLocation(CurrentLocation);
    setMapCenter([CurrentLocation.latitude, CurrentLocation.longitude]);
  }, []);


  // Initialize socket in the component
  useEffect(() => {
    // Initialize socket connection
    initSocket('http://localhost:5005'); // Use your delivery service URL

    return () => {
      // Clean up socket connection
      offDeliveryLocationUpdate();
    };
  }, []);

  // Add real-time location updates
  useEffect(() => {
    if (activeDelivery) {
      // Join the delivery tracking room
      joinDeliveryTracking(activeDelivery.delivery_id);

      onDeliveryStatusUpdate((data) => {
        if (data.deliveryId === activeDelivery.delivery_id) {
          console.log("Received status update:", data);
          setActiveDelivery(prev => ({
            ...prev,
            status: data.status,
            updated_at: data.timestamp
          }));
        }
      });

      // Set up listener for location updates
      onDeliveryLocationUpdate((data) => {
        if (data.deliveryId === activeDelivery.delivery_id) {
          // Update the route with the new location
          // const updatedLocation = {
          //   latitude: data.location.latitude,
          //   longitude: data.location.longitude
          // };
          console.log("Received location update:", data);
          setUserLocation(CurrentLocation);
          console.log("Updated Location:", CurrentLocation);
          // Update route
          const destination = activeDelivery.status === 'accepted'
            ? activeDelivery.restaurant_location
            : activeDelivery.customer_location;

          updateRouteToDestination(CurrentLocation, destination);
        }
      });

      return () => {
        console.log("Leaving delivery tracking room");
        // Leave the delivery tracking room when component unmounts or delivery changes
        leaveDeliveryTracking(activeDelivery.delivery_id);
        offDeliveryLocationUpdate();
      };
    }
  }, [activeDelivery?.delivery_id]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Get user's current location
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const { latitude, longitude } = position.coords;
              //setUserLocation({ latitude, longitude });
              setMapCenter([CurrentLocation.latitude, CurrentLocation.longitude]);
              setUserLocation(CurrentLocation);
              setMapCenter([CurrentLocation.latitude, CurrentLocation.longitude]);

              // Check if rider has an active delivery
              if (currentUser && currentUser.user_id) {
                try {
                  console.log("Checking for active delivery for rider:", currentUser.user_id);
                  const activeDelivery = await api.getActiveDelivery(currentUser.user_id);
                  console.log("Active delivery response:", activeDelivery);

                  if (activeDelivery && activeDelivery.delivery_id) {
                    console.log("Found active delivery:", activeDelivery);
                    setActiveDelivery(activeDelivery);

                    // Set map center based on delivery status
                    if (activeDelivery.status === 'accepted') {
                      setMapCenter([activeDelivery.restaurant_location.latitude, activeDelivery.restaurant_location.longitude]);
                    } else if (activeDelivery.status === 'collected') {
                      setMapCenter([activeDelivery.customer_location.latitude, activeDelivery.customer_location.longitude]);
                    }

                    // Join the delivery tracking room for real-time updates
                    joinDeliveryTracking(activeDelivery.delivery_id);
                  } else {
                    console.log("No active delivery found, fetching nearby deliveries");
                    // Fetch nearby deliveries if no active delivery
                    const nearbyDeliveries = await api.getNearbyDeliveries(CurrentLocation.longitude, CurrentLocation.latitude);
                    console.log('Nearby Deliveries:', nearbyDeliveries);
                    setNearbyDeliveries(nearbyDeliveries);
                  }
                } catch (error) {
                  console.error("Error checking for active delivery:", error);
                  // Fallback to nearby deliveries if there's an error
                  const nearbyDeliveries = await api.getNearbyDeliveries(CurrentLocation.longitude, CurrentLocation.latitude);
                  console.log('Nearby Deliveries (fallback):', nearbyDeliveries);
                  setNearbyDeliveries(nearbyDeliveries);
                }
              } else {
                console.log("No current user, fetching nearby deliveries");
                // No user ID, just fetch nearby deliveries
                const nearbyDeliveries = await api.getNearbyDeliveries(CurrentLocation.longitude, CurrentLocation.latitude);
                console.log('Nearby Deliveries:', nearbyDeliveries);
                setNearbyDeliveries(nearbyDeliveries);
              }

              setLoading(false);
            },
            (error) => {
              console.error('Geolocation error:', error);
              setError('Unable to get your location. Please enable location services.');
              setLoading(false);
            }
          );
        } else {
          setError('Geolocation is not supported by your browser');
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load delivery data');
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser]);



  // Get user's location (real implementation)
  useEffect(() => {
    // Only track location if we're a rider with an active delivery
    if (navigator.geolocation && activeDelivery) {
      const options = {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0
      };

      // Get initial location
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;

          setUserLocation(CurrentLocation);
          setMapCenter([CurrentLocation.latitude, CurrentLocation.longitude]);

          // Send initial location update via socket
          if (activeDelivery) {
            updateRiderLocation(activeDelivery.delivery_id, CurrentLocation.latitude, CurrentLocation.longitude);

            // Also update via API for persistence
            api.updateRiderLocation(activeDelivery.delivery_id, CurrentLocation.latitude, CurrentLocation.longitude)
              .catch(err => console.error('Error updating location via API:', err));
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
        },
        options
      );

      // Set up continuous location tracking
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          //setUserLocation({ latitude, longitude });

          setUserLocation(CurrentLocation);
          setMapCenter([CurrentLocation.latitude, CurrentLocation.longitude]);

          // Send location update via socket
          if (activeDelivery) {
            updateRiderLocation(activeDelivery.delivery_id, CurrentLocation.latitude, CurrentLocation.longitude);

            // Update API less frequently (every 10 seconds) to reduce load
            if (Date.now() % 10000 < 1000) {
              api.updateRiderLocation(activeDelivery.delivery_id, latitude, longitude)
                .catch(err => console.error('Error updating location via API:', err));
            }
          }

          // Update route if we have an active delivery
          if (activeDelivery) {
            updateRouteToDestination(
              { latitude, longitude },
              activeDelivery.status === 'accepted'
                ? activeDelivery.restaurant_location
                : activeDelivery.customer_location
            );
          }
        },
        (error) => {
          console.error('Geolocation watch error:', error);
        },
        options
      );

      // Clean up
      return () => {
        navigator.geolocation.clearWatch(watchId);
      };
    }
  }, [activeDelivery]);

  // Update route when active delivery changes
  useEffect(() => {
    if (userLocation && activeDelivery) {
      try {
        const destination = activeDelivery.status === 'accepted'
          ? activeDelivery.restaurant_location
          : activeDelivery.customer_location;

        updateRouteToDestination(userLocation, destination);
      } catch (error) {
        console.error("Error updating route:", error);
      }
    } else {
      // Clear route when there's no active delivery
      setRouteToDestination(null);
      setEstimatedTime(null);
      setEstimatedDistance(null);
    }
  }, [activeDelivery, userLocation]);

  // Function to update the route
  const updateRouteToDestination = (origin, destination) => {
    try {
      if (!origin || !destination || !origin.latitude || !origin.longitude ||
        !destination.latitude || !destination.longitude) {
        console.warn("Invalid origin or destination for route calculation", { origin, destination });
        return;
      }

      // For simplicity, we'll just draw a straight line
      // In a real app, you would use a routing API like OSRM, GraphHopper, or Google Directions
      const routePoints = [
        [origin.latitude, origin.longitude],
        [destination.latitude, destination.longitude]
      ];

      setRouteToDestination(routePoints);

      // Calculate estimated time and distance
      const distance = calculateDistance(
        origin.latitude,
        origin.longitude,
        destination.latitude,
        destination.longitude
      );

      setEstimatedDistance(distance);

      // Rough estimate: assume 30 km/h average speed
      const timeInHours = distance / 30;
      const timeInMinutes = Math.round(timeInHours * 60);
      setEstimatedTime(timeInMinutes);

    } catch (err) {
      console.error("Error updating route:", err);
      // Clear route data on error
      setRouteToDestination(null);
      setEstimatedTime(null);
      setEstimatedDistance(null);
    }
  };



  // Replace handleAcceptDelivery with this:
  const handleAcceptDelivery = async (deliveryId) => {
    try {
      updateDeliveryStatus(deliveryId, 'accepted');
      //const result = await api.acceptDelivery(deliveryId, currentUser.user_id);
      const result = await api.acceptDelivery(deliveryId, currentUser.user_id);

      if (result) {
        setActiveDelivery(result);
        setNearbyDeliveries(nearbyDeliveries.filter(d => d.delivery_id !== deliveryId));
        setMapCenter([result.restaurant_location.latitude, result.restaurant_location.longitude]);

        // Join the delivery tracking room
        joinDeliveryTracking(result.delivery_id);
      }
    } catch (err) {
      console.error("Error accepting delivery:", err);
      setError("Failed to accept delivery.");
    }
  };

  // Replace handleUpdateStatus with this:
  const handleUpdateStatus = async (status) => {
    try {
      if (!activeDelivery) throw new Error("No active delivery");

      console.log(`Updating delivery ${activeDelivery.delivery_id} status to ${status}`);
      updateDeliveryStatus(activeDelivery.delivery_id, status);
      const result = await api.updateDeliveryStatus(activeDelivery.delivery_id, status);
      console.log("Update status result:", result);

      if (result) {
        // Manually emit the status update via socket for immediate feedback
        const socket = getSocket();
        socket.emit('delivery:status_update', {
          deliveryId: activeDelivery.delivery_id,
          status: status,
          timestamp: new Date()
        });
        setActiveDelivery(result);

        if (status === 'collected') {
          setMapCenter([result.customer_location.latitude, result.customer_location.longitude]);
        } else if (status === 'delivered') {
          leaveDeliveryTracking(activeDelivery.delivery_id);
          console.log("Delivery completed, clearing active delivery");

          await api.updateOrderStatus(activeDelivery.order_id, 2);

          // IMPORTANT: Clear these states BEFORE setting activeDelivery to null
          setRouteToDestination(null);
          setEstimatedTime(null);
          setEstimatedDistance(null);


          // Now it's safe to clear the active delivery
          setActiveDelivery(null);

          location.reload();

          // Fetch nearby deliveries again
          if (CurrentLocation) {
            console.log("Fetching nearby deliveries after delivery completion");
            const nearbyDeliveries = await api.getNearbyDeliveries(
              CurrentLocation.longitude,
              CurrentLocation.latitude
            );
            console.log("New nearby deliveries:", nearbyDeliveries);
            setNearbyDeliveries(nearbyDeliveries);
          }
        }
      }
    } catch (err) {
      console.error(`Error updating status to ${status}:`, err);
      setError(`Failed to update delivery status to ${status}.`);
    }
  };


  // Function to open navigation in Google Maps
  const openNavigation = (destination) => {
    if (!destination) return;

    const { latitude, longitude } = destination;
    // Create Google Maps URL
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=driving`;

    // Open in new tab
    window.open(mapsUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Delivery Dashboard</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map Section */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-md overflow-hidden h-[500px]">
            {userLocation ? (
              <MapContainer
                center={mapCenter}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />

                {/* User location marker */}
                <Marker
                  position={[userLocation.latitude, userLocation.longitude]}
                  icon={riderIcon}
                >
                  <Popup>You are here</Popup>
                </Marker>

                {/* Active delivery markers */}
                {activeDelivery && (
                  <>
                    <Marker
                      position={[
                        activeDelivery.restaurant_location.latitude,
                        activeDelivery.restaurant_location.longitude
                      ]}
                      icon={restaurantIcon}
                    >
                      <Popup>Restaurant Location</Popup>
                    </Marker>

                    <Marker
                      position={[
                        activeDelivery.customer_location.latitude,
                        activeDelivery.customer_location.longitude
                      ]}
                      icon={customerIcon}
                    >
                      <Popup>Customer Location</Popup>
                    </Marker>

                    {/* Route line */}
                    {routeToDestination && (
                      <Polyline
                        positions={routeToDestination}
                        color={activeDelivery.status === 'accepted' ? 'blue' : 'green'}
                        weight={4}
                        opacity={0.7}
                        dashArray={activeDelivery.status === 'accepted' ? '10, 10' : ''}
                      />
                    )}
                  </>
                )}

                <MapCenterSetter center={mapCenter} />
              </MapContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p>Loading map...</p>
              </div>
            )}
          </div>

          {/* Delivery Info Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            {activeDelivery ? (
              <div>
                <h2 className="text-xl font-semibold mb-4">Active Delivery</h2>
                <div className="mb-4">
                  <p className="text-gray-600">Order ID: {activeDelivery.order_id}</p>
                  <p className="text-gray-600">Status:
                    <span className={`ml-2 font-semibold ${activeDelivery.status === 'accepted' ? 'text-blue-600' :
                      activeDelivery.status === 'collected' ? 'text-orange-600' :
                        'text-green-600'
                      }`}>
                      {activeDelivery.status.charAt(0).toUpperCase() + activeDelivery.status.slice(1)}
                    </span>
                  </p>

                  {estimatedDistance && (
                    <p className="text-gray-600 mt-2">
                      Distance: {estimatedDistance.toFixed(1)} km
                    </p>
                  )}

                  {estimatedTime && (
                    <p className="text-gray-600">
                      Est. Time: {estimatedTime} min
                    </p>
                  )}
                </div>

                <div className="border-t border-gray-200 pt-4 mb-4">
                  {activeDelivery.status === 'accepted' ? (
                    <div>
                      <h3 className="font-medium text-gray-800 mb-2">Restaurant Location</h3>
                      <p className="text-gray-600 mb-4">Navigate to the restaurant to collect the order.</p>

                      {/* Navigation button for restaurant */}
                      <button
                        onClick={() => openNavigation(activeDelivery.restaurant_location)}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded mb-3 flex items-center justify-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        Navigate to Restaurant
                      </button>

                      <button
                        onClick={() => handleUpdateStatus('collected')}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded flex items-center justify-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                        </svg>
                        Mark as Collected
                      </button>
                    </div>
                  ) : activeDelivery.status === 'collected' ? (
                    <div>
                      <h3 className="font-medium text-gray-800 mb-2">Customer Location</h3>
                      <p className="text-gray-600 mb-4">Deliver the order to the customer.</p>

                      {/* Navigation button for customer */}
                      <button
                        onClick={() => openNavigation(activeDelivery.customer_location)}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded mb-3 flex items-center justify-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        Navigate to Customer
                      </button>

                      <button
                        onClick={() => handleUpdateStatus('delivered')}
                        className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded flex items-center justify-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                          <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Mark as Delivered
                      </button>
                    </div>
                  ) : null}
                </div>

                {/* Delivery details section */}
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="font-medium text-gray-800 mb-2">Delivery Details</h3>
                  <div className="bg-gray-50 p-3 rounded">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Pickup:</span>
                      <span className="text-gray-800 font-medium">Restaurant</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Dropoff:</span>
                      <span className="text-gray-800 font-medium">Customer</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment:</span>
                      <span className="text-gray-800 font-medium">Completed</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-xl font-semibold mb-4">Available Deliveries</h2>
                {loading ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                ) : nearbyDeliveries && nearbyDeliveries.length > 0 ? (
                  <div className="space-y-4">
                    {nearbyDeliveries.map((delivery) => (
                      <div key={delivery.delivery_id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <p className="text-gray-600">Order ID: {delivery.order_id}</p>
                        <p className="text-gray-600 mb-2">
                          Distance: {calculateDistance(
                            userLocation.latitude,
                            userLocation.longitude,
                            delivery.restaurant_location?.latitude,
                            delivery.restaurant_location?.longitude
                          ).toFixed(1)} km
                        </p>

                        {/* Estimated earnings - this would be calculated based on distance in a real app */}
                        <p className="text-gray-600 mb-3">
                          Est. Earnings: Rs. {((calculateDistance(
                            userLocation.latitude,
                            userLocation.longitude,
                            delivery.restaurant_location?.latitude,
                            delivery.restaurant_location?.longitude
                          ) + calculateDistance(
                            delivery.restaurant_location?.latitude,
                            delivery.restaurant_location?.longitude,
                            delivery.customer_location?.latitude,
                            delivery.customer_location?.longitude
                          )) * 100).toFixed(2)}

                        </p>

                        <button
                          onClick={() => handleAcceptDelivery(delivery.delivery_id)}
                          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded flex items-center justify-center"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Accept Delivery
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <p className="text-gray-600">No deliveries available nearby.</p>
                    <p className="text-gray-500 text-sm mt-2">Check back soon or expand your delivery radius.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
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
  const distance = R * c; // Distance in km
  return distance;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}
export default Delivery;

