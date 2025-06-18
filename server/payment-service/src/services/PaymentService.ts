import logger from '../config/logger';

export interface IPaymetnInfo {
    order_id: string;
    customer: String;
    restaurant: String;
    items: [{
        menuItemId: String,
        menuItemName: String,
        menuItemPrice: number,
        qty: number
    }];
    orderAmount: number;
    deliveryFee: number;
    total: number;
    status: 'pending' | 'completed' | 'cancelled';
    paymentMethod: 'card' | 'cash';
    placedAt: Date;
    restaurantLocation: {
        latitude: number,
        longitude: number
    },
    customerLocation: {
        latitude: number,
        longitude: number
    }
}

export interface IPaymentService {
    createPaymentLink(paymentInfo: Partial<IPaymetnInfo>): Promise<String>;
}
