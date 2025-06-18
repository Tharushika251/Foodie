import mongoose, { Schema } from 'mongoose';

export interface IMenuItem {
    restaurantId: mongoose.Types.ObjectId;
    name: string;
    description?: string;
    price: number;
    isAvailable: boolean;
    category?: string;
    imageUrls?: string[]; 
}

const CATEGORIES = [
    'Appetizers',
    'Salads',
    'Main Course',
    'Pizzas',
    'Burgers & Sandwiches',
    'Asian Specials',
    'Mexican',
    'Beverages',
    'Desserts',
];

const menuItemSchema = new Schema<IMenuItem>(
    {
        restaurantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Restaurant',
            required: true,
        },
        name: { type: String, required: true },
        description: { type: String },
        price: { type: Number, required: true },
        isAvailable: { type: Boolean, default: true },
        category: {
            type: String, enum: CATEGORIES, required: true, },
        imageUrls: {
            type: [String],
            default: [],
        },
    },
    { timestamps: true }
);

export default mongoose.model<IMenuItem>('MenuItem', menuItemSchema);
