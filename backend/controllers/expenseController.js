import expenseModel from '../models/expenseModel.js';

export const addExpense = async (req, res) => {
    try {
        const userId = req.user.id;
        const { description, amount, category, date } = req.body;
        
        if (!description || !amount || !category || !date) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        const newExpense = new expenseModel({ user: userId, description, amount, category, date: new Date(date) });
        await newExpense.save();
        
        res.json({ success: true, message: "Expense added successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export const getAllExpense = async (req, res) => {
    try {
        const userId = req.user.id;
        const expense = await expenseModel.find({ user: userId }).sort({ date: -1 });
        res.json({ success: true, data: expense });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export const deleteExpense = async (req, res) => {
    try {
        const { id } = req.params;
        const expense = await expenseModel.findByIdAndDelete(id);
        if (!expense) return res.status(404).json({ success: false, message: "Expense not found" });
        res.json({ success: true, message: "Expense deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};