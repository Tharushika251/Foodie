import mongoose from 'mongoose';
import Restaurant, { IRestaurant, IRestaurantCreate } from '../../models/Restaurant';
import axios from 'axios';
import logger from '../../config/logger';

export interface RestaurantWithOpenStatus {
    _id: mongoose.Types.ObjectId;
    name: string;
    address: string;
    ownerId: string;
    openTime: string;
    closeTime: string;
    createdAt?: Date;
    updatedAt?: Date;
    isOpen: boolean;
}

class RestaurantServiceImpl implements RestaurantServiceImpl {

    private isCurrentlyOpen(openTime: string, closeTime: string): boolean {
        try {
            logger.info(`Checking if restaurant is open. Open time: ${openTime}, Close time: ${closeTime}`);

            if (
                typeof openTime !== 'string' ||
                typeof closeTime !== 'string' ||
                !/^\d{1,2}:\d{2}$/.test(openTime) ||
                  !/^\d{1,2}:\d{2}$/.test(closeTime)
            ) {
                logger.info(`Invalid time format. Open time: ${openTime}, Close time: ${closeTime}`);
                return false;
            }

            const [openHour, openMinute] = openTime.split(':').map(Number);
            const [closeHour, closeMinute] = closeTime.split(':').map(Number);

            // Validate time ranges
            if (
                openHour < 0 || openHour > 23 || openMinute < 0 || openMinute > 59 ||
                closeHour < 0 || closeHour > 23 || closeMinute < 0 || closeMinute > 59
            ) {
                logger.info(`Time values out of valid range. Open: ${openHour}:${openMinute}, Close: ${closeHour}:${closeMinute}`);
                return false;
            }

            // Handle 24-hour open case
            if (openHour === closeHour && openMinute === closeMinute) {
                logger.info('Restaurant is open 24 hours');
                return true;
            }

            const now = new Date();
            let currentMinutes = now.getHours() * 60 + now.getMinutes();

            const openMinutes = openHour * 60 + openMinute;
            let closeMinutes = closeHour * 60 + closeMinute;

            // Handle next-day close times
            if (closeMinutes <= openMinutes) {
                closeMinutes += 24 * 60;
                if (currentMinutes < openMinutes) {
                    currentMinutes += 24 * 60;
                }
            }

            const isOpen = currentMinutes >= openMinutes && currentMinutes < closeMinutes;
            logger.info(`Restaurant open status: ${isOpen ? 'Open' : 'Closed'}`);
            return isOpen;
        } catch (err: any) {
            logger.info(`isCurrentlyOpen calculation failed: ${err.message}`);
            return false;
        }
    }

    async createRestaurant(restaurantData: IRestaurantCreate): Promise<IRestaurant> {
        try {
            logger.info(`Creating new restaurant: ${restaurantData.name}`);

            logger.info('Making API call to create restaurant owner');
            const response = await axios.post('http://localhost:5000/api/users', {
                name: restaurantData.owner.name,
                email: restaurantData.owner.email,
                password: restaurantData.owner.password,
                phone_number: restaurantData.owner.phone_number,
                role: "restaurant",
                address: restaurantData.address,
            });

            logger.info(`Owner created successfully with ID: ${response.data.user_id}`);
            restaurantData.ownerId = response.data.user_id;

            logger.info('Saving restaurant to database');
            const restaurant = new Restaurant(restaurantData);
            await restaurant.save();

            logger.info(`Restaurant created successfully with ID: ${restaurant._id}`);
            return restaurant.toObject();
        } catch (error: any) {
            logger.error(`Failed to create restaurant: ${error.message}`);
            throw new Error(error.message || 'Failed to create restaurant');
        }
    }

    async getAllRestaurants(): Promise<RestaurantWithOpenStatus[]> {
        try {
            logger.info('Fetching all restaurants');
            const restaurants = await Restaurant.find({ status: 1 });
            logger.info(`Found ${restaurants.length} restaurants`);

            const restaurantsWithStatus = restaurants.map((r) => {
                const plain = r.toObject() as Omit<RestaurantWithOpenStatus, 'isOpen'>;
                const isOpen = this.isCurrentlyOpen(r.openTime, r.closeTime);

                return {
                    ...plain,
                    isOpen
                };
            });

            logger.info('Successfully processed all restaurants with open status');
            return restaurantsWithStatus;
        } catch (error: any) {
            logger.error(`Failed to get restaurants: ${error.message}`);
            throw new Error(error.message || 'Failed to get restaurants');
        }
    }

