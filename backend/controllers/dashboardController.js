import incomeModel from '../models/incomeModel.js';
import expenseModel from '../models/expenseModel.js';

export const getDashboardOverview = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Fetch all transactions for the logged-in user
        const incomes = await incomeModel.find({ user: userId }).lean();
        const expenses = await expenseModel.find({ user: userId }).lean();

        // Calculate totals
        const totalIncome = incomes.reduce((sum, item) => sum + item.amount, 0);
        const totalExpense = expenses.reduce((sum, item) => sum + item.amount, 0);
        const totalBalance = totalIncome - totalExpense;
        const savingRate = totalIncome > 0 ? ((totalBalance / totalIncome) * 100).toFixed(2) : 0;

        // Merge and sort for recent transactions
        const recentTransactions = [...incomes, ...expenses]
            .sort((a, b) => b.date - a.date)
            .slice(0, 5); // Get the top 5 most recent

        res.status(200).json({
            success: true,
            data: {
                totalIncome,
                totalExpense,
                totalBalance,
                savingRate,
                recentTransactions
            }
        });
    } catch (error) {
        console.error("Dashboard Fetch Error: ", error);
        res.status(500).json({ success: false, message: "Dashboard fetch failed" });
    }
};