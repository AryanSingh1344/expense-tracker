import incomeModel from '../models/incomeModel.js';

export const addIncome = async (req, res) => {
    try {
        const userId = req.user.id;
        const { description, amount, category, date } = req.body;
        
        if (!description || !amount || !category || !date) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        const newIncome = new incomeModel({ user: userId, description, amount, category, date: new Date(date) });
        await newIncome.save();
        
        res.json({ success: true, message: "Income added successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export const getAllIncome = async (req, res) => {
    try {
        const userId = req.user.id;
        const income = await incomeModel.find({ user: userId }).sort({ date: -1 });
        res.json({ success: true, data: income });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export const deleteIncome = async (req, res) => {
    try {
        const { id } = req.params;
        const income = await incomeModel.findByIdAndDelete(id);
        if (!income) return res.status(404).json({ success: false, message: "Income not found" });
        res.json({ success: true, message: "Income deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};