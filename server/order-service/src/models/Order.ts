import mongoose, { Schema } from 'mongoose';

export interface IOrder {
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
    status: 'pending' | 'accepted' | 'declined' | 'completed' | 'cancelled';
    paymentMethod: 'card' | 'cash';
    placedAt: Date;
}

export interface IOrderCreate {
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
    status: 'pending' | 'accepted' | 'declined' | 'completed' | 'cancelled';
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

const OrderSchema: Schema = new Schema<IOrderCreate>({
    order_id: { type: String, required: true, unique: true },
    customer: { type: String, required: true },
    restaurant: { type: String, required: true },
    items: [{
        menuItemId: { type: String, required: true },
        menuItemName: { type: String, required: true },
        menuItemPrice: { type: Number, required: true },
        qty: { type: Number, required: true }
    }],
    orderAmount: { type: Number, required: true },
    deliveryFee: { type: Number, required: true },
    total: { type: Number, required: true },
    status: { type: String, required: true, default: 'pending' },
    paymentMethod: { type: String, required: true },
    placedAt: { type: Date, default: Date.now },
    restaurantLocation: {
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true }
    },
    customerLocation: {
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true }
    }
});

export default mongoose.model<IOrderCreate>('Order', OrderSchema);