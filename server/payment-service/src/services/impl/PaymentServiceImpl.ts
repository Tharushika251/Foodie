import logger from '../../config/logger';
import { IPaymentService, IPaymetnInfo } from '../PaymentService'

export class PaymentService implements IPaymentService {

    async createPaymentLink(paymentInfo: Partial<IPaymetnInfo>): Promise<String> {
        logger.info('Creating Payment Link');

        const stripe = require('stripe')('');

        if (!paymentInfo.total) {
            throw new Error('Total amount is required');
        }

        const product = await stripe.products.create({
            name: 'Food Order',
        });

        const price = await stripe.prices.create({
            product: product.id,
            unit_amount: Math.round(paymentInfo.total * 100),
            currency: 'lkr',
        });

        const paymentLink = await stripe.checkout.sessions.create({
            line_items: [
                {
                    price: price.id,
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: 'http://localhost:5173/order?status=success&customer='+paymentInfo.customer,
            cancel_url: 'http://localhost:5173/order?status=failed',
        });
        return paymentLink.url;
    }
}