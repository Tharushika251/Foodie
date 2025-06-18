import { INotification } from '../models/Notification';

export interface NotificationService {
    orderPlacedNotification(userId: string, orderId: string, email: string, phone: string): Promise<INotification>;
    orderCompletedNotification(userId: string, orderId: string, email: string, phone: string, content: string): Promise<INotification>;
}
