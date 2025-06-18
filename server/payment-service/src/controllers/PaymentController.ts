import { Request, Response } from 'express';
import { PaymentService } from '../services/impl/PaymentServiceImpl';
import logger from '../config/logger';

const paymentService = new PaymentService();

export class PaymentController {
  create = async (req: Request, res: Response): Promise<void> => {
    try {

      const paymentData = req.body;
      const paymentLink = await paymentService.createPaymentLink(paymentData);
      res.status(201).json(paymentLink);

    } catch (error) {
      logger.error(`Error creating Link: ${error}`);
      res.status(500).json({ error: 'Failed to create Link' });
    }
  };

}
