import expenseModel from '../models/expenseModel.js';
import excel from 'exceljs';

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


export const downloadExpenseExcel = async (req, res) => {
    try {
        const userId = req.user.id;
        const expense = await expenseModel.find({ user: userId }).sort({ date: -1 });

        const workbook = new excel.Workbook();
        const worksheet = workbook.addWorksheet('Expense');
        
        // Define Excel Columns
        worksheet.columns = [
            { header: 'Date', key: 'date', width: 15 },
            { header: 'Description', key: 'description', width: 30 },
            { header: 'Category', key: 'category', width: 20 },
            { header: 'Amount', key: 'amount', width: 15 }
        ];

        // Add Data Rows
        expense.forEach(exp => {
            worksheet.addRow({
                date: exp.date.toLocaleDateString(),
                description: exp.description,
                category: exp.category,
                amount: exp.amount
            });
        });

        // Set Headers for Download
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=expense_details.xlsx');

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};