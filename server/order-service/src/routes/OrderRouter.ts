import { Router } from 'express';
import { OrderController } from '../controllers/OrderController';

const orderRouter = Router();
const controller = new OrderController();

orderRouter.post('/', controller.create);
orderRouter.put('/verify/:orderId/:status', controller.verify);
orderRouter.put('/:orderId', controller.update);
orderRouter.delete('/:orderId', controller.delete);
orderRouter.get('/:orderId', controller.getById);
orderRouter.get('/user/:userId', controller.getByUserId);
orderRouter.get('/verify/:restaurantId', controller.getUnverifiedOrders);
orderRouter.get('/', controller.getAll);

export default orderRouter;
