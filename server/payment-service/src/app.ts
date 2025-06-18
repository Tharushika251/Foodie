import express from 'express';
import cors from 'cors';
import paymentRouter from './routes/PaymentRouter';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/payment', paymentRouter);

export default app;
