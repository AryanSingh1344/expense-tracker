import express from "express";
import authMiddleware from "../middleware/auth.js";
import { addExpense, deleteExpense, downloadExpenseData, getAllExpense, getExpenseOverview, updateExpense } from "../controllers/expenseController.js";

const expenseRouter = express.Router();

expenseRouter.post('/add', authMiddleware, addExpense);
expenseRouter.get('/all', authMiddleware, getAllExpense );

expenseRouter.put('/update/:id', authMiddleware, updateExpense);
expenseRouter.get('/downloadexcel', authMiddleware, downloadExpenseData );

expenseRouter.delete('/delete/:id', authMiddleware, deleteExpense);
expenseRouter.get('/overview', authMiddleware, getExpenseOverview);

export default expenseRouter;
