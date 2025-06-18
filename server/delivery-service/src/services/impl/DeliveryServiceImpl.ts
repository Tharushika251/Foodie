import { IDeliveryService } from '../DeliveryService';
import Delivery, { IDelivery } from '../../models/Delivery';
import logger from '../../config/logger';
import axios from 'axios';

export class DeliveryService implements IDeliveryService {
  async createDelivery(deliveryData: Partial<IDelivery>): Promise<IDelivery> {
    logger.info('Creating new delivery');
    try {
      const delivery_id = await this.generateDeliveryId();
      const newDelivery = new Delivery({
        ...deliveryData,
        delivery_id,
        status: 'pending'
      });

      const savedDelivery = await newDelivery.save();
      logger.info({ delivery_id }, 'Delivery created successfully');
      return savedDelivery;
    } catch (error) {
      logger.error({ error, deliveryData }, 'Failed to create delivery');
      throw error;
    }
  }

  async getDeliveryById(deliveryId: string): Promise<IDelivery | null> {
    logger.info({ deliveryId }, 'Fetching delivery by ID');
    try {
      const delivery = await Delivery.findOne({ delivery_id: deliveryId });
      if (delivery) {
        logger.info('Delivery found');
      } else {
        logger.warn('Delivery not found');
      }
      return delivery;
    } catch (error) {
      logger.error({ error, deliveryId }, 'Error fetching delivery by ID');
      throw error;
    }
  }

  async getDeliveriesByStatus(status: string): Promise<IDelivery[]> {
    logger.info({ status }, 'Fetching deliveries by status');
    try {
      const deliveries = await Delivery.find({ status });
      logger.info(`Found ${deliveries.length} deliveries with status ${status}`);
      return deliveries;
    } catch (error) {
      logger.error({ error, status }, 'Error fetching deliveries by status');
      throw error;
    }
  }

  async getNearbyDeliveries(longitude: number, latitude: number, maxDistance: number = 10000): Promise<IDelivery[]> {
    logger.info({ longitude, latitude, maxDistance }, 'Fetching nearby deliveries');
    try {
      // Find pending deliveries with restaurant location within maxDistance (in meters)
      // This is a simplified approach - in a real app, you'd use geospatial queries
      const deliveries = await Delivery.find({ status: 'pending' });

      // Filter deliveries based on distance
      const nearbyDeliveries = deliveries.filter(delivery => {
        const distance = this.calculateDistance(
          latitude,
          longitude,
          delivery.restaurant_location.latitude,
          delivery.restaurant_location.longitude
        );
        return distance <= maxDistance;
      });

      logger.info(`Found ${nearbyDeliveries.length} nearby deliveries`);
      return nearbyDeliveries;
    } catch (error) {
      logger.error({ error, longitude, latitude }, 'Error fetching nearby deliveries');
      throw error;
    }
  }

  async acceptDelivery(deliveryId: string, riderId: string): Promise<IDelivery | null> {
    logger.info({ deliveryId, riderId }, 'Rider accepting delivery');
    try {
      const delivery = await Delivery.findOneAndUpdate(
        { delivery_id: deliveryId, status: 'pending' },
        {
          rider_id: riderId,
          status: 'accepted',
          accepted_at: new Date()
        },
        { new: true }
      );

      if (delivery) {
        logger.info('Delivery accepted successfully');
      } else {
        logger.warn('Delivery not found or already accepted');
      }

      return delivery;
    } catch (error) {
      logger.error({ error, deliveryId, riderId }, 'Error accepting delivery');
      throw error;
    }
  }

  async updateDeliveryStatus(deliveryId: string, status: string, timestamp: Date = new Date()): Promise<IDelivery | null> {
    logger.info({ deliveryId, status }, 'Updating delivery status');
    try {
      const updateData: any = { status };

      // Add timestamp based on status
      if (status === 'collected') {
        updateData.collected_at = timestamp;
      } else if (status === 'delivered') {
        updateData.delivered_at = timestamp;
      }

      const delivery = await Delivery.findOneAndUpdate(
        { delivery_id: deliveryId },
        updateData,
        { new: true }
      );

      if (delivery) {
        logger.info(`Delivery status updated to ${status}`);

        if (status === 'delivered') {
          try {

            const { data: user } = await axios.get('http://localhost:5000/api/users/' + delivery.rider_id);

            await axios.post('http://localhost:5004/api/notifications/complete', {
              user_id: delivery.rider_id,
              order_id: delivery.order_id,
              email: user.email,
              phone: user.phone_number
            });
            logger.info("Notification Sent to Rider");
          } catch (error) {
            logger.error(`Failed to send Notification to rider: ${error}`);
          }
        }

      } else {
        logger.warn('Delivery not found for status update');
      }

      return delivery;
    } catch (error) {
      logger.error({ error, deliveryId, status }, 'Error updating delivery status');
      throw error;
    }
  }

