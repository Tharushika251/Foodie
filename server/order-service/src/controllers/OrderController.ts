import { Request, Response } from 'express';
import { OrderService } from '../services/impl/OrderServiceImpl';
import logger from '../config/logger';
import { Console } from 'console';

const orderService = new OrderService();

export class OrderController {
  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const orderData = req.body;
      orderData.order_id = await orderService.generateOrderId();
      const newOrder = await orderService.createOrder(orderData);
      res.status(201).json(newOrder);
    } catch (error) {
      logger.error(`Error creating order: ${error}`);
      res.status(500).json({ error: 'Failed to create order' });
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const { orderId } = req.params;
      const updatedOrder = await orderService.updateOrder(orderId, req.body);
      if (!updatedOrder) {
        res.status(404).json({ message: 'Order not found' });
      } else {
        res.json(updatedOrder);
      }
    } catch (error) {
      logger.error(`Error updating order ${req.params.orderId}: ${error}`);
      res.status(500).json({ error: 'Failed to update order' });
    }
  };

  verify = async (req: Request, res: Response): Promise<void> => {
    try {
      const { orderId, status } = req.params;
      logger.info(req.params)
      const updatedOrder = await orderService.verifyOrder(orderId, parseInt(status));
      if (!updatedOrder) {
        res.status(404).json({ message: 'Order not found' });
      } else {
        res.json(updatedOrder);
      }
    } catch (error) {
      logger.error(`Error verifying order ${req.params.orderId}: ${error}`);
      res.status(500).json({ error: 'Failed to verifying order' });
    }
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const { orderId } = req.params;
      const success = await orderService.deleteOrder(orderId);
      if (!success) {
        res.status(404).json({ message: 'Order not found' });
      } else {
        res.json({ message: 'Order deleted successfully' });
      }
    } catch (error) {
      logger.error(`Error deleting order ${req.params.orderId}: ${error}`);
      res.status(500).json({ error: 'Failed to delete order' });
    }
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { orderId } = req.params;
      const order = await orderService.getOrderById(orderId);
      if (!order) {
        res.status(404).json({ message: 'Order not found' });
      } else {
        res.json(order);
      }
    } catch (error) {
      logger.error(`Error retrieving order ${req.params.orderId}: ${error}`);
      res.status(500).json({ error: 'Failed to retrieve order' });
    }
  };

  getUnverifiedOrders = async (req: Request, res: Response): Promise<void> => {
    try {
      const { restaurantId } = req.params;
      const order = await orderService.getUnverifiedOrders(restaurantId);
      if (!order) {
        res.status(404).json({ message: 'Order not found' });
      } else {
        res.json(order);
      }
    } catch (error) {
      logger.error(`Error retrieving order ${req.params.orderId}: ${error}`);
      res.status(500).json({ error: 'Failed to retrieve order' });
    }
  };

  getByUserId = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      const orders = await orderService.getOrdersByUserId(userId);
      logger.info(orders)
      res.json(orders);
    } catch (error) {
      logger.error(`Error retrieving orders for user ${req.params.userId}: ${error}`);
      res.status(500).json({ error: 'Failed to retrieve orders' });
    }
  };

  getAll = async (_req: Request, res: Response): Promise<void> => {
    try {
      const orders = await orderService.getAllOrders();
      res.json(orders);
    } catch (error) {
      logger.error(`Error retrieving all orders: ${error}`);
      res.status(500).json({ error: 'Failed to retrieve orders' });
    }
  };
}
