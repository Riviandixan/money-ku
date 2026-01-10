import React, { useState, useMemo } from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend, 
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { useTransaction } from '../../context/TransactionContext';
import { startOfMonth, endOfMonth, eachDayOfInterval, format, isSameDay, parseISO } from 'date-fns';
import { formatDateForInput } from '../../utils/formatters';
import { id } from 'date-fns/locale';
import Input from '../../shared/components/Input';
import Card from '../../shared/components/Card';
import './ReportsPage.css';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const ReportsPage = () => {
  const { transactions } = useTransaction();
  const [startDate, setStartDate] = useState(formatDateForInput(startOfMonth(new Date())));
  const [endDate, setEndDate] = useState(formatDateForInput(endOfMonth(new Date())));

  // Helper to filter transactions by current period
  const filteredTransactions = useMemo(() => {
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    
    return transactions.filter(t => {
      const date = parseISO(t.date);
      return date >= start && date <= end;
    });
  }, [transactions, startDate, endDate]);

  // Chart 1: Income vs Expense (Bar Chart) - Last 7 Days
  const barChartData = useMemo(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 6); // Last 7 days

    const days = eachDayOfInterval({ start, end });
    const incomeData = [];
    const expenseData = [];

    days.forEach(day => {
      const dayTransactions = transactions.filter(t => isSameDay(parseISO(t.date), day));
      
      const income = dayTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
        
      const expense = dayTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      incomeData.push(income);
      expenseData.push(expense);
    });

    return {
      labels: days.map(d => format(d, 'EEE', { locale: id })),
      datasets: [
        {
          label: 'Pemasukan',
          data: incomeData,
          backgroundColor: 'rgba(16, 185, 129, 0.7)',
          borderRadius: 4,
        },
        {
          label: 'Pengeluaran',
          data: expenseData,
          backgroundColor: 'rgba(239, 68, 68, 0.7)',
          borderRadius: 4,
        },
      ],
    };
  }, [transactions]);

  // Chart 2: Expense by Category (Doughnut)
  const doughnutChartData = useMemo(() => {
    const expenses = filteredTransactions.filter(t => t.type === 'expense');
    const categories = {};

    expenses.forEach(t => {
      const cat = t.category || 'Lainnya';
      categories[cat] = (categories[cat] || 0) + t.amount;
    });

    return {
      labels: Object.keys(categories),
      datasets: [
        {
          data: Object.values(categories),
          backgroundColor: [
            'rgba(239, 68, 68, 0.7)',
            'rgba(245, 158, 11, 0.7)',
            'rgba(59, 130, 246, 0.7)',
            'rgba(16, 185, 129, 0.7)',
            'rgba(139, 92, 246, 0.7)',
            'rgba(236, 72, 153, 0.7)',
          ],
          borderColor: 'rgba(255, 255, 255, 0.1)',
          borderWidth: 1,
        },
      ],
    };
  }, [filteredTransactions]);

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: '#94a3b8' }
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        padding: 12,
        cornerRadius: 8,
      }
    },
    scales: {
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#94a3b8' }
      },
      x: {
        grid: { display: false },
        ticks: { color: '#94a3b8' }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
        labels: { color: '#94a3b8' }
      }
    }
  };

  return (
    <div className="reports-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Laporan Keuangan</h1>
          <p className="page-subtitle">Analisis pemasukan dan pengeluaran Anda</p>
        </div>
        <div className="report-filters">
          <Input 
            type="date"
            name="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <Input 
            type="date"
            name="endDate"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      <div className="charts-grid">
        <Card className="chart-card large">
          <h3>Arus Kas (7 Hari Terakhir)</h3>
          <div className="chart-container">
            <Bar data={barChartData} options={chartOptions} />
          </div>
        </Card>

        <Card className="chart-card">
          <h3>Pengeluaran per Kategori (Bulan Ini)</h3>
          <div className="chart-container doughnut-container">
            {doughnutChartData.datasets[0].data.length > 0 ? (
              <Doughnut data={doughnutChartData} options={doughnutOptions} />
            ) : (
              <div className="no-data">Belum ada pengeluaran bulan ini</div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ReportsPage;
