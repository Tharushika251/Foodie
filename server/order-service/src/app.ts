import express from 'express';
import cors from 'cors';
import orderRouter from './routes/OrderRouter';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/order', orderRouter);

export default app;
