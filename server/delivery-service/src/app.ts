import express from 'express';
import cors from 'cors';
import deliveryRouter from './routes/DeliveryRouter';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/deliveries', deliveryRouter);

export default app;
