import express from 'express';
import { addIncome, getAllIncome, deleteIncome } from '../controllers/incomeController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const incomeRouter = express.Router();

incomeRouter.post('/add', authMiddleware, addIncome);
incomeRouter.get('/get', authMiddleware, getAllIncome);
incomeRouter.delete('/delete/:id', authMiddleware, deleteIncome);

export default incomeRouter;