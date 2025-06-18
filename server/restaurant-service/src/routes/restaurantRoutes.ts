import { Router } from 'express';
import RestaurantController from '../controllers/restaurantController';

const restaurantRouter = Router();
const controller = new RestaurantController();


restaurantRouter.get('/unverified', controller.getUnverfiedRestaurant);

restaurantRouter.get('/owner/:id', controller.getRestaurantByOwnerId);

restaurantRouter.delete('/:id', controller.deleteRestaurant);

restaurantRouter.get('/', controller.getAllRestaurants);

restaurantRouter.get('/:id', controller.getRestaurantById);

restaurantRouter.post('/', controller.createRestaurant);

restaurantRouter.put('/verify/:id', controller.verifyRestaurant);

restaurantRouter.put('/:id', controller.updateRestaurant);

export default restaurantRouter;
