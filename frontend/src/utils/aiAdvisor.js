import { CATEGORY_META, formatCurrency, convertCurrency } from './formatters';

/**
 * Perform deep financial analysis on user's transactions and budgets.
 * All amounts are normalized to the active `currency` view using convertCurrency.
 */
export function analyzeFinances(transactions = [], budgets = [], currency = 'USD') {
  const incomeTx = transactions.filter(t => t.type === 'INCOME');
  const expenseTx = transactions.filter(t => t.type === 'EXPENSE');

  // Total Income & Expenses normalized to active currency view
  const totalIncome = incomeTx.reduce((sum, t) => sum + convertCurrency(t.amount, t.currency || 'USD', currency), 0);
  const totalExpense = expenseTx.reduce((sum, t) => sum + convertCurrency(t.amount, t.currency || 'USD', currency), 0);
  const netSavings = totalIncome - totalExpense;

  const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

  // Category Breakdown in active currency
  const categoryTotals = {};
  expenseTx.forEach(t => {
    const amtInCurr = convertCurrency(t.amount, t.currency || 'USD', currency);
    categoryTotals[t.category] = (categoryTotals[t.category] || 0) + amtInCurr;
  });

  // 50/30/20 Rule Categorization
  // Needs: Housing, Utilities, Food, Health, Transport
  // Wants: Entertainment, Shopping, Other
  const needsCategories = ['HOUSING', 'UTILITIES', 'FOOD', 'HEALTH', 'TRANSPORT'];
  const needsSpending = Object.keys(categoryTotals)
    .filter(cat => needsCategories.includes(cat))
    .reduce((sum, cat) => sum + categoryTotals[cat], 0);

  const wantsSpending = Object.keys(categoryTotals)
    .filter(cat => !needsCategories.includes(cat))
    .reduce((sum, cat) => sum + categoryTotals[cat], 0);

  const needsPct = totalIncome > 0 ? (needsSpending / totalIncome) * 100 : 0;
  const wantsPct = totalIncome > 0 ? (wantsSpending / totalIncome) * 100 : 0;

  // Financial Health Score Calculation (0 - 100)
  let healthScore = 50; // Base score

  // Savings Rate Contribution (Max +30)
  if (savingsRate >= 30) healthScore += 30;
  else if (savingsRate >= 20) healthScore += 25;
  else if (savingsRate >= 10) healthScore += 15;
  else if (savingsRate > 0) healthScore += 5;
  else healthScore -= 20;

  // 50/30/20 Needs Compliance (Max +10)
  if (needsPct <= 50 && totalIncome > 0) healthScore += 10;
  else if (needsPct > 70) healthScore -= 10;

  // Budget Compliance Check
  let overBudgetCount = 0;
  let nearCapCount = 0;
  const categoryAlerts = [];

  budgets.forEach(b => {
    const spend = categoryTotals[b.category] || 0;
    const limitInCurr = convertCurrency(b.monthlyLimit, b.currency || 'USD', currency);

    if (limitInCurr > 0) {
      const pct = (spend / limitInCurr) * 100;
      const meta = CATEGORY_META[b.category] || { name: b.category, icon: '📦' };

      if (pct > 100) {
        overBudgetCount++;
        categoryAlerts.push({
          level: 'DANGER',
          text: `🚨 ${meta.icon} ${meta.name} has exceeded cap by ${formatCurrency(spend - limitInCurr, currency, currency)} (${pct.toFixed(0)}% used)`
        });
      } else if (pct >= 80) {
        nearCapCount++;
        categoryAlerts.push({
          level: 'WARNING',
          text: `⚠️ ${meta.icon} ${meta.name} is near cap at ${pct.toFixed(0)}% limit (${formatCurrency(spend, currency, currency)} / ${formatCurrency(limitInCurr, currency, currency)})`
        });
      }
    }
  });

  if (overBudgetCount === 0 && nearCapCount === 0) healthScore += 10;
  else healthScore -= (overBudgetCount * 12 + nearCapCount * 5);

  healthScore = Math.min(Math.max(healthScore, 10), 100);

  // Top spending category
  const sortedCategories = Object.keys(categoryTotals).sort((a, b) => categoryTotals[b] - categoryTotals[a]);
  let topCategory = null;
  if (sortedCategories.length > 0) {
    const topCat = sortedCategories[0];
    const topAmt = categoryTotals[topCat];
    const topMeta = CATEGORY_META[topCat] || { name: topCat, icon: '📦' };
    const pct = totalExpense > 0 ? ((topAmt / totalExpense) * 100).toFixed(1) : 0;
    topCategory = {
      name: topMeta.name,
      icon: topMeta.icon,
      amount: topAmt,
      percentage: pct
    };
  }

  // Actionable AI Advice Items
  const actionPlan = [];
  if (categoryTotals['FOOD'] && categoryTotals['FOOD'] > convertCurrency(250, 'USD', currency)) {
    actionPlan.push(`🍽️ Reduce dining out: Meal prepping 2 extra days/week can save ~${formatCurrency(convertCurrency(100, 'USD', currency), currency)} monthly.`);
  }
  if (categoryTotals['ENTERTAINMENT'] && categoryTotals['ENTERTAINMENT'] > convertCurrency(100, 'USD', currency)) {
    actionPlan.push(`🎬 Subscription Audit: Consolidating active streaming services can save ~${formatCurrency(convertCurrency(35, 'USD', currency), currency)} monthly.`);
  }
  if (needsPct > 50) {
    actionPlan.push(`🏠 Essential Costs High: Essential needs take ${needsPct.toFixed(0)}% of income (ideal is ≤50%). Look into utility optimizations.`);
  }
  if (savingsRate < 20) {
    actionPlan.push(`🛡️ Auto-Savings Goal: Set up an automated ${formatCurrency(convertCurrency(150, 'USD', currency), currency)} transfer to savings on payday.`);
  } else {
    actionPlan.push(`📈 Investment Allocation: You have a healthy ${savingsRate.toFixed(1)}% savings rate! Consider allocating surplus to low-cost index funds.`);
  }

  return {
    healthScore,
    totalIncome,
    totalExpense,
    netSavings,
    savingsRate,
    needsSpending,
    wantsSpending,
    needsPct,
    wantsPct,
    topCategory,
    categoryAlerts,
    actionPlan
  };
}