    async getUnverifiedRestaurants(): Promise<IRestaurant[]> {
        try {
            logger.info('Fetching Unverified restaurants');
            const restaurants = await Restaurant.find({ status: 0 });
            logger.info(`Found ${restaurants.length} restaurants`);

            logger.info('Successfully processed Unverified restaurants with open status');
            return restaurants;
        } catch (error: any) {
            logger.error(`Failed to get restaurants: ${error.message}`);
            throw new Error(error.message || 'Failed to get restaurants');
        }
    }

    async getRestaurantById(restaurantId: string): Promise<RestaurantWithOpenStatus> {
        try {
            logger.info(`Fetching restaurant by ID: ${restaurantId}`);

            if (!restaurantId) {
                logger.info('Restaurant ID is missing');
                throw new Error('restaurant ID is required');
            }

            const restaurant = await Restaurant.findById(restaurantId);
            if (!restaurant) {
                logger.info(`Restaurant not found with ID: ${restaurantId}`);
                throw new Error('Restaurant not found');
            }

            logger.info(`Found restaurant: ${restaurant.name}`);
            const plain = restaurant.toObject() as Omit<RestaurantWithOpenStatus, 'isOpen'>;
            const isOpen = this.isCurrentlyOpen(restaurant.openTime, restaurant.closeTime);

            return {
                ...plain,
                isOpen
            };
        } catch (error: any) {
            logger.error(`Failed to get restaurant by ID: ${error.message}`);
            throw new Error(error.message || 'Failed to get restaurant');
        }
    }

    async getRestaurantByOwnerId(ownerId: string): Promise<RestaurantWithOpenStatus> {
        try {
            logger.info(`Fetching restaurant by owner ID: ${ownerId}`);

            if (!ownerId) {
                logger.info('Owner ID is missing');
                throw new Error('Owner ID is required');
            }

            const restaurant = await Restaurant.findOne({ ownerId: ownerId, status: 1 });
            if (!restaurant) {
                logger.info(`No restaurant found for owner ID: ${ownerId}`);
                throw new Error('Restaurant not found');
            }

            logger.info(`Found restaurant: ${restaurant.name} for owner: ${ownerId}`);
            const plain = restaurant.toObject() as Omit<RestaurantWithOpenStatus, 'isOpen'>;
            const isOpen = this.isCurrentlyOpen(restaurant.openTime, restaurant.closeTime);

            return {
                ...plain,
                isOpen
            };
        } catch (error: any) {
            logger.error(`Failed to get restaurant by owner ID: ${error.message}`);
            throw new Error(error.message || 'Failed to get restaurant');
        }
    }

    async updateRestaurant(restaurantId: string, updateData: Partial<IRestaurant>): Promise<IRestaurant> {
        try {
            logger.info(`Updating restaurant with ID: ${restaurantId}`);
            logger.info(`Update data: ${JSON.stringify(updateData)}`);

            const restaurant = await Restaurant.findByIdAndUpdate(restaurantId, updateData, {
                new: true,
            });

            if (!restaurant) {
                logger.info(`Restaurant not found with ID: ${restaurantId}`);
                throw new Error('restaurant not found');
            }

            logger.info(`Restaurant updated successfully: ${restaurant.name}`);
            return restaurant.toObject();
        } catch (error: any) {
            logger.error(`Failed to update restaurant: ${error.message}`);
            throw new Error(error.message || 'Failed to update restaurant');
        }
    }

    async verifyRestaurant(restaurantId: string, status: number): Promise<IRestaurant> {
        try {
            logger.info(`Verifying restaurant with ID: ${restaurantId}, setting status to: ${status}`);

            const restaurant = await Restaurant.findByIdAndUpdate(
                restaurantId,
                { status: status },
                { new: true }
            );

            if (!restaurant) {
                logger.info(`Restaurant not found with ID: ${restaurantId}`);
                throw new Error('Restaurant not found');
            }

            logger.info(`Restaurant verification status updated successfully for: ${restaurant.name}, new status: ${status}`);
            return restaurant.toObject();
        } catch (error: any) {
            logger.error(`Failed to verify restaurant: ${error.message}`);
            throw new Error(error.message || 'Failed to verify restaurant');
        }
    }


    async deleteRestaurant(restaurantId: string): Promise<{ message: string }> {
        try {
            logger.info(`Deleting restaurant with ID: ${restaurantId}`);

            const restaurant = await Restaurant.findByIdAndDelete(restaurantId);
            if (!restaurant) {
                logger.info(`Restaurant not found with ID: ${restaurantId}`);
                throw new Error('restaurant not found');
            }

            logger.info(`Restaurant deleted successfully: ${restaurant.name}`);
            return { message: `Restaurant '${restaurant.name}' deleted successfully` };
        } catch (error: any) {
            logger.error(`Failed to delete restaurant: ${error.message}`);
            throw new Error(error.message || 'Failed to delete restaurant');
        }
    }
}

export default RestaurantServiceImpl;
