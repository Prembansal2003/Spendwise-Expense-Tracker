import { CATEGORY_META, formatCurrency } from './formatters';

export function analyzeFinances(transactions, budgets, currency = 'USD') {
  const incomeTx = transactions.filter(t => t.type === 'INCOME');
  const expenseTx = transactions.filter(t => t.type === 'EXPENSE');

  const totalIncome = incomeTx.reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const totalExpense = expenseTx.reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const netSavings = totalIncome - totalExpense;

  const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

  // Compute category totals
  const categoryTotals = {};
  expenseTx.forEach(t => {
    categoryTotals[t.category] = (categoryTotals[t.category] || 0) + Number(t.amount || 0);
  });

  // Calculate Health Score (0 - 100)
  let healthScore = 50; // Base score
  if (savingsRate >= 30) healthScore += 30;
  else if (savingsRate >= 15) healthScore += 20;
  else if (savingsRate > 0) healthScore += 10;
  else healthScore -= 20;

  // Check budget compliance
  let overBudgetCount = 0;
  budgets.forEach(b => {
    const spend = categoryTotals[b.category] || 0;
    if (b.monthlyLimit > 0 && spend > b.monthlyLimit) overBudgetCount++;
  });

  if (overBudgetCount === 0) healthScore += 20;
  else healthScore -= overBudgetCount * 10;

  healthScore = Math.min(Math.max(healthScore, 10), 100);

  // Generate Insights
  const insights = [];

  if (savingsRate >= 20) {
    insights.push({
      type: 'SUCCESS',
      title: 'Excellent Savings Rate!',
      desc: `You are saving ${savingsRate.toFixed(1)}% of your income. Great job maintaining a healthy financial buffer!`
    });
  } else if (savingsRate < 0) {
    insights.push({
      type: 'DANGER',
      title: 'Spending Exceeds Income',
      desc: `Your monthly expenses (${formatCurrency(totalExpense, currency)}) exceed total inflow (${formatCurrency(totalIncome, currency)}). Consider reviewing non-essential spending.`
    });
  }

  // Top spending category analysis
  const sortedCategories = Object.keys(categoryTotals).sort((a, b) => categoryTotals[b] - categoryTotals[a]);
  if (sortedCategories.length > 0) {
    const topCat = sortedCategories[0];
    const topAmt = categoryTotals[topCat];
    const topMeta = CATEGORY_META[topCat] || { name: topCat, icon: '📦' };
    const pct = totalExpense > 0 ? ((topAmt / totalExpense) * 100).toFixed(1) : 0;

    insights.push({
      type: 'INFO',
      title: `Highest Outflow: ${topMeta.name}`,
      desc: `${topMeta.icon} ${topMeta.name} represents ${pct}% of total spending (${formatCurrency(topAmt, currency)}).`
    });
  }

  // AI Action Plan
  const actionPlan = [];
  if (categoryTotals['FOOD'] && categoryTotals['FOOD'] > 300) {
    actionPlan.push('💡 Reduce dining out by cooking 2 extra meals at home weekly to save ~' + formatCurrency(120, currency) + '/month.');
  }
  if (categoryTotals['ENTERTAINMENT'] && categoryTotals['ENTERTAINMENT'] > 150) {
    actionPlan.push('🎬 Audit unused streaming and gaming subscriptions to save ~' + formatCurrency(45, currency) + '/month.');
  }
  if (savingsRate < 20) {
    actionPlan.push('🛡️ Set up an automatic 15% transfer to your emergency savings goal on payday.');
  } else {
    actionPlan.push('📈 Consider investing surplus savings into low-cost index funds for long-term growth.');
  }

  return {
    healthScore,
    totalIncome,
    totalExpense,
    netSavings,
    savingsRate,
    insights,
    actionPlan
  };
}

export function askAiAssistant(question, analysis, currency = 'USD') {
  const q = question.toLowerCase();

  if (q.includes('save') || q.includes('saving') || q.includes('tip')) {
    return `Based on your current data, your savings rate is ${analysis.savingsRate.toFixed(1)}%. Here are 2 key tips:\n1. ${analysis.actionPlan[0] || 'Track daily micro-expenses.'}\n2. ${analysis.actionPlan[1] || 'Set monthly category caps.'}`;
  }

  if (q.includes('health') || q.includes('score')) {
    return `Your Financial Health Score is ${analysis.healthScore}/100! ${analysis.healthScore >= 70 ? 'You are in great shape!' : 'Focus on controlling high-expense categories to raise your score.'}`;
  }

  if (q.includes('highest') || q.includes('category') || q.includes('most')) {
    return `Your top spending categories are analyzed automatically. ${analysis.insights[1] ? analysis.insights[1].desc : 'Check the Category Breakdown doughnut chart for a visual split!'}`;
  }

  if (q.includes('budget') || q.includes('limit')) {
    return `You have set monthly category caps in your Budgets tab. Keeping each category under 80% capacity ensures your Net Savings Rate stays above 20%!`;
  }

  return `I have analyzed your financial records! Total Income: ${formatCurrency(analysis.totalIncome, currency)}, Total Expenses: ${formatCurrency(analysis.totalExpense, currency)}, Net Savings: ${formatCurrency(analysis.netSavings, currency)}. How else can I assist your financial planning today?`;
}
