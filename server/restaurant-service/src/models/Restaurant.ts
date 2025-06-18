import mongoose, { Schema } from 'mongoose';

export interface IRestaurant {
    name: string;
    address: string;
    location: {
        longitude: number;
        latitude: number;
    };
    ownerId: string;
    imageUrl: string;
    openTime: string;
    closeTime: string;
    status: number;
}

export interface IRestaurantCreate {
    name: string;
    address: string;
    location: {
        longitude: number;
        latitude: number;
    };
    ownerId: string;
    imageUrl: string;
    openTime: string;
    closeTime: string;

    owner: {
        name: string,
        email: string,
        phone_number: string,
        password: string
        role: string;

    }
}

const restaurantSchema: Schema = new Schema<IRestaurant>(
    {
        name: { type: String, required: true },
        address: { type: String, required: true },
        location: {
            longitude: { type: Number, required: true },
            latitude: { type: Number, required: true },
        },
        ownerId: { type: String, required: true },
        imageUrl: {
            type: String,
        },
        openTime: { type: String, required: true },
        closeTime: { type: String, required: true },
        status: { type: Number, default: 0 },
    },
    { timestamps: true }
);

export default mongoose.model<IRestaurant>('Restaurant', restaurantSchema);
