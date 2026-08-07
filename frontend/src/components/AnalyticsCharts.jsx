import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import { CATEGORY_META, formatCurrency, convertCurrency } from '../utils/formatters';
import { Calendar, TrendingUp, TrendingDown, DollarSign, PieChart as PieIcon, BarChart3, Filter } from 'lucide-react';

// Register ChartJS modules
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function AnalyticsCharts({ transactions = [], currency, darkMode }) {
  const [analysisType, setAnalysisType] = useState('monthly'); // 'monthly' or 'yearly'
  const [selectedYear, setSelectedYear] = useState('2026');
  const [selectedMonth, setSelectedMonth] = useState('ALL'); // 'ALL' or '01'..'12'

  // Comprehensive list of years (2020 through 2030 + any transaction years)
  const currentYrNum = new Date().getFullYear(); // 2026
  const baseYears = Array.from({ length: 11 }, (_, i) => String(2020 + i)); // 2020 to 2030
  const txYears = transactions.map(t => (t.transactionDate || '2026-08-01').substring(0, 4));
  const availableYears = Array.from(new Set([...baseYears, ...txYears])).sort().reverse();

  // Filter transactions according to selected Year & Month
  const filteredTransactions = transactions.filter(t => {
    const d = t.transactionDate || '2026-08-01';
    const yr = d.substring(0, 4);
    const mo = d.substring(5, 7);

    if (selectedYear !== 'ALL' && yr !== selectedYear) return false;
    if (analysisType === 'monthly' && selectedMonth !== 'ALL' && mo !== selectedMonth) return false;
    return true;
  });

  // Calculate totals in selected display currency
  let totalIncome = 0;
  let totalExpense = 0;
  const categoryTotals = {};

  filteredTransactions.forEach(t => {
    const converted = convertCurrency(t.amount, t.currency || 'USD', currency);
    if (t.type === 'INCOME') {
      totalIncome += converted;
    } else if (t.type === 'EXPENSE') {
      totalExpense += converted;
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + converted;
    }
  });

  const netSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? ((netSavings / totalIncome) * 100).toFixed(1) : '0.0';

  // 1. MONTHLY BREAKDOWN BAR CHART (Jan - Dec for selected year)
  const monthlyData = Array(12).fill(0).map(() => ({ income: 0, expense: 0 }));
  
  transactions.forEach(t => {
    const d = t.transactionDate || '2026-08-01';
    const yr = d.substring(0, 4);
    const moIndex = parseInt(d.substring(5, 7), 10) - 1;

    if ((selectedYear === 'ALL' || yr === selectedYear) && moIndex >= 0 && moIndex < 12) {
      const converted = convertCurrency(t.amount, t.currency || 'USD', currency);
      if (t.type === 'INCOME') monthlyData[moIndex].income += converted;
      if (t.type === 'EXPENSE') monthlyData[moIndex].expense += converted;
    }
  });

  const barChartConfig = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Income',
        data: monthlyData.map(m => m.income),
        backgroundColor: 'rgba(16, 185, 129, 0.85)',
        borderRadius: 6
      },
      {
        label: 'Expenses',
        data: monthlyData.map(m => m.expense),
        backgroundColor: 'rgba(239, 68, 68, 0.85)',
        borderRadius: 6
      }
    ]
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: darkMode ? '#cbd5e1' : '#475569',
          font: { family: 'Plus Jakarta Sans', weight: 600 }
        }
      },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${ctx.dataset.label}: ${formatCurrency(ctx.raw, currency, currency)}`
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: darkMode ? '#64748b' : '#94a3b8' }
      },
      y: {
        grid: { color: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' },
        ticks: { color: darkMode ? '#64748b' : '#94a3b8' }
      }
    }
  };

  // 2. CATEGORY DOUGHNUT CHART
  const categories = Object.keys(categoryTotals);
  const doughnutLabels = categories.map(cat => CATEGORY_META[cat]?.name || cat);
  const doughnutData = categories.map(cat => categoryTotals[cat]);
  const doughnutColors = categories.map(cat => CATEGORY_META[cat]?.color || '#64748b');

  const doughnutChartConfig = {
    labels: doughnutLabels,
    datasets: [
      {
        data: doughnutData,
        backgroundColor: doughnutColors,
        borderWidth: 2,
        borderColor: darkMode ? '#171f2e' : '#ffffff',
        hoverOffset: 6
      }
    ]
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => {
            const val = context.raw;
            const pct = totalExpense > 0 ? ((val / totalExpense) * 100).toFixed(1) : 0;
            return ` ${context.label}: ${formatCurrency(val, currency, currency)} (${pct}%)`;
          }
        }
      }
    },
    cutout: '72%'
  };

  // 3. DAILY CASHFLOW TREND LINE CHART
  const dateTotals = {};
  filteredTransactions.forEach(t => {
    const d = t.transactionDate || '2026-08-01';
    if (!dateTotals[d]) dateTotals[d] = { income: 0, expense: 0 };
    const converted = convertCurrency(t.amount, t.currency || 'USD', currency);
    if (t.type === 'INCOME') dateTotals[d].income += converted;
    if (t.type === 'EXPENSE') dateTotals[d].expense += converted;
  });

  const sortedDates = Object.keys(dateTotals).sort();
  const lineLabels = sortedDates.map(d => d.substring(5)); // MM-DD
  const incomeLineData = sortedDates.map(d => dateTotals[d].income);
  const expenseLineData = sortedDates.map(d => dateTotals[d].expense);

  const lineChartConfig = {
    labels: lineLabels,
    datasets: [
      {
        label: 'Inflow',
        data: incomeLineData,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.12)',
        fill: true,
        tension: 0.35,
        borderWidth: 2.5,
        pointRadius: 3
      },
      {
        label: 'Outflow',
        data: expenseLineData,
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.12)',
        fill: true,
        tension: 0.35,
        borderWidth: 2.5,
        pointRadius: 3
      }
    ]
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: darkMode ? '#cbd5e1' : '#475569',
          font: { family: 'Plus Jakarta Sans', weight: 600 }
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: darkMode ? '#64748b' : '#94a3b8' }
      },
      y: {
        grid: { color: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' },
        ticks: { color: darkMode ? '#64748b' : '#94a3b8' }
      }
    }
  };

  return (
    <div className="flex flex-col gap-6" style={{ marginBottom: '1.5rem' }}>

      {/* Control Header & Filters */}
      <div className="glass-card flex flex-col md:flex-row items-start md:items-center justify-between gap-4" style={{ padding: '1.25rem 1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, display: 'flex', items: 'center', gap: '0.5rem' }}>
            <BarChart3 size={20} className="text-primary" />
            <span>Monthly & Yearly Financial Analysis</span>
          </h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
            Multi-period expense breakdown, income trends, and cash flow performance
          </p>
        </div>

        {/* View Mode & Timeframe Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Analysis View Toggle */}
          <div className="segmented-control" style={{ backgroundColor: 'var(--bg-secondary)', padding: '2px', borderRadius: 'var(--radius-md)', display: 'flex' }}>
            <button
              className={`btn btn-sm ${analysisType === 'monthly' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ border: 'none', padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
              onClick={() => setAnalysisType('monthly')}
            >
              📅 Monthly Analysis
            </button>
            <button
              className={`btn btn-sm ${analysisType === 'yearly' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ border: 'none', padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
              onClick={() => setAnalysisType('yearly')}
            >
              📆 Yearly Analysis
            </button>
          </div>

          {/* Year Filter */}
          <select
            className="form-control"
            style={{ width: 'auto', padding: '0.35rem 0.6rem', fontSize: '0.8rem', fontWeight: 600 }}
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            <option value="ALL">All Years</option>
            {availableYears.map(yr => (
              <option key={yr} value={yr}>Year {yr}</option>
            ))}
          </select>

          {/* Month Filter (for Monthly mode) */}
          {analysisType === 'monthly' && (
            <select
              className="form-control"
              style={{ width: 'auto', padding: '0.35rem 0.6rem', fontSize: '0.8rem', fontWeight: 600 }}
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              <option value="ALL">All 12 Months</option>
              {MONTH_NAMES.map((m, idx) => {
                const val = String(idx + 1).padStart(2, '0');
                return <option key={val} value={val}>{m}</option>;
              })}
            </select>
          )}
        </div>
      </div>

      {/* Analysis Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div className="flex items-center justify-between" style={{ marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>TOTAL INFLOW</span>
            <div style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success)', padding: '4px', borderRadius: '50%' }}>
              <TrendingUp size={14} />
            </div>
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--success)' }}>
            {formatCurrency(totalIncome, currency, currency)}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {analysisType === 'monthly' ? (selectedMonth === 'ALL' ? 'Full Year Income' : 'Selected Month') : 'Total Income'}
          </span>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div className="flex items-center justify-between" style={{ marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>TOTAL OUTFLOW</span>
            <div style={{ backgroundColor: 'var(--danger-bg)', color: 'var(--danger)', padding: '4px', borderRadius: '50%' }}>
              <TrendingDown size={14} />
            </div>
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--danger)' }}>
            {formatCurrency(totalExpense, currency, currency)}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {analysisType === 'monthly' ? (selectedMonth === 'ALL' ? 'Full Year Expenses' : 'Selected Month') : 'Total Expenses'}
          </span>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div className="flex items-center justify-between" style={{ marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>NET SAVINGS</span>
            <div style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)', padding: '4px', borderRadius: '50%' }}>
              <DollarSign size={14} />
            </div>
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: netSavings >= 0 ? 'var(--primary)' : 'var(--danger)' }}>
            {formatCurrency(netSavings, currency, currency)}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Inflow minus Outflow
          </span>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div className="flex items-center justify-between" style={{ marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>SAVINGS RATE</span>
            <div style={{ backgroundColor: 'var(--info-bg)', color: 'var(--info)', padding: '4px', borderRadius: '50%' }}>
              <PieIcon size={14} />
            </div>
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--info)' }}>
            {savingsRate}%
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Retained Earnings %
          </span>
        </div>
      </div>

      {/* Main Analysis Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Month-by-Month Bar Chart / Daily Trend */}
        <div className="glass-card lg:col-span-2" style={{ padding: '1.5rem' }}>
          <div className="flex items-center justify-between" style={{ marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
              {analysisType === 'monthly' ? `12-Month Cashflow Breakdown (${selectedYear})` : `Daily Cashflow Activity`}
            </h3>
          </div>
          <div style={{ height: '290px', position: 'relative' }}>
            {analysisType === 'monthly' ? (
              <Bar data={barChartConfig} options={barOptions} />
            ) : (
              <Line data={lineChartConfig} options={lineOptions} />
            )}
          </div>
        </div>

        {/* Category Expense Breakdown Doughnut */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>
            Category Expense Share
          </h3>
          <div style={{ height: '190px', position: 'relative', marginBottom: '1rem' }}>
            <Doughnut data={doughnutChartConfig} options={doughnutOptions} />
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              pointerEvents: 'none'
            }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Total Share</span>
              <span style={{ fontSize: '1rem', fontWeight: 800 }}>{formatCurrency(totalExpense, currency, currency)}</span>
            </div>
          </div>

          {/* Category List */}
          <div className="flex flex-col gap-2" style={{ maxHeight: '130px', overflowY: 'auto' }}>
            {categories.map(cat => {
              const meta = CATEGORY_META[cat] || { name: cat, icon: '📦', color: '#64748b' };
              const amt = categoryTotals[cat];
              const pct = totalExpense > 0 ? ((amt / totalExpense) * 100).toFixed(1) : 0;
              return (
                <div key={cat} className="flex items-center justify-between" style={{ fontSize: '0.8125rem' }}>
                  <div className="flex items-center gap-2">
                    <span style={{
                      width: '10px', height: '10px', borderRadius: '50%', backgroundColor: meta.color, display: 'inline-block'
                    }} />
                    <span>{meta.icon} {meta.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span style={{ fontWeight: 600 }}>{formatCurrency(amt, currency, currency)}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({pct}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