  async getDeliveriesByRider(riderId: string): Promise<IDelivery[]> {
    logger.info({ riderId }, 'Fetching deliveries by rider');
    try {
      const deliveries = await Delivery.find({ rider_id: riderId });
      logger.info(`Found ${deliveries.length} deliveries for rider ${riderId}`);
      return deliveries;
    } catch (error) {
      logger.error({ error, riderId }, 'Error fetching deliveries by rider');
      throw error;
    }
  }

  async generateDeliveryId(): Promise<string> {
    logger.info('Generating new delivery ID');
    try {
      const count = await Delivery.countDocuments();
      const nextSequence = count + 1;
      const formattedSequence = nextSequence.toString().padStart(4, '0');
      const deliveryId = `D${formattedSequence}`;
      logger.debug({ deliveryId }, 'Delivery ID generated');
      return deliveryId;
    } catch (error) {
      logger.error({ error }, 'Failed to generate delivery ID');
      throw error;
    }
  }

  async autoAssignRider(deliveryId: string): Promise<IDelivery | null> {
    logger.info({ deliveryId }, 'Auto-assigning rider to delivery');
    try {
      // 1. Get the delivery details
      const delivery = await this.getDeliveryById(deliveryId);
      if (!delivery || delivery.status !== 'pending') {
        logger.warn('Delivery not found or not in pending status');
        return null;
      }

      // 2. Find available riders within a reasonable distance
      // This would require a User service call to get riders
      // For now, we'll simulate with a direct DB query
      const availableRiders = await this.findAvailableRidersNear(
        delivery.restaurant_location.latitude,
        delivery.restaurant_location.longitude
      );

      if (availableRiders.length === 0) {
        logger.warn('No available riders found nearby');
        return null;
      }

      // 3. Select the closest rider
      const closestRider = this.findClosestRider(
        availableRiders,
        delivery.restaurant_location.latitude,
        delivery.restaurant_location.longitude
      );

      // 4. Assign the delivery to the rider
      return await this.acceptDelivery(deliveryId, closestRider.user_id);
    } catch (error) {
      logger.error({ error, deliveryId }, 'Error auto-assigning rider');
      throw error;
    }
  }

  // Helper method to find available riders near a location
  // In a real implementation, this would call the User service
  // Modify the findAvailableRidersNear method to fetch real riders
  private async findAvailableRidersNear(latitude: number, longitude: number, maxDistance: number = 5000): Promise<any[]> {
    try {
      const response = await axios.post('http://localhost:5000/api/users/riders/available', {
        latitude,
        longitude,
        maxDistance
      }, {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      return response.data as any[];
    } catch (error) {
      logger.error({ error }, 'Error fetching available riders');
      // Fallback to dummy data if the service is unavailable
      return [
        { user_id: 'R001', name: 'John Rider', latitude: latitude + 0.01, longitude: longitude - 0.01 },
        { user_id: 'R002', name: 'Alice Driver', latitude: latitude - 0.005, longitude: longitude + 0.008 }
      ];
    }
  }


  // Helper method to find the closest rider
  private findClosestRider(riders: any[], targetLat: number, targetLon: number): any {
    let closestRider = riders[0];
    let minDistance = this.calculateDistance(
      targetLat, targetLon,
      riders[0].latitude, riders[0].longitude
    );

    for (let i = 1; i < riders.length; i++) {
      const distance = this.calculateDistance(
        targetLat, targetLon,
        riders[i].latitude, riders[i].longitude
      );

      if (distance < minDistance) {
        minDistance = distance;
        closestRider = riders[i];
      }
    }

    return closestRider;
  }

  // Helper method to calculate distance between two points using Haversine formula
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) *
      Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }

  async getDeliveryByOrderId(orderId: string): Promise<IDelivery | null> {
    logger.info({ orderId }, 'Fetching delivery by order ID');
    try {
      const delivery = await Delivery.findOne({ order_id: orderId });
      if (delivery) {
        logger.info('Delivery found for order');
      } else {
        logger.warn('No delivery found for this order');
      }
      return delivery;
    } catch (error) {
      logger.error({ error, orderId }, 'Error fetching delivery by order ID');
      throw error;
    }
  }
}
