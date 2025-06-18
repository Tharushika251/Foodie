import { Request, Response } from 'express';
import RestaurantServiceImpl from '../services/impl/RestaurantServiceImpl';

const restaurantService = new RestaurantServiceImpl();

class RestaurantController {

    createRestaurant = async (req: Request, res: Response): Promise<void> => {
        try {
            const restaurantData = req.body;
            console.log(restaurantData)
            const restaurant = await restaurantService.createRestaurant(restaurantData);
            res.status(201).json(restaurant);
        } catch (error: any) {
            res.status(400).json({ error: error.message || 'Failed to create restaurant' });
        }
    };

    getAllRestaurants = async (req: Request, res: Response): Promise<void> => {
        try {
            const restaurants = await restaurantService.getAllRestaurants();
            res.status(200).json(restaurants);
        } catch (error: any) {
            res.status(400).json({ error: error.message || 'Failed to get restaurants' });
        }
    };

    getRestaurantById = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const restaurant = await restaurantService.getRestaurantById(id);
            res.status(200).json(restaurant);
        } catch (error: any) {
            if (error.message === 'Restaurant not found') {
                res.status(404).json({ error: error.message });
            } else {
                res.status(400).json({ error: error.message || 'Failed to get restaurant' });
            }
        }
    };

    getUnverfiedRestaurant = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const restaurant = await restaurantService.getUnverifiedRestaurants();
            res.status(200).json(restaurant);
        } catch (error: any) {
            if (error.message === 'Restaurant not found') {
                res.status(404).json({ error: error.message });
            } else {
                res.status(400).json({ error: error.message || 'Failed to get restaurant' });
            }
        }
    };

    getRestaurantByOwnerId = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const restaurant = await restaurantService.getRestaurantByOwnerId(id);
            res.status(200).json(restaurant);
        } catch (error: any) {
            if (error.message === 'Restaurant not found') {
                res.status(404).json({ error: error.message });
            } else {
                res.status(400).json({ error: error.message || 'Failed to get restaurant' });
            }
        }
    };

    updateRestaurant = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const updateData = req.body;

            const updatedRestaurant = await restaurantService.updateRestaurant(id, updateData);
            res.status(200).json(updatedRestaurant);
        } catch (error: any) {
            if (error.message === 'restaurant not found') {
                res.status(404).json({ error: 'Restaurant not found' });
            } else {
                res.status(400).json({ error: error.message || 'Failed to update restaurant' });
            }
        }
    };

    verifyRestaurant = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const updateData = req.body.status;
            console.log(updateData)

            const updatedRestaurant = await restaurantService.verifyRestaurant(id, updateData);
            res.status(200).json(updatedRestaurant);
        } catch (error: any) {
            if (error.message === 'restaurant not found') {
                res.status(404).json({ error: 'Restaurant not found' });
            } else {
                res.status(400).json({ error: error.message || 'Failed to update restaurant' });
            }
        }
    };

    deleteRestaurant = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const result = await restaurantService.deleteRestaurant(id);
            res.status(200).json(result);
        } catch (error: any) {
            if (error.message === 'restaurant not found') {
                res.status(404).json({ error: 'Restaurant not found' });
            } else {
                res.status(400).json({ error: error.message || 'Failed to delete restaurant' });
            }
        }
    };
}

export default RestaurantController;
