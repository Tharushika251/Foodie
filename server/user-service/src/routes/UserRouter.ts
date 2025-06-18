import express from 'express';
import { UserController } from '../controllers/UserController';

const userRouter = express.Router();
const controller = new UserController();

userRouter.post('/', controller.create);
userRouter.post('/login', controller.login);
userRouter.get('/', controller.getAll);
userRouter.get('/:id', controller.getById);
userRouter.put('/pic/:id', controller.updatePicture);
userRouter.get('/:email', controller.getByEmail);
userRouter.put('/:id', controller.update);
userRouter.delete('/:id', controller.delete);

export default userRouter;
