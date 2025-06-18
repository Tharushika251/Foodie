import { Router } from 'express';
import { NotificationController } from '../controllers/NotificationController';

const router = Router();
const notificationController = new NotificationController();

router.post('/place', notificationController.orderPlacedNotification);
router.post('/complete', notificationController.orderCompletedNotification);
// Add test endpoint
router.post('/test', notificationController.testNotification);

export default router;
