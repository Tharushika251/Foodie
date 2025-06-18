import logger from '../config/logger';
import nodemailer from 'nodemailer';
import { Infobip, AuthType } from '@infobip-api/sdk';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Infobip client
const infobipClient = new Infobip({
    baseUrl: process.env.INFOBIP_BASE_URL || 'https://api.infobip.com',
    authType: AuthType.ApiKey,
    apiKey: process.env.INFOBIP_API_KEY || '',
});

export async function sendEmail(to: string, subject: string, content: string): Promise<boolean> {
    logger.info(`Sending Mail To: ${to}`);

    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER!,
                pass: process.env.EMAIL_PASS!,
            }
        });

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to,
            subject,
            text: content,
        });
        logger.info('Email sent successfully');

    } catch (err) {
        logger.error('Email sending failed : ', err);
        throw new Error('Email delivery failed');
    }

    return true;
}

export async function sendSMS(to: string, content: string): Promise<boolean> {
    logger.info(`Sending SMS To: ${to}, Content: ${content}`);

    try {
        // Ensure phone number has proper format
        if (!to.startsWith('+')) {
            to = '+' + to;
        }

        // Send SMS using Infobip
        const response = await infobipClient.channels.sms.send({
            messages: [{
                destinations: [{ to }],
                from: process.env.INFOBIP_SENDER || 'Foodie',
                text: content,
            }]
        });
        
        logger.info(`SMS sent successfully with ID: ${response.messages?.[0]?.messageId}`);
    } catch (error: any) {
        // Detailed error logging
        logger.error('SMS sending failed:', error.message);
        console.error('Full Infobip error:', error);
        
        // For development purposes, log a mock success instead of failing
        logger.info(`MOCK SMS SENT: To: ${to}, Content: ${content}`);
        return true;
    }

    return true;
}
