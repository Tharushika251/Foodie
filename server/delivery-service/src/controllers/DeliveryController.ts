import { Request, Response } from 'express';
import { DeliveryService } from '../services/impl/DeliveryServiceImpl';
import logger from '../config/logger';
import Delivery, { IDelivery } from '../models/Delivery';

const deliveryService = new DeliveryService();

export class DeliveryController {
  createDelivery = async (req: Request, res: Response): Promise<void> => {
    try {
      const delivery = await deliveryService.createDelivery(req.body);
      res.status(201).json(delivery);
    } catch (err: any) {
      logger.error({ err }, 'Error in createDelivery controller');
      res.status(500).json({ message: err.message });
    }
  };

  getDeliveryById = async (req: Request, res: Response): Promise<void> => {
    try {
      const delivery = await deliveryService.getDeliveryById(req.params.id);
      if (!delivery) {
        res.status(404).json({ message: 'Delivery not found' });
      } else {
        res.json(delivery);
      }
    } catch (err: any) {
      logger.error({ err }, 'Error in getDeliveryById controller');
      res.status(500).json({ message: err.message });
    }
  };

  getDeliveriesByStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const { status } = req.params;
      const deliveries = await deliveryService.getDeliveriesByStatus(status);
      res.json(deliveries);
    } catch (err: any) {
      logger.error({ err }, 'Error in getDeliveriesByStatus controller');
      res.status(500).json({ message: err.message });
    }
  };

  getNearbyDeliveries = async (req: Request, res: Response): Promise<void> => {
    try {
      const { longitude, latitude, maxDistance } = req.query;
      const deliveries = await deliveryService.getNearbyDeliveries(
        parseFloat(longitude as string),
        parseFloat(latitude as string),
        maxDistance ? parseFloat(maxDistance as string) : undefined
      );
      res.json(deliveries);
    } catch (err: any) {
      logger.error({ err }, 'Error in getNearbyDeliveries controller');
      res.status(500).json({ message: err.message });
    }
  };

  acceptDelivery = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { riderId } = req.body;
      
      if (!riderId) {
        res.status(400).json({ message: 'Rider ID is required' });
        return;
      }
      
      const delivery = await deliveryService.acceptDelivery(id, riderId);
      
      if (!delivery) {
        res.status(404).json({ message: 'Delivery not found or already accepted' });
      } else {
        res.json(delivery);
      }
    } catch (err: any) {
      logger.error({ err }, 'Error in acceptDelivery controller');
      res.status(500).json({ message: err.message });
    }
  };

  updateDeliveryStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!status) {
        res.status(400).json({ message: 'Status is required' });
        return;
      }
      
      const delivery = await deliveryService.updateDeliveryStatus(id, status);
      
      if (!delivery) {
        res.status(404).json({ message: 'Delivery not found' });
      } else {
        // Get the Socket.io instance from the app
        const io = req.app.get('io');
        if (io) {
          // Emit the status update event
          logger.info(`Emitting delivery:status_updated event for delivery ${id} from controller`);
          io.to(`delivery:${id}`).emit('delivery:status_updated', {
            deliveryId: id,
            status: status,
            timestamp: new Date(),
            order_id: delivery.order_id
          });
        }
        
        res.json(delivery);
      }
    } catch (err: any) {
      logger.error({ err }, 'Error in updateDeliveryStatus controller');
      res.status(500).json({ message: err.message });
    }
  };

  getDeliveriesByRider = async (req: Request, res: Response): Promise<void> => {
    try {
      const { riderId } = req.params;
      const deliveries = await deliveryService.getDeliveriesByRider(riderId);
      res.json(deliveries);
    } catch (err: any) {
      logger.error({ err }, 'Error in getDeliveriesByRider controller');
      res.status(500).json({ message: err.message });
    }
  };

  autoAssignRider = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      const delivery = await deliveryService.autoAssignRider(id);
      
      if (!delivery) {
        res.status(404).json({ message: 'Delivery not found or no available riders' });
      } else {
        res.json(delivery);
      }
    } catch (err: any) {
      logger.error({ err }, 'Error in autoAssignRider controller');
      res.status(500).json({ message: err.message });
    }
  };

  updateRiderLocation = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { latitude, longitude } = req.body;
      
      if (!latitude || !longitude) {
        res.status(400).json({ message: 'Latitude and longitude are required' });
        return;
      }
      
      // Verify the delivery exists
      const delivery = await deliveryService.getDeliveryById(id);
      if (!delivery) {
        res.status(404).json({ message: 'Delivery not found' });
        return;
      }
      
      // In a production system, you might store location history in a separate collection
      // For now, we'll just acknowledge the update
      
      // Publish the location update to connected clients via WebSocket
      // This is handled by the socket.io event handler in server.ts
      
      res.json({ 
        success: true,
        message: 'Location updated successfully',
        deliveryId: id,
        timestamp: new Date()
      });
    } catch (err: any) {
      logger.error({ err }, 'Error in updateRiderLocation controller');
      res.status(500).json({ message: err.message });
    }
  };
  

  trackDelivery = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const delivery = await deliveryService.getDeliveryById(id);
      
      if (!delivery) {
        res.status(404).json({ message: 'Delivery not found' });
        return;
      }
      
      // Return delivery with additional tracking info
      res.json({
        ...delivery.toObject(),
        tracking_enabled: true,
        last_updated: new Date()
      });
    } catch (err: any) {
      logger.error({ err }, 'Error in trackDelivery controller');
      res.status(500).json({ message: err.message });
    }
  };

  getActiveDeliveryForRider = async (req: Request, res: Response): Promise<void> => {
    try {
      const { riderId } = req.params;
      console.log(riderId);
      
      // Find active deliveries for this rider (status is not 'delivered' or 'cancelled')
      const deliveries = await Delivery.find({
        rider_id: riderId,
        status: { $in: ['accepted', 'collected'] }
      });
      console.log(deliveries);
      if (deliveries.length === 0) {
        res.json(null);
      } else {
        // Return the most recently updated delivery
        const activeDelivery = deliveries.sort((a, b) => 
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        )[0];
        
        res.json(activeDelivery);
      }
    } catch (err: any) {
      logger.error({ err }, 'Error in getActiveDeliveryForRider controller');
      res.status(500).json({ message: err.message });
    }
  };
  //home -> latitude: 6.6993360, longitude: 79.9109078
  createTestOrder = async (req: Request, res: Response): Promise<void> => {
    try {
      // Create a test order with random locations
      const testOrder = {
        order_id: `O${Math.floor(Math.random() * 10000)}`,
        restaurant_location: {
          latitude: 6.6993 + (Math.random() * 0.02 - 0.01),
          longitude: 79.9109 + (Math.random() * 0.02 - 0.01)
        },
        customer_location: {
          latitude: 6.6993 + (Math.random() * 0.02 - 0.01),
          longitude: 79.9109 + (Math.random() * 0.02 - 0.01)
        }
      };
      
      // Create a delivery for this test order
      const delivery = await deliveryService.createDelivery({
        order_id: testOrder.order_id,
        restaurant_location: testOrder.restaurant_location,
        customer_location: testOrder.customer_location,
        status: 'pending'
      });
      
      res.status(201).json(delivery);
    } catch (err: any) {
      logger.error({ err }, 'Error in createTestOrder controller');
      res.status(500).json({ message: err.message });
    }
  };

  getDeliveryByOrderId = async (req: Request, res: Response): Promise<void> => {
    try {
      const { orderId } = req.params;
      const delivery = await deliveryService.getDeliveryByOrderId(orderId);
      
      if (!delivery) {
        res.status(404).json({ message: 'No delivery found for this order' });
      } else {
        res.json(delivery);
      }
    } catch (err: any) {
      logger.error({ err }, 'Error in getDeliveryByOrderId controller');
      res.status(500).json({ message: err.message });
    }
  };
  
}
