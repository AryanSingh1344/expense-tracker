import express from 'express';
import { addExpense, getAllExpense, deleteExpense } from '../controllers/expenseController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const expenseRouter = express.Router();

expenseRouter.post('/add', authMiddleware, addExpense);
expenseRouter.get('/get', authMiddleware, getAllExpense);
expenseRouter.delete('/delete/:id', authMiddleware, deleteExpense);

export default expenseRouter;