import Order, { IOrder, IOrderCreate } from '../../models/Order';
import { IOrderService } from '../OrderService';
import logger from '../../config/logger';
import axios from 'axios';

export class OrderService implements IOrderService {
    async generateOrderId(): Promise<string> {
        logger.info('Generating new Order ID');
        try {
            const count = await Order.countDocuments();
            const nextSequence = count + 1;
            const formattedSequence = nextSequence.toString().padStart(4, '0');
            const orderId = `ORD${formattedSequence}`;
            logger.debug('Order ID generated');
            return orderId;

        } catch (error) {
            logger.error({ error }, 'Failed to generate user ID');
            throw error;
        }
    }

    async createOrder(order: IOrderCreate): Promise<IOrder> {
        logger.info(`Creating new order for customer ${order.customer}`);
        const newOrder = new Order(order);
        const savedOrder = await newOrder.save();

        const { data: user } = await axios.get('http://localhost:5000/api/users/' + order.customer);

        try {
            await axios.post('http://localhost:5004/api/notifications/place', {
                user_id: order.customer,
                order_id: order.order_id,
                email: user.email,
                phone: user.phone_number
            });
            logger.info("Notification sent to customer");
        } catch (error) {
            logger.error(`Failed to send notification to customer: ${error}`);
        }

        return savedOrder;
    }
    async updateOrder(orderId: string, order: Partial<IOrder>): Promise<IOrder | null> {
        logger.info(`Updating order ${orderId}`);
        const updated = await Order.findOneAndUpdate({ order_id: orderId }, order, {
            new: true,
        });
        if (updated) {
            logger.info(`Order ${orderId} updated successfully`);
        } else {
            logger.warn(`Order ${orderId} not found for update`);
        }
        return updated;
    }

    async verifyOrder(orderId: string, status: number): Promise<IOrder | null> {
        logger.info(`Verifying order ${orderId}`);
        let updated;

        const order = await this.getOrderById(orderId);
        if (!order) {
            return null;
        }
        if (status == 1) {
            updated = await Order.findOneAndUpdate({ order_id: orderId }, { status: 'accepted' }, { new: true });

            try {
                await axios.post('http://localhost:5005/api/deliveries', {
                    order_id: order.order_id,
                    customer: order.customer,
                    restaurant: order.restaurant,
                    payment_method: order.paymentMethod,
                    restaurant_location: order.restaurantLocation,
                    customer_location: order.customerLocation,
                    total: order.total
                });
                logger.info(`Order created with ID: ${order.order_id}`);
            } catch (error) {
                logger.error(`Failed to create order: ${error}`);
            }

        } else if (status == 0) {
            updated = await Order.findOneAndUpdate({ order_id: orderId }, { status: 'declined' }, { new: true });
        } else if (status == 2) {
            updated = await Order.findOneAndUpdate({ order_id: orderId }, { status: 'completed' }, { new: true });
        }

        if (updated) {
            logger.info(`Order ${orderId} Verified successfully`);
        } else {
            logger.warn(`Order ${orderId} not found for verify`);
        }
        return updated || null;
    }

    async deleteOrder(orderId: string): Promise<boolean> {
        logger.info(`Deleting order ${orderId}`);
        const result = await Order.deleteOne({ order_id: orderId });
        if (result.deletedCount > 0) {
            logger.info(`Order ${orderId} deleted`);
            return true;
        } else {
            logger.warn(`Order ${orderId} not found for deletion`);
            return false;
        }
    }

    async getOrderById(orderId: string): Promise<IOrderCreate | null> {
        logger.info(`Fetching order by ID: ${orderId}`);
        return await Order.findOne({ order_id: orderId });
    }

    async getUnverifiedOrders(restaurantId: string): Promise<IOrder[] | null> {
        logger.info(`Fetching Unverified Orders for : ${restaurantId}`);
        return await Order.find({ restaurant: restaurantId, status: 'pending' });
    }

    async getOrdersByUserId(userId: string): Promise<IOrder[] | null> {
        logger.info(`Fetching orders for user ID: ${userId}`);
    
        try {
            const orders = await Order.find({ customer: userId });
            if (!orders || orders.length === 0) {
                logger.warn(`Orders with User ID ${userId} not found`);
                return null;
            }
            const ordersWithRestaurantNames = await Promise.all(
                orders.map(async (order) => {
                    try {
                        const { data: restaurant } = await axios.get(`http://localhost:5001/api/restaurant/${order.restaurant}`);
                        logger.info(`Added restaurant name for order ${order.order_id}`);
                        return {
                            ...order.toObject(),
                            restaurantName: restaurant.name
                        };
                    } catch (error) {
                        logger.warn(`Failed to fetch restaurant details for order ${order.order_id}: ${error}`);
                        return order.toObject();
                    }
                })
            );
    
            return ordersWithRestaurantNames;
        } catch (error) {
            logger.error(`Failed to fetch orders: ${error}`);
            return null;
        }
    }
    

    async getAllOrders(): Promise<IOrder[]> {
        logger.info(`Fetching all orders`);
        return await Order.find({});
    }
}
