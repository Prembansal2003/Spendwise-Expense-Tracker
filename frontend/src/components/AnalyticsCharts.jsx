import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import { CATEGORY_META, formatCurrency } from '../utils/formatters';

// Register ChartJS modules
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function AnalyticsCharts({ transactions, currency, darkMode }) {
  const expenses = transactions.filter(t => t.type === 'EXPENSE');

  // Compute category totals
  const categoryTotals = {};
  expenses.forEach(t => {
    categoryTotals[t.category] = (categoryTotals[t.category] || 0) + Number(t.amount || 0);
  });

  const totalExpenseSum = Object.values(categoryTotals).reduce((a, b) => a + b, 0);

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
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const val = context.raw;
            const pct = totalExpenseSum > 0 ? ((val / totalExpenseSum) * 100).toFixed(1) : 0;
            return ` ${context.label}: ${formatCurrency(val, currency)} (${pct}%)`;
          }
        }
      }
    },
    cutout: '72%'
  };

  // Compute Daily Trend Data (Sorted by Date)
  const dateTotals = {};
  transactions.forEach(t => {
    const d = t.transactionDate || '2026-08-01';
    if (!dateTotals[d]) dateTotals[d] = { income: 0, expense: 0 };
    if (t.type === 'INCOME') dateTotals[d].income += Number(t.amount || 0);
    if (t.type === 'EXPENSE') dateTotals[d].expense += Number(t.amount || 0);
  });

  const sortedDates = Object.keys(dateTotals).sort();
  const lineLabels = sortedDates.map(d => {
    const parts = d.split('-');
    return `${parts[1]}/${parts[2]}`;
  });

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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" style={{ marginBottom: '1.5rem' }}>
      
      {/* Cashflow Trends Line Chart */}
      <div className="glass-card lg:col-span-2" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>
          Cash Flow & Spending Trends
        </h3>
        <div style={{ height: '280px', position: 'relative' }}>
          <Line data={lineChartConfig} options={lineOptions} />
        </div>
      </div>

      {/* Category Expense Breakdown Doughnut Chart */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>
          Category Expenses
        </h3>
        <div style={{ height: '200px', position: 'relative', marginBottom: '1rem' }}>
          <Doughnut data={doughnutChartConfig} options={doughnutOptions} />
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            pointerEvents: 'none'
          }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Total Outflow</span>
            <span style={{ fontSize: '1.1rem', fontWeight: 800 }}>{formatCurrency(totalExpenseSum, currency)}</span>
          </div>
        </div>

        {/* Custom Category Percentage List */}
        <div className="flex flex-col gap-2" style={{ maxHeight: '120px', overflowY: 'auto' }}>
          {categories.map(cat => {
            const meta = CATEGORY_META[cat] || { name: cat, icon: '📦', color: '#64748b' };
            const amt = categoryTotals[cat];
            const pct = totalExpenseSum > 0 ? ((amt / totalExpenseSum) * 100).toFixed(1) : 0;
            return (
              <div key={cat} className="flex items-center justify-between" style={{ fontSize: '0.8125rem' }}>
                <div className="flex items-center gap-2">
                  <span style={{
                    width: '10px', height: '10px', borderRadius: '50%', backgroundColor: meta.color, display: 'inline-block'
                  }} />
                  <span>{meta.icon} {meta.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span style={{ fontWeight: 600 }}>{formatCurrency(amt, currency)}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({pct}%)</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