/**
 * Intelligent Natural Language AI Advisor Assistant query handler.
 */
export function askAiAssistant(question = '', analysis, currency = 'USD') {
  const q = question.toLowerCase().trim();

  if (q.includes('50/30/20') || q.includes('rule') || q.includes('split') || q.includes('ratio')) {
    return `📊 **50/30/20 Budget Breakdown Analysis:**\n\n` +
      `• **Needs (Essentials)**: ${formatCurrency(analysis.needsSpending, currency, currency)} (${analysis.needsPct.toFixed(1)}% of income — Ideal: ≤50%)\n` +
      `• **Wants (Discretionary)**: ${formatCurrency(analysis.wantsSpending, currency, currency)} (${analysis.wantsPct.toFixed(1)}% of income — Ideal: ≤30%)\n` +
      `• **Savings & Investments**: ${formatCurrency(Math.max(0, analysis.netSavings), currency, currency)} (${analysis.savingsRate.toFixed(1)}% of income — Ideal: ≥20%)\n\n` +
      `${analysis.needsPct <= 50 ? '✅ Your essential needs spending is well controlled!' : '⚠️ Essential costs exceed 50% of income. Try optimizing recurring bills.'}`;
  }

  if (q.includes('save') || q.includes('saving') || q.includes('tip') || q.includes('how to')) {
    return `💡 **Smart Actionable Savings Plan:**\n\n` +
      `Current Savings Rate: **${analysis.savingsRate.toFixed(1)}%** (${formatCurrency(analysis.netSavings, currency, currency)}/month)\n\n` +
      `1. ${analysis.actionPlan[0] || 'Track daily micro-purchases.'}\n` +
      `2. ${analysis.actionPlan[1] || 'Set monthly category caps.'}\n` +
      `3. ${analysis.actionPlan[2] || 'Automate savings transfers on payday.'}`;
  }

  if (q.includes('health') || q.includes('score') || q.includes('grade')) {
    return `🏆 **Financial Health Score: ${analysis.healthScore}/100**\n\n` +
      `• Inflow: ${formatCurrency(analysis.totalIncome, currency, currency)}\n` +
      `• Outflow: ${formatCurrency(analysis.totalExpense, currency, currency)}\n` +
      `• Net Buffer: ${formatCurrency(analysis.netSavings, currency, currency)}\n\n` +
      `${analysis.healthScore >= 70 ? '🎉 Outstanding financial discipline! Your cash flow and savings buffers are strong.' : '⚡ To boost your score: reduce discretionary spending and stay under budget caps.'}`;
  }

  if (q.includes('highest') || q.includes('top') || q.includes('most') || q.includes('category')) {
    if (!analysis.topCategory) return `No expense records recorded yet! Add transactions to generate category outflow analytics.`;
    return `📊 **Top Outflow Category:**\n\n` +
      `• **Category**: ${analysis.topCategory.icon} ${analysis.topCategory.name}\n` +
      `• **Total Spent**: ${formatCurrency(analysis.topCategory.amount, currency, currency)}\n` +
      `• **Share of Outflow**: ${analysis.topCategory.percentage}% of total expenses\n\n` +
      `💡 Tip: Capping this category by 10-15% could add ${formatCurrency(analysis.topCategory.amount * 0.15, currency, currency)} to your monthly savings!`;
  }

  if (q.includes('predict') || q.includes('forecast') || q.includes('next month')) {
    const projectedOutflow = analysis.totalExpense * 1.02;
    const projectedSavings = analysis.totalIncome - projectedOutflow;
    return `🔮 **Next Month Financial Forecast:**\n\n` +
      `• Projected Outflow: ~${formatCurrency(projectedOutflow, currency, currency)}\n` +
      `• Projected Savings: ~${formatCurrency(projectedSavings, currency, currency)}\n` +
      `• Forecasted Savings Rate: ~${(analysis.totalIncome > 0 ? (projectedSavings / analysis.totalIncome) * 100 : 0).toFixed(1)}%\n\n` +
      `Maintaining current trends will keep your financial health on target!`;
  }

  if (q.includes('alert') || q.includes('risk') || q.includes('warning') || q.includes('budget')) {
    if (analysis.categoryAlerts.length === 0) {
      return `✅ **All Category Budgets On Track!**\nNo categories are near or over limit. Excellent discipline!`;
    }
    return `⚠️ **Category Budget Status Alerts:**\n\n` +
      analysis.categoryAlerts.map(a => a.text).join('\n');
  }

  return `🤖 **SpendWise AI Summary:**\n\n` +
    `• Monthly Inflow: ${formatCurrency(analysis.totalIncome, currency, currency)}\n` +
    `• Monthly Outflow: ${formatCurrency(analysis.totalExpense, currency, currency)}\n` +
    `• Net Surplus: ${formatCurrency(analysis.netSavings, currency, currency)}\n` +
    `• Savings Rate: ${analysis.savingsRate.toFixed(1)}%\n\n` +
    `How else can I assist your financial planning today? Try asking about **"50/30/20 rule"**, **"top category"**, or **"next month forecast"**!`;
}
