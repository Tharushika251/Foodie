import { IDelivery } from '../models/Delivery';

export interface IDeliveryService {
  createDelivery(deliveryData: Partial<IDelivery>): Promise<IDelivery>;
  getDeliveryById(deliveryId: string): Promise<IDelivery | null>;
  getDeliveriesByStatus(status: string): Promise<IDelivery[]>;
  getNearbyDeliveries(longitude: number, latitude: number, maxDistance: number): Promise<IDelivery[]>;
  acceptDelivery(deliveryId: string, riderId: string): Promise<IDelivery | null>;
  updateDeliveryStatus(deliveryId: string, status: string, timestamp?: Date): Promise<IDelivery | null>;
  getDeliveriesByRider(riderId: string): Promise<IDelivery[]>;
  generateDeliveryId(): Promise<string>;
  getDeliveryByOrderId(orderId: string): Promise<IDelivery | null>;
}
