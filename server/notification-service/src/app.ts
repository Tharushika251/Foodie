import express from 'express';
import cors from 'cors';
import router from './routes/NotificationRouter';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/notifications', router);

export default app;
