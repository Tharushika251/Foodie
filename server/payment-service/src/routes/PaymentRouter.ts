import { Router } from 'express';
import { PaymentController } from '../controllers/PaymentController';

const paymentRouter = Router();
const controller = new PaymentController();

paymentRouter.post('/', controller.create);

export default paymentRouter;
