import mongoose from 'mongoose';
import { IRestaurant } from '../models/Restaurant';

export interface RestaurantWithOpenStatus {
    _id: mongoose.Types.ObjectId;
    name: string;
    address: string;
    ownerId: mongoose.Types.ObjectId;
    openTime: string;
    closeTime: string;
    createdAt?: Date;
    updatedAt?: Date;
    isOpen: boolean;
}

export interface IRestaurantService {

    createRestaurant(restaurantData: Partial<IRestaurant>): Promise<IRestaurant>;

    getAllRestaurants(): Promise<RestaurantWithOpenStatus[]>;

    getUnverifiedRestaurants(): Promise<IRestaurant[]>;
    
    getRestaurantById(restaurantId: string): Promise<RestaurantWithOpenStatus>;

    getRestaurantByOwnerId(ownerId: string): Promise<RestaurantWithOpenStatus>;

    updateRestaurant(restaurantId: string, updateData: Partial<IRestaurant>): Promise<IRestaurant>;

    deleteRestaurant(restaurantId: string): Promise<{ message: string }>;

    verifyRestaurant(restaurantId: string, status: number): Promise<IRestaurant>
}

export interface IRestaurantUtility {
    isCurrentlyOpen(openTime: string, closeTime: string): boolean;
}
