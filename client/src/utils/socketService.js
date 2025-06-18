// client/src/utils/socketService.js
import io from 'socket.io-client';

let socket = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

export const initSocket = (url) => {
  if (!socket) {
    try {
      // Use the correct delivery service URL with socket.io path
      const socketUrl = import.meta.env.VITE_DELIVERY_SERVICE_URL || 'http://localhost:5005';
      console.log('Initializing socket with URL:', socketUrl);

      socket = io(socketUrl, {
        path: '/socket.io/',
        transports: ['polling', 'websocket'], // Try polling first, then upgrade to websocket
        reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
        reconnectionDelay: 1000,
        timeout: 10000
      });

      // Set up global error handling for socket
      socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        reconnectAttempts++;

        if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
          console.error(`Failed to connect after ${MAX_RECONNECT_ATTEMPTS} attempts. Please check if the server is running.`);
        }
      });

      socket.on('connect', () => {
        console.log('Socket connected with ID:', socket.id);
        reconnectAttempts = 0; // Reset reconnect attempts on successful connection
      });

      socket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);

        // If the disconnection was initiated by the server, try to reconnect
        if (reason === 'io server disconnect') {
          socket.connect();
        }
      });

      socket.on('error', (error) => {
        console.error('Socket error:', error);
      });
    } catch (error) {
      console.error('Error initializing socket:', error);
    }
  }
  return socket;
};

export const getSocket = () => {
  if (!socket) {
    initSocket(); // Auto-initialize if not already done
  }
  return socket;
};

export const joinDeliveryTracking = (deliveryId) => {
  if (!socket) {
    initSocket();
  }

  if (socket && socket.connected) {
    console.log(`Joining delivery tracking room for: ${deliveryId}`);
    socket.emit('join:delivery', deliveryId);
  } else {
    console.warn('Socket not connected, cannot join delivery tracking');
    // Try to reconnect
    if (socket) {
      socket.connect();
      // Set up a one-time listener for when the connection is established
      socket.once('connect', () => {
        console.log(`Connected, now joining delivery tracking room for: ${deliveryId}`);
        socket.emit('join:delivery', deliveryId);
      });
    }
  }
};

export const leaveDeliveryTracking = (deliveryId) => {
  if (!socket || !socket.connected || !deliveryId) return;
  console.log(`Leaving delivery tracking room for: ${deliveryId}`);
  socket.emit('leave:delivery', deliveryId);
};

export const updateRiderLocation = (deliveryId, latitude, longitude) => {
  if (!socket) {
    initSocket();
  }

  if (socket && socket.connected) {
    console.log(`Updating rider location for delivery: ${deliveryId}`, { latitude, longitude });
    socket.emit('rider:location', { deliveryId, latitude, longitude });
  } else {
    console.warn('Socket not connected, cannot update rider location');
  }
};

export const onDeliveryLocationUpdate = (callback) => {
  if (!socket) {
    initSocket();
  }
  console.log('Setting up listener for delivery:location events');
  socket.on('delivery:location', callback);
};

export const offDeliveryLocationUpdate = () => {
  if (!socket) return;
  console.log('Removing listener for delivery:location events');
  socket.off('delivery:location');
};

export const updateDeliveryStatus = (deliveryId, status) => {
  if (!socket) {
    initSocket();
  }

  if (socket && socket.connected) {
    console.log(`Emitting status update for delivery: ${deliveryId}`, { status });
    socket.emit('delivery:status_update', {
      deliveryId,
      status,
      timestamp: new Date()
    });
  } else {
    console.warn('Socket not connected, cannot update delivery status');
  }
};

export const onDeliveryStatusUpdate = (callback) => {
  if (!socket) {
    initSocket();
  }
  // Remove any existing listeners to prevent duplicates
  socket.off('delivery:status_updated');

  console.log('Setting up listener for delivery:status_updated events');
  socket.on('delivery:status_updated', (data) => {
    console.log('Received delivery:status_updated event:', data);
    callback(data);
  });
};

export const offDeliveryStatusUpdate = () => {
  if (!socket) return;
  console.log('Removing listener for delivery:status_updated events');
  socket.off('delivery:status_updated');
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log('Socket disconnected');
  }
};
