import { Router } from 'express';
import MenuItemController from '../controllers/menuItemController';

const menuItemRouter = Router();
const controller = new MenuItemController();

menuItemRouter.post('/',controller.createMenuItem);

menuItemRouter.get('/restaurant/:restaurantId',controller.getMenuItemsByRestaurant);

menuItemRouter.get('/category',controller.getMenuItemsByCategory);

menuItemRouter.put('/:id',controller.updateMenuItem);

menuItemRouter.delete('/:id',controller.deleteMenuItem);

menuItemRouter.get('/restaurant/:restaurantId/paginated',controller.getPaginatedMenuItems);

export default menuItemRouter;
