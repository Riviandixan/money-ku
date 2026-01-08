import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  subDays,
} from "date-fns";

// Calculate total balance from all wallets
export const calculateTotalBalance = (wallets) => {
  return wallets.reduce((total, wallet) => total + (wallet.balance || 0), 0);
};

// Calculate total for a specific wallet type
export const calculateBalanceByType = (wallets, type) => {
  return wallets
    .filter((wallet) => wallet.type === type)
    .reduce((total, wallet) => total + (wallet.balance || 0), 0);
};

// Filter transactions by date range
export const filterTransactionsByDateRange = (
  transactions,
  startDate,
  endDate
) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  return transactions.filter((transaction) => {
    const transactionDate = new Date(transaction.date);
    return transactionDate >= start && transactionDate <= end;
  });
};

// Get date range presets
export const getDateRangePreset = (preset) => {
  const now = new Date();

  switch (preset) {
    case "today":
      return {
        startDate: new Date(now.setHours(0, 0, 0, 0)),
        endDate: new Date(now.setHours(23, 59, 59, 999)),
      };

    case "yesterday":
      const yesterday = subDays(now, 1);
      return {
        startDate: new Date(yesterday.setHours(0, 0, 0, 0)),
        endDate: new Date(yesterday.setHours(23, 59, 59, 999)),
      };

    case "thisWeek":
      return {
        startDate: startOfWeek(now, { weekStartsOn: 1 }),
        endDate: endOfWeek(now, { weekStartsOn: 1 }),
      };

    case "thisMonth":
      return {
        startDate: startOfMonth(now),
        endDate: endOfMonth(now),
      };

    case "last7Days":
      return {
        startDate: subDays(now, 6),
        endDate: now,
      };

    case "last30Days":
      return {
        startDate: subDays(now, 29),
        endDate: now,
      };

    default:
      return {
        startDate: startOfMonth(now),
        endDate: endOfMonth(now),
      };
  }
};

// Calculate income and expense totals
export const calculateTotals = (transactions) => {
  return transactions.reduce(
    (acc, transaction) => {
      if (transaction.type === "income") {
        acc.income += transaction.amount;
      } else if (transaction.type === "expense") {
        acc.expense += transaction.amount;
      }
      return acc;
    },
    { income: 0, expense: 0 }
  );
};

// Group transactions by wallet
export const groupTransactionsByWallet = (transactions, wallets) => {
  const grouped = {};

  transactions.forEach((transaction) => {
    const walletId = transaction.walletId || transaction.fromWalletId;
    if (walletId) {
      if (!grouped[walletId]) {
        const wallet = wallets.find((w) => w.id === walletId);
        grouped[walletId] = {
          walletName: wallet?.name || "Unknown",
          transactions: [],
          total: 0,
        };
      }
      grouped[walletId].transactions.push(transaction);
      if (transaction.type === "expense") {
        grouped[walletId].total += transaction.amount;
      }
    }
  });

  return grouped;
};

// Group transactions by date
export const groupTransactionsByDate = (transactions) => {
  const grouped = {};

  transactions.forEach((transaction) => {
    const date = new Date(transaction.date).toDateString();
    if (!grouped[date]) {
      grouped[date] = [];
    }
    grouped[date].push(transaction);
  });

  return grouped;
};

// Generate chart data for expense by wallet
export const generateExpenseByWalletData = (transactions, wallets) => {
  const grouped = groupTransactionsByWallet(
    transactions.filter((t) => t.type === "expense"),
    wallets
  );

  const labels = [];
  const data = [];
  const colors = [
    "#8b5cf6",
    "#3b82f6",
    "#ec4899",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#06b6d4",
    "#8b5cf6",
    "#6366f1",
    "#a855f7",
  ];

  Object.entries(grouped).forEach(([walletId, info], index) => {
    labels.push(info.walletName);
    data.push(info.total);
  });

  return {
    labels,
    datasets: [
      {
        data,
        backgroundColor: colors.slice(0, labels.length),
        borderWidth: 0,
      },
    ],
  };
};

// Generate chart data for monthly income vs expense
export const generateMonthlyTrendData = (transactions) => {
  const monthlyData = {};

  transactions.forEach((transaction) => {
    const date = new Date(transaction.date);
    const monthKey = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}`;

    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { income: 0, expense: 0 };
    }

    if (transaction.type === "income") {
      monthlyData[monthKey].income += transaction.amount;
    } else if (transaction.type === "expense") {
      monthlyData[monthKey].expense += transaction.amount;
    }
  });

  const sortedMonths = Object.keys(monthlyData).sort();
  const labels = sortedMonths.map((month) => {
    const [year, monthNum] = month.split("-");
    const date = new Date(year, parseInt(monthNum) - 1);
    return date.toLocaleDateString("id-ID", {
      month: "short",
      year: "numeric",
    });
  });

  const incomeData = sortedMonths.map((month) => monthlyData[month].income);
  const expenseData = sortedMonths.map((month) => monthlyData[month].expense);

  return {
    labels,
    datasets: [
      {
        label: "Pemasukan",
        data: incomeData,
        backgroundColor: "rgba(16, 185, 129, 0.8)",
        borderColor: "#10b981",
        borderWidth: 2,
      },
      {
        label: "Pengeluaran",
        data: expenseData,
        backgroundColor: "rgba(239, 68, 68, 0.8)",
        borderColor: "#ef4444",
        borderWidth: 2,
      },
    ],
  };
};
