import express from 'express';
import { addExpense, getAllExpense, deleteExpense , downloadExpenseExcel } from '../controllers/expenseController.js';
import authMiddleware from '../middleware/auth.js';

const expenseRouter = express.Router();

expenseRouter.post('/add', authMiddleware, addExpense);
expenseRouter.get('/get', authMiddleware, getAllExpense);
expenseRouter.delete('/delete/:id', authMiddleware, deleteExpense);
expenseRouter.get('/download', authMiddleware, downloadExpenseExcel);

export default expenseRouter;