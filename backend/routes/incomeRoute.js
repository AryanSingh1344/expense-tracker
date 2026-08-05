import express from 'express';
import { addIncome, getAllIncome, deleteIncome, downloadIncomeExcel } from '../controllers/incomeController.js';
import authMiddleware from '../middleware/auth.js';

const incomeRouter = express.Router();

incomeRouter.post('/add', authMiddleware, addIncome);
incomeRouter.get('/get', authMiddleware, getAllIncome);
incomeRouter.delete('/delete/:id', authMiddleware, deleteIncome);
incomeRouter.get('/download', authMiddleware, downloadIncomeExcel);

export default incomeRouter;