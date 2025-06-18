import express from 'express';
import cors from 'cors';
import menuItemRouter from './routes/menuItemRoutes';
import restaurantRouter from './routes/restaurantRoutes';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/restaurant', restaurantRouter);
app.use('/api/menu', menuItemRouter);

export default app;
