import { NotificationService } from '../NotificationService';
import Notification, { INotification } from '../../models/Notification';
import logger from '../../config/logger';
import { sendEmail, sendSMS } from '../../utils/messageSender';

export class NotificationServiceImpl implements NotificationService {

    async orderPlacedNotification(userId: string, orderId: string, email: string, phone: string): Promise<INotification> {

        try {
            const content = `Your order #${orderId} has been successfully placed. We'll notify you when the restaurant confirms your order. Thank you for choosing Foodie!`;

            sendEmail(email, "Order Placed", content);
            sendSMS(phone, content);

            const notification = new Notification({
                user_id: userId,
                order_id: orderId,
                content: content,
            });

            const createdNotification = notification.save();
            return createdNotification;
        } catch (error) {
            logger.error(`Failed to send notifications: ${error}`);
            throw error;
        }
    }

    async orderCompletedNotification(userId: string, orderId: string, email: string, phone: string): Promise<INotification> {

        try {

            const content = `Great news! You have completed order #${orderId}. Thank You for your Service!`;

            sendEmail(email, "Order Placed", content);
            sendSMS(phone, content);

            const notification = new Notification({
                user_id: userId,
                order_id: orderId,
                content: content,
            });

            const createdNotification = notification.save();
            return createdNotification;

        } catch (error) {
            logger.error(`Failed to send notifications: ${error}`);
            throw error;
        }

    }

}