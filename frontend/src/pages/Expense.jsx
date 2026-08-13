import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useOutletContext } from "react-router-dom";
import {
  Plus,
  Download,
  Eye,
  Calendar,
  TrendingDown,
  Filter,
  BarChart2,
  IndianRupeeIcon,
  DollarSign,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import axios from "axios";
import { exportToExcel } from "../utils/exportUtils";
import FinancialCard from "../components/FinancialCard";
import TimeFrameSelector from "../components/TimeFrame";
import TransactionItem from "../components/TransactionItem";
import AddTransactionModal from "../components/Add";
import { getTimeFrameRange, generateChartPoints } from "../components/Helpers";
import { CATEGORY_ICONS } from "../assets/color";
import { expensePageStyles as styles } from "../assets/dummyStyles";

const API_BASE = "http://localhost:4000/api";

// Helps in converting date to ISO time
function toIsoWithClientTime(dateValue) {
  if (!dateValue) {
    return new Date().toISOString();
  }

  if (typeof dateValue === "string" && dateValue.length === 10) {
    const now = new Date();
    const hhmmss = now.toTimeString().slice(0, 8);
    const combined = new Date(`${dateValue}T${hhmmss}`);
    return combined.toISOString();
  }

  try {
    return new Date(dateValue).toISOString();
  } catch (err) {
    return new Date().toISOString();
  }
}

// Sub-component: Expense Chart
const ExpenseChart = ({ chartData, timeFrame, timeFrameRange, handleExport }) => (
  <div className={styles.chartContainer}>
    <div className={styles.chartHeader}>
      <h3 className={styles.chartTitle}>
        <BarChart2 className="w-6 h-6 text-orange-500" />
        {timeFrame === "daily"
          ? "Hourly"
          : timeFrame === "yearly"
          ? "Monthly"
          : "Daily"}{" "}
        Expense Trends
        <span className="text-sm text-gray-500 font-normal">
          {" "}
          ({timeFrameRange.label})
        </span>
      </h3>

      <button onClick={handleExport} className={styles.chartExportButton}>
        <Download size={18} /> Export Data
      </button>
    </div>

    <div className={styles.chartHeight}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
        >
          <defs>
            <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ff9800" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#ff9800" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#6b7280", fontSize: 12 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#6b7280", fontSize: 12 }}
            width={50}
            tickFormatter={(value) => `₹${value.toLocaleString()}`}
          />
          <Tooltip
            formatter={(value) => [
              `₹${Math.round(value).toLocaleString()}`,
              "Expense",
            ]}
            contentStyle={styles.tooltipContent}
          />
          <Area
            type="monotone"
            dataKey="expense"
            stroke="#ff9800"
            fill="url(#expenseGradient)"
            strokeWidth={2}
            activeDot={{ r: 6, fill: "#ff9800" }}
          />
          {chartData.map(
            (point, index) =>
              point.isCurrent && (
                <ReferenceLine
                  key={index}
                  x={point.label}
                  stroke="#ff5722"
                  strokeWidth={2}
                  strokeDasharray="3 3"
                />
              )
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </div>
);

// Sub-component: Filter Section
const FilterSection = ({ filter, setFilter, handleExport }) => (
  <div className="flex flex-col sm:flex-row gap-2 md:gap-3 w-full sm:w-auto">
    <div className="relative w-full sm:w-auto">
      <select
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className={styles.filterSelect}
      >
        <option value="all">All Transactions</option>
        <option value="month">This Month</option>
        <option value="year">This Year</option>
        <option value="Food">Food</option>
        <option value="Housing">Housing</option>
        <option value="Transport">Transport</option>
        <option value="Shopping">Shopping</option>
        <option value="Entertainment">Entertainment</option>
        <option value="Utilities">Utilities</option>
        <option value="Healthcare">Healthcare</option>
        <option value="Other">Other</option>
      </select>
      <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
    </div>

    <button onClick={handleExport} className={styles.exportButton}>
      <Download size={18} /> Export
    </button>
  </div>
);

const Expense = () => {
  const {
    transactions: outletTransactions = [],
    timeFrame = "monthly",
    setTimeFrame = () => {},
    refreshTransactions,
  } = useOutletContext();

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  
  const [overview, setOverview] = useState({
    totalExpense: 0,
    averageExpense: 0,
    numberOfTransactions: 0,
    recentTransactions: [],
    range: "monthly",
  });
  
  const [newTransaction, setNewTransaction] = useState({
    date: new Date().toISOString().split("T")[0],
    description: "",
    amount: "",
    type: "expense",
    category: "Food",
  });
  
  const [editForm, setEditForm] = useState({
    description: "",
    amount: "",
    category: "Food",
    date: new Date().toISOString().split("T")[0],
  });

  // To get the token from localstorage
  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const timeFrameRange = useMemo(
    () => getTimeFrameRange(timeFrame, null),
    [timeFrame]
  );
  
  const chartPoints = useMemo(
    () => generateChartPoints(timeFrame, timeFrameRange),
    [timeFrame, timeFrameRange]
  );

  // Function to check if a date is within a range
  const isDateInRange = useCallback((date, start, end) => {
    const transactionDate = new Date(date);
    const startDate = new Date(start);
    const endDate = new Date(end);

    transactionDate.setHours(0, 0, 0, 0);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    return transactionDate >= startDate && transactionDate <= endDate;
  }, []);

  // Filter transaction coming from outletcontext
  const expenseTransactions = useMemo(
    () =>
      (outletTransactions || [])
        .filter((t) => t.type === "expense")
        .sort((a, b) => new Date(b.date) - new Date(a.date)),
    [outletTransactions]
  );

  // Filter by time frame
  const timeFrameTransactions = useMemo(
    () =>
      expenseTransactions.filter((t) =>
        isDateInRange(t.date, timeFrameRange.start, timeFrameRange.end)
      ),
    [expenseTransactions, timeFrameRange, isDateInRange]
  );

  // Apply additional filters
  const filteredTransactions = useMemo(() => {
    if (filter === "all") return timeFrameTransactions;

    return timeFrameTransactions.filter((t) => {
      if (filter === "month" || filter === "year") {
        const transDate = new Date(t.date);
        if (filter === "month") {
          return (
            transDate.getMonth() === timeFrameRange.start.getMonth() &&
            transDate.getFullYear() === timeFrameRange.start.getFullYear()
          );
        }
        if (filter === "year") {
          return transDate.getFullYear() === timeFrameRange.start.getFullYear();
        }
      }
      return t.category.toLowerCase() === filter.toLowerCase();
    });
  }, [timeFrameTransactions, filter, timeFrameRange]);

  // Chart Data preparation
  const chartData = useMemo(() => {
    const data = chartPoints.map((point) => ({ ...point, expense: 0 }));

    filteredTransactions.forEach((transaction) => {
      const transDate = new Date(transaction.date);
      const point = data.find((d) =>
        timeFrame === "daily"
          ? d.hour === transDate.getHours()
          : timeFrame === "yearly"
          ? d.date.getMonth() === transDate.getMonth()
          : d.date.getDate() === transDate.getDate() &&
            d.date.getMonth() === transDate.getMonth()
      );
      point && (point.expense += Math.round(Number(transaction.amount)));
    });

    return data;
  }, [filteredTransactions, chartPoints, timeFrame]);

  // Fetch the overview from the server side
  const fetchOverview = useCallback(
    async (range = timeFrame ?? "monthly") => {
      try {
        const res = await axios.get(`${API_BASE}/expense/overview`, {
          headers: getAuthHeaders(),
          params: { range },
        });

        if (res.data?.success) {
          const payload = res.data.data ?? {};
          setOverview({
            totalExpense: payload.totalExpense ?? 0,
            averageExpense: payload.averageExpense ?? 0,
            numberOfTransactions: payload.numberOfTransactions ?? 0,
            recentTransactions: payload.recentTransactions ?? [],
            range: payload.range ?? range,
          });
        }
      } catch (err) {
        console.error("Failed to fetch expense overview:", err);
      }
    },
    [timeFrame, getAuthHeaders]
  );

  useEffect(() => {
    fetchOverview(timeFrame ?? "monthly");
  }, [fetchOverview, timeFrame]);

  // Derived Statistics
  const totalExpense = useMemo(
    () =>
      overview.totalExpense ??
      filteredTransactions.reduce(
        (sum, t) => sum + Math.round(Number(t.amount || 0)),
        0
      ),
    [overview.totalExpense, filteredTransactions]
  );

  const averageExpense = useMemo(
    () =>
      overview.averageExpense
        ? Math.round(overview.averageExpense)
        : filteredTransactions.length
        ? Math.round(
            filteredTransactions.reduce(
              (s, t) => s + Math.round(Number(t.amount || 0)),
              0
            ) / filteredTransactions.length
          )
        : 0,
    [overview.averageExpense, filteredTransactions]
  );

  const transactionsCount = useMemo(
    () => overview.numberOfTransactions ?? filteredTransactions.length,
    [overview.numberOfTransactions, filteredTransactions]
  );

  // To add an expense transaction
  const handleAddTransaction = useCallback(async () => {
    if (!newTransaction.description || !newTransaction.amount) return;

    try {
      setLoading(true);

      const payload = {
        description: newTransaction.description.trim(),
        amount: parseFloat(newTransaction.amount),
        category: newTransaction.category,
        date: toIsoWithClientTime(newTransaction.date),
      };

      await axios.post(`${API_BASE}/expense/add`, payload, {
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      });
      
      await refreshTransactions();
      await fetchOverview(timeFrame ?? "monthly");

      setNewTransaction({
        date: new Date().toISOString().split("T")[0],
        description: "",
        amount: "",
        type: "expense",
        category: "Food",
      });
      setShowModal(false);
    } catch (err) {
      console.error("Add expense error:", err);
      const serverMsg = err?.response?.data?.message;
      alert(serverMsg || "Server error while adding expense.");
    } finally {
      setLoading(false);
    }
  }, [
    newTransaction,
    getAuthHeaders,
    refreshTransactions,
    fetchOverview,
    timeFrame,
  ]);

  // To update an expense transaction
  const handleEditTransaction = useCallback(async () => {
    if (!editingId || !editForm.description || !editForm.amount) return;

    try {
      setLoading(true);

      const payload = {
        description: editForm.description.trim(),
        amount: parseFloat(editForm.amount),
        category: editForm.category,
        date: toIsoWithClientTime(editForm.date),
      };

      await axios.put(`${API_BASE}/expense/update/${editingId}`, payload, {
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      });

      await refreshTransactions();
      await fetchOverview(timeFrame ?? "monthly");

      setEditingId(null);
    } catch (err) {
      console.error("Update expense error:", err);
      const serverMsg = err?.response?.data?.message;
      alert(serverMsg || "Server error while updating expense.");
    } finally {
      setLoading(false);
    }
  }, [
    editingId,
    editForm,
    getAuthHeaders,
    refreshTransactions,
    fetchOverview,
    timeFrame,
  ]);

  // To delete an expense transaction
  const handleDeleteTransaction = useCallback(
    async (id) => {
      if (!id) return;
      if (!window.confirm("Are you sure you want to delete this expense?"))
        return;

      try {
        setLoading(true);
        await axios.delete(`${API_BASE}/expense/delete/${id}`, {
          headers: getAuthHeaders(),
        });

        await refreshTransactions();
        await fetchOverview(timeFrame ?? "monthly");
      } catch (err) {
        console.error("Delete expense error:", err);
        const serverMsg = err?.response?.data?.message;
        alert(serverMsg || "Server error while deleting expense.");
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders, refreshTransactions, fetchOverview, timeFrame]
  );

  // To download the excel file of the transactions   
  const handleExport = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/expense/downloadexcel`, {
        headers: getAuthHeaders(),
        responseType: "blob",
      });

      const blob = new Blob([res.data], {
        type: res.headers["content-type"] || "application/octet-stream",
      });
      const disposition = res.headers["content-disposition"];
      let filename = "expense_details.xlsx";
      if (disposition) {
        const match = disposition.match(/filename="?(.+)"?/);
        if (match && match[1]) filename = match[1];
      }
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Export error:", err);
      try {
        const exportData = filteredTransactions.map((t) => ({
          Date: new Date(t.date).toLocaleDateString(),
          Description: t.description,
          Category: t.category,
          Amount: t.amount,
          Type: "Expense",
        }));
        exportToExcel(
          exportData,
          `expenses_${new Date().toISOString().slice(0, 10)}`
        );
      } catch (e) {
        console.error("Fallback export failed:", e);
        alert("Failed to export data.");
      }
    }
  }, [getAuthHeaders, filteredTransactions]);

  return (
    <div className={styles.container}>
      <div className={styles.headerCard}>
        <div className={styles.headerContainer}>
          <div>
            <h1 className={styles.headerTitle}>Expense Overview</h1>
            <p className={styles.headerSubtitle}>
              Track and manage your expenses
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className={styles.addButton}
            disabled={loading}
          >
            <Plus size={20} /> {loading ? "Processing..." : "Add Expense"}
          </button>
        </div>

        <div className={styles.timeframePositioning}>
          <TimeFrameSelector
            timeFrame={timeFrame}
            setTimeFrame={setTimeFrame}
            options={["daily", "weekly", "monthly", "yearly"]}
            color="orange"
          />
        </div>
      </div>

      <div className={styles.cardsGrid}>
        <FinancialCard
          icon={
            <div className={styles.iconOrange}>
              <IndianRupeeIcon className={`w-5 h-5 ${styles.textOrange}`} />
            </div>
          }
          label="Total Expenses"
          value={`₹${Number(totalExpense || 0).toLocaleString()}`}
          additionalContent={
            <div className="mt-2 text-xs text-gray-500 flex items-center">
              <Calendar className="w-3 h-3 mr-1" /> {timeFrameRange.label}
            </div>
          }
          borderColor={styles.borderOrange}
        />

        <FinancialCard
          icon={
            <div className={styles.iconAmber}>
              <BarChart2 className={`w-5 h-5 ${styles.textAmber}`} />
            </div>
          }
          label="Average Expense"
          value={`₹${Number(averageExpense || 0).toLocaleString()}`}
          additionalContent={
            <div className="mt-2 text-xs text-gray-500 flex items-center">
              <Calendar className="w-3 h-3 mr-1" /> {transactionsCount} transactions
            </div>
          }
          borderColor={styles.borderAmber}
        />

        <FinancialCard
          icon={
            <div className={styles.iconYellow}>
              <TrendingDown className={`w-5 h-5 ${styles.textYellow}`} />
            </div>
          }
          label="Transactions"
          value={transactionsCount}
          additionalContent={
            <div className="mt-2 text-xs text-gray-500 flex items-center">
              <Calendar className="w-3 h-3 mr-1" />
              {filter === "all" ? "All records" : "Filtered records"}
            </div>
          }
          borderColor={styles.borderYellow}
        />
      </div>

      <ExpenseChart
        chartData={chartData}
        timeFrame={timeFrame}
        timeFrameRange={timeFrameRange}
        handleExport={handleExport}
      />

      <div className={styles.transactionsContainer}>
        <div className={styles.transactionsHeader}>
          <h3 className={styles.transactionsTitle}>
            <IndianRupeeIcon className="w-6 h-6 -mx-1.5 lg:-mx-2 md:mx-0 text-orange-500" />
            Expense Transactions
            <span className="text-sm text-gray-500 font-normal">
              {" "}
              ({timeFrameRange.label})
            </span>
          </h3>

          <FilterSection
            filter={filter}
            setFilter={setFilter}
            handleExport={handleExport}
          />
        </div>

        <div className={styles.transactionsList}>
          {filteredTransactions
            .slice(0, showAll ? filteredTransactions.length : 8)
            .map((transaction) => (
              <TransactionItem
                key={transaction.id}
                transaction={transaction}
                isEditing={editingId === transaction.id}
                editForm={editForm}
                setEditForm={setEditForm}
                onSave={handleEditTransaction}
                onCancel={() => setEditingId(null)}
                onDelete={handleDeleteTransaction}
                type="expense"
                categoryIcons={CATEGORY_ICONS}
                setEditingId={setEditingId}
                containerClass={styles.transactionItemContainer}
                amountClass={styles.transactionAmount}
                iconClass={styles.transactionIcon}
              />
            ))}

          {!showAll && filteredTransactions.length > 8 && (
            <button
              onClick={() => setShowAll(true)}
              className={styles.viewAllButton}
            >
              <Eye size={18} /> View All {filteredTransactions.length} Transactions
            </button>
          )}

          {filteredTransactions.length === 0 && (
            <div className={styles.emptyState}>
              <div className={styles.emptyStateIcon}>
                <IndianRupeeIcon className="w-8 h-8 text-orange-400" />
              </div>
              <p className={styles.emptyStateText}>
                No expense transactions found
              </p>
              <p className={styles.emptyStateSubtext}>
                {filter === "all"
                  ? "You haven't recorded any expenses yet"
                  : `No ${filter} transactions found`}
              </p>
              <button
                onClick={() => setShowModal(true)}
                className={styles.addButton}
              >
                <Plus size={20} /> Add Expense
              </button>
            </div>
          )}
        </div>
      </div>

      <AddTransactionModal
        showModal={showModal}
        setShowModal={setShowModal}
        newTransaction={newTransaction}
        setNewTransaction={setNewTransaction}
        handleAddTransaction={handleAddTransaction}
        loading={loading}
        type="expense"
        title="Add New Expense"
        buttonText="Add Expense"
        categories={[
          "Food",
          "Housing",
          "Transport",
          "Shopping",
          "Entertainment",
          "Utilities",
          "Healthcare",
          "Other",
        ]}
        color="orange"
      />
    </div>
  );
};

export default Expense;