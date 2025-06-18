import { IOrder, IOrderCreate } from '../models/Order';

export interface IOrderService {
  createOrder(order: IOrderCreate): Promise<IOrder>;
  updateOrder(orderId: string, order: Partial<IOrder>): Promise<IOrder | null>;
  verifyOrder(orderId: string, status: number): Promise<IOrder | null>;
  deleteOrder(orderId: string): Promise<boolean>;
  getOrderById(orderId: string): Promise<IOrder | null>;
  getOrdersByUserId(orderId: string): Promise<IOrder[] | null>;
  getAllOrders(): Promise<IOrder[]>;
  generateOrderId(): Promise<string>;
  getUnverifiedOrders(restaurantId: string): Promise<IOrder[] | null>;
}
