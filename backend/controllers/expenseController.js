import expenseModel from "../models/expenseModel.js";
import getDateRange from "../utils/dateFilter.js";
import XLSX from "xlsx";

// add expense
export async function addExpense(req, res) {
    const userId = req.user._id;
    const { description, amount, category, date } = req.body;

    try {
        if (!description || !amount || !category || !date) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        const newExpense = new expenseModel({
            userId,
            description,
            amount,
            category,
            date: new Date(date)
        });
        await newExpense.save();
        res.json({
            success: true,
            message: "Expense added successfully"
        });
    }
    catch (error) {
        console.error("Error adding expense:", error);
        res.status(500).json({
            success: false,
            message: "Server error while adding expense"
        });
    }
};

// get all expenses
export async function getAllExpense(req, res) {
    const userId = req.user._id;
    try {
        const expense = await expenseModel.find({ userId }).sort({ date: -1 });
        res.json(expense);
    }
    catch (error) {
        console.error("Error fetching expense:", error);
        res.status(500).json({
            success: false,
            message: "Server error while fetching expense"
        });
    }
};

// update expense
export async function updateExpense(req, res) {
    const { id } = req.params;
    const userId = req.user._id;
    const { description, amount } = req.body;

    try {
        const updatedExpense = await expenseModel.findOneAndUpdate(
            { _id: id, userId },
            { description, amount },
            { new: true }
        );
        if (!updatedExpense) {
            res.status(404).json({
                success: false,
                message: "Expense not found"
            });
        }

        res.json({
            success: true,
            message: "Expense updated successfully",
            date: updatedExpense.date
        });
    } catch (error) {
        console.error("Error updating expense:", error);
        res.status(500).json({
            success: false,
            message: "Server error while updating expense"
        });
    }
};

// delete expense
export async function deleteExpense(req, res) {
    try {
        const expense = await expenseModel.findByIdAndDelete({ _id: req.params.id });
        if (!expense) {
            return res.status(404).json({
                success: false,
                message: "Expense not found"
            });
        }
        res.json({
            success: true,
            message: "Expense deleted successfully"
        });
    }
    catch (error) {
        console.error("Error deleting expense:", error);
        res.status(500).json({
            success: false,
            message: "Server error while deleting expense"
        });
    }
};

// download excel sheet of expense 
export async function downloadExpenseData(req, res) {
    const userId = req.user._id;
    try {
        const expense = await expenseModel.find({ userId }).sort({ date: -1 });
        const plainData = expense.map(expense => ({
            description: expense.description,
            amount: expense.amount,
            category: expense.category,
            Date: new Date(expense.date).toLocaleDateString(),
        }));
        const worksheet = XLSX.utils.json_to_sheet(plainData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "ExpenseModel");
        XLSX.writeFile(workbook, "expense_data.xlsx");
        res.download("expense_data.xlsx");
    } catch (error) {
        console.error("Error downloading expense data:", error);
        res.status(500).json({
            success: false,
            message: "Server error while downloading expense data"
        });
    }
};

//to get overview of expense
export async function getExpenseOverview(req, res) {
    try {
        const userId = req.user._id;
        const { range = "monthly" } = req.query;
        const { start, end } = getDateRange(range);

        const expense = await expenseModel.find({
            userId,
            date: { $gte: start, $lte: end }
        }).sort({ date: -1 });


        const totalExpense = expense.reduce((acc, cur) => acc + cur.amount, 0);
        const averageExpense = 
            expense.length > 0 ? totalExpense / expense.length : 0;
        const numberOfTransactions = expense.length;

        const recentTransactions = expense.slice(0, 5);

        res.json({
            success: true,
            data: {
                totalExpense,
                averageExpense,
                numberOfTransactions,
                recentTransactions,
                range
            }
        });
    }
    catch (error) {
        console.error("Error fetching expense overview:", error);
        res.status(500).json({
            success: false,
            message: "Server error while fetching expense overview"
        });
    }
};