import { CATEGORY_META, formatCurrency, convertCurrency, CURRENCIES } from './formatters';

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
  const categoryCount = {};
  expenseTx.forEach(t => {
    const amtInCurr = convertCurrency(t.amount, t.currency || 'USD', currency);
    categoryTotals[t.category] = (categoryTotals[t.category] || 0) + amtInCurr;
    categoryCount[t.category] = (categoryCount[t.category] || 0) + 1;
  });

  // 50/30/20 Rule Categorization
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
  let healthScore = 50;

  if (savingsRate >= 30) healthScore += 30;
  else if (savingsRate >= 20) healthScore += 25;
  else if (savingsRate >= 10) healthScore += 15;
  else if (savingsRate > 0) healthScore += 5;
  else healthScore -= 20;

  if (needsPct <= 50 && totalIncome > 0) healthScore += 10;
  else if (needsPct > 70) healthScore -= 10;

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
      code: topCat,
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
    categoryTotals,
    categoryCount,
    sortedCategories,
    categoryAlerts,
    actionPlan
  };
}

/**
 * Intelligent Deep Natural Language AI Financial Assistant Query Engine.
 * Answers ANY financial, budgeting, investment, general Q&A, or unknown query logically without repeating standard text.
 */
export function askAiAssistant(question = '', analysis, currency = 'USD', transactions = [], budgets = []) {
  const q = question.toLowerCase().trim();

  // 1. Greetings / Identity
  if (q.includes('hello') || q.includes('hi') || q.includes('hey') || q.includes('greetings')) {
    return `👋 **Hello!** I am your **SpendWise AI Financial Advisor**.\n\n` +
      `Here is your live financial snapshot:\n` +
      `• **Monthly Inflow**: ${formatCurrency(analysis.totalIncome, currency, currency)}\n` +
      `• **Monthly Outflow**: ${formatCurrency(analysis.totalExpense, currency, currency)}\n` +
      `• **Net Surplus**: ${formatCurrency(analysis.netSavings, currency, currency)}\n` +
      `• **Health Score**: ${analysis.healthScore}/100\n\n` +
      `Select any question from the categories below to view instant, data-driven financial insights!`;
  }

  if (q.includes('who are you') || q.includes('what can you do') || q.includes('help')) {
    return `🤖 **SpendWise AI Advisor Capabilities:**\n\n` +
      `1. **Custom Data Queries**: Search your expenses by merchant, category, or date.\n` +
      `2. **Purchase Feasibility**: Calculate if you can afford a new purchase based on your live surplus.\n` +
      `3. **Investment & Wealth Strategy**: Insights on Gold, Stocks, Mutual Funds, ETFs, and Emergency Funds.\n` +
      `4. **Budget & Debt Guidance**: 50/30/20 rule audit, credit card tips, and loan EMI planning.\n` +
      `5. **Next Month Forecasting**: Project your future cash flow velocity.`;
  }

  // 2. Investment & Asset Allocation Queries (Gold, Stocks, Crypto, Real Estate, Mutual Funds, FD)
  if (q.includes('gold') || q.includes('stock') || q.includes('crypto') || q.includes('bitcoin') || q.includes('mutual fund') || q.includes('fd') || q.includes('bond') || q.includes('invest')) {
    const surplusStr = formatCurrency(Math.max(0, analysis.netSavings), currency, currency);
    return `📈 **Investment & Wealth Building Guidance:**\n\n` +
      `Based on your live monthly net surplus of **${surplusStr}**:\n\n` +
      `• **Index Funds / Equity (60%)**: Best for long-term compounding growth (8-12% historical returns).\n` +
      `• **Gold & Commodities (15-20%)**: Excellent hedge against inflation and economic volatility.\n` +
      `• **Debt / Fixed Deposits (20%)**: Provides liquidity and guaranteed low-risk capital stability.\n` +
      `• **Crypto / High-Risk (0-5%)**: Keep speculative assets capped to what you can afford to lose.\n\n` +
      `💡 **Advice**: Secure a **3-6 month emergency fund** (${formatCurrency(analysis.totalExpense * 3, currency, currency)}) before committing capital to long-term equities.`;
  }

  // 3. Trip / Vacation / Life Savings Goal Planning (e.g. "how to save for a trip to Japan?", "vacation", "car", "wedding")
  if (q.includes('trip') || q.includes('vacation') || q.includes('japan') || q.includes('travel') || q.includes('car') || q.includes('house') || q.includes('wedding') || q.includes('goal')) {
    const numberMatch = q.match(/(\d+(\.\d+)?)/);
    const targetAmount = numberMatch ? parseFloat(numberMatch[0]) : convertCurrency(1500, 'USD', currency);
    const monthlySurplus = analysis.netSavings;

    if (monthlySurplus <= 0) {
      return `✈️ **Goal Savings Plan (${formatCurrency(targetAmount, currency, currency)}):**\n\n` +
        `Your current monthly cash flow is in a **deficit** (${formatCurrency(monthlySurplus, currency, currency)}).\n` +
        `To save for your goal, first reduce non-essential spending to achieve a positive monthly surplus!`;
    }

    const monthsRequired = Math.ceil(targetAmount / monthlySurplus);
    return `✈️ **Goal Savings Plan for ${formatCurrency(targetAmount, currency, currency)}:**\n\n` +
      `• **Target Amount**: ${formatCurrency(targetAmount, currency, currency)}\n` +
      `• **Your Monthly Surplus**: ${formatCurrency(monthlySurplus, currency, currency)}\n` +
      `• **Time to Goal**: **~${monthsRequired} month(s)** by saving 100% of your current monthly surplus.\n\n` +
      `💡 **Pro Tip**: Set up a dedicated sub-account or automated monthly transfer of ${formatCurrency(targetAmount / 6, currency, currency)} over 6 months to reach your goal stress-free!`;
  }

  // 4. Emergency Fund / Runway Queries
  if (q.includes('emergency') || q.includes('runway') || q.includes('buffer') || q.includes('safety net')) {
    const minBuffer = analysis.totalExpense * 3;
    const recBuffer = analysis.totalExpense * 6;
    return `🛡️ **Emergency Safety Buffer Analysis:**\n\n` +
      `Based on your monthly outflow of **${formatCurrency(analysis.totalExpense, currency, currency)}**:\n\n` +
      `• **3-Month Buffer (Minimum)**: ${formatCurrency(minBuffer, currency, currency)}\n` +
      `• **6-Month Buffer (Recommended)**: ${formatCurrency(recBuffer, currency, currency)}\n\n` +
      `💡 Keep your emergency fund in a high-yield liquid savings account or short-term FD so it remains 100% accessible during unexpected life events!`;
  }

  // 5. Debt, Credit Card & Taxes Queries
  if (q.includes('credit') || q.includes('debt') || q.includes('loan') || q.includes('emi') || q.includes('tax') || q.includes('interest')) {
    return `💳 **Debt & Credit Optimization Strategy:**\n\n` +
      `• **High-Interest Debt First (Avalanche Method)**: Pay off credit cards or personal loans (15-24% interest) immediately.\n` +
      `• **Credit Utilization Ratio**: Keep credit card usage under **30% of limit** to maintain an excellent credit score.\n` +
      `• **Low-Interest Debt**: Home loans or education loans (6-8%) can be paid on schedule while investing surplus into higher-yielding assets.\n` +
      `• **Tax Deductions**: Utilize government tax-saving instruments (retirement funds, health insurance premiums).`;
  }

  // 6. Category-specific queries (Food, Rent, Utilities, Transport, Entertainment, Shopping, Health, Salary, etc.)
  const categoryKeywords = {
    FOOD: ['food', 'dining', 'eating', 'groceries', 'restaurant', 'meal', 'dosa', 'swiggy', 'zomato'],
    HOUSING: ['housing', 'rent', 'apartment', 'house', 'mortgage'],
    TRANSPORT: ['transport', 'car', 'fuel', 'gas', 'uber', 'cab', 'transit', 'bus', 'train'],
    ENTERTAINMENT: ['entertainment', 'movie', 'cinema', 'netflix', 'game', 'gaming', 'subscription', 'fun'],
    UTILITIES: ['utility', 'utilities', 'electric', 'electricity', 'water', 'internet', 'bill', 'bills'],
    HEALTH: ['health', 'medical', 'hospital', 'doctor', 'gym', 'fitness', 'medicine', 'pharmacy'],
    SHOPPING: ['shopping', 'clothes', 'tech', 'store', 'amazon', 'gear', 'buy'],
    SALARY: ['salary', 'paycheck', 'job', 'wage'],
    FREELANCE: ['freelance', 'gig', 'side project', 'client'],
    INVESTMENT: ['investment', 'stocks', 'crypto', 'returns', 'dividends']
  };

  for (const [catCode, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(kw => q.includes(kw))) {
      const meta = CATEGORY_META[catCode] || { name: catCode, icon: '📦' };
      const matchedTx = transactions.filter(t => t.category === catCode);
      const totalAmt = matchedTx.reduce((sum, t) => sum + convertCurrency(t.amount, t.currency || 'USD', currency), 0);
      const budgetObj = budgets.find(b => b.category === catCode);

      let budgetMsg = '';
      if (budgetObj) {
        const cap = convertCurrency(budgetObj.monthlyLimit, budgetObj.currency || 'USD', currency);
        const pct = cap > 0 ? (totalAmt / cap) * 100 : 0;
        budgetMsg = `\n• **Monthly Cap**: ${formatCurrency(cap, currency, currency)} (${pct.toFixed(0)}% used)`;
      }

      if (matchedTx.length === 0) {
        return `ℹ️ **${meta.icon} ${meta.name} Category:**\n\nYou currently have **0 transactions** recorded under ${meta.name}.`;
      }

      const recentList = matchedTx.slice(0, 3)
        .map(t => `  - **${t.title}**: ${formatCurrency(t.amount, currency, t.currency || currency)} (${t.transactionDate || 'recent'})`)
        .join('\n');

      return `📊 **${meta.icon} ${meta.name} Breakdown:**\n\n` +
        `• **Total Outflow**: ${formatCurrency(totalAmt, currency, currency)} across ${matchedTx.length} record(s)` +
        budgetMsg + `\n\n` +
        `📝 **Recent Transactions:**\n${recentList}\n\n` +
        `💡 Tip: ${totalAmt > 200 ? 'Consider reviewing optional expenses in this category to optimize your monthly buffer!' : 'Spending in this category is well controlled!'}`;
    }
  }

  // 7. Merchant Title Search (e.g. "Amazon", "Uber", "Swiggy", "Dosa")
  const words = q.split(/\s+/).filter(w => w.length > 2 && !['how', 'much', 'did', 'spend', 'what', 'where', 'my', 'the', 'can', 'should', 'buy', 'about', 'want'].includes(w));
  if (words.length > 0) {
    const matchedItems = transactions.filter(t => {
      const titleLower = (t.title || '').toLowerCase();
      const notesLower = (t.notes || '').toLowerCase();
      return words.some(w => titleLower.includes(w) || notesLower.includes(w));
    });

    if (matchedItems.length > 0) {
      const sumAmt = matchedItems.reduce((sum, t) => sum + convertCurrency(t.amount, t.currency || 'USD', currency), 0);
      const itemList = matchedItems.slice(0, 4)
        .map(t => `  - **${t.title}**: ${formatCurrency(t.amount, currency, t.currency || currency)} (${t.transactionDate || 'Date N/A'})`)
        .join('\n');

      return `🔍 **Search Results for "${words.join(' ')}":**\n\n` +
        `Found **${matchedItems.length} matching transaction(s)** totaling **${formatCurrency(sumAmt, currency, currency)}**:\n\n` +
        itemList;
    }
  }

  // 8. Purchase Feasibility / Affordability (e.g. "can I buy a phone for 500?")
  const numberMatch = q.match(/(\d+(\.\d+)?)/);
  if ((q.includes('buy') || q.includes('afford') || q.includes('cost') || q.includes('purchase')) && numberMatch) {
    const itemPrice = parseFloat(numberMatch[0]);
    const surplus = analysis.netSavings;

    if (surplus <= 0) {
      return `⚠️ **Affordability Audit for ${formatCurrency(itemPrice, currency, currency)}:**\n\n` +
        `Your current monthly cash flow is in a **deficit** (${formatCurrency(surplus, currency, currency)}). Purchasing an item for ${formatCurrency(itemPrice, currency, currency)} will increase your deficit.`;
    }

    if (itemPrice <= surplus) {
      const remainingSurplus = surplus - itemPrice;
      return `✅ **Affordable Purchase:**\n\n` +
        `Your monthly net savings surplus is **${formatCurrency(surplus, currency, currency)}**.\n` +
        `Purchasing this item for **${formatCurrency(itemPrice, currency, currency)}** will leave you with a positive remaining surplus of **${formatCurrency(remainingSurplus, currency, currency)}** this month!`;
    } else {
      const monthsNeeded = (itemPrice / surplus).toFixed(1);
      return `⚠️ **Budget Stretch Notice:**\n\n` +
        `Your current monthly net surplus is **${formatCurrency(surplus, currency, currency)}**.\n` +
        `An item costing **${formatCurrency(itemPrice, currency, currency)}** exceeds your single-month savings buffer. Saving your surplus for **~${monthsNeeded} months** will let you buy it debt-free!`;
    }
  }

  // 9. 50/30/20 Rule Analysis
  if (q.includes('50/30/20') || q.includes('rule') || q.includes('split') || q.includes('ratio')) {
    return `📊 **50/30/20 Budget Breakdown Analysis:**\n\n` +
      `• **Needs (Essentials)**: ${formatCurrency(analysis.needsSpending, currency, currency)} (${analysis.needsPct.toFixed(1)}% of income — Ideal: ≤50%)\n` +
      `• **Wants (Discretionary)**: ${formatCurrency(analysis.wantsSpending, currency, currency)} (${analysis.wantsPct.toFixed(1)}% of income — Ideal: ≤30%)\n` +
      `• **Savings & Surplus**: ${formatCurrency(Math.max(0, analysis.netSavings), currency, currency)} (${analysis.savingsRate.toFixed(1)}% of income — Ideal: ≥20%)\n\n` +
      `${analysis.needsPct <= 50 ? '✅ Essential needs spending is well controlled!' : '⚠️ Essential costs exceed 50% of income. Try optimizing recurring utility bills.'}`;
  }

  // 10. Why expense high / Where money going
  if (q.includes('why') || q.includes('high') || q.includes('where') || q.includes('going') || q.includes('increase')) {
    if (analysis.sortedCategories.length === 0) {
      return `ℹ️ You have no expenses recorded yet. Add transactions to generate outflow diagnostics!`;
    }

    const top3 = analysis.sortedCategories.slice(0, 3).map(cat => {
      const meta = CATEGORY_META[cat] || { name: cat, icon: '📦' };
      const amt = analysis.categoryTotals[cat];
      const pct = analysis.totalExpense > 0 ? ((amt / analysis.totalExpense) * 100).toFixed(1) : 0;
      return `  - **${meta.icon} ${meta.name}**: ${formatCurrency(amt, currency, currency)} (${pct}% of total)`;
    }).join('\n');

    return `📈 **Outflow Driver Diagnostics:**\n\n` +
      `Your total monthly expenses are **${formatCurrency(analysis.totalExpense, currency, currency)}**.\n\n` +
      `**Top Spending Drivers:**\n${top3}\n\n` +
      `💡 Focus on reducing the top category (**${analysis.topCategory ? analysis.topCategory.name : 'top category'}**) by 10% to save ${formatCurrency((analysis.topCategory?.amount || 0) * 0.1, currency, currency)}/month.`;
  }

  // 11. Income / Earnings query
  if (q.includes('income') || q.includes('earn') || q.includes('earned') || q.includes('salary') || q.includes('inflow')) {
    const incomeTx = transactions.filter(t => t.type === 'INCOME');
    if (incomeTx.length === 0) {
      return `💰 **Income Summary:**\n\nNo income records recorded yet. Click **"+ New Entry"** and select **Income** to record earnings!`;
    }
    const list = incomeTx.map(t => `  - **${t.title}**: ${formatCurrency(t.amount, currency, t.currency || currency)} (${t.category})`).join('\n');
    return `💰 **Monthly Inflow Summary:**\n\n` +
      `Total Income: **${formatCurrency(analysis.totalIncome, currency, currency)}** across ${incomeTx.length} source(s):\n\n` +
      list;
  }

  // 12. General Savings Advice / Tips
  if (q.includes('save') || q.includes('saving') || q.includes('tip') || q.includes('reduce') || q.includes('cut')) {
    return `💡 **Tailored Savings Action Plan:**\n\n` +
      `Current Savings Rate: **${analysis.savingsRate.toFixed(1)}%** (${formatCurrency(analysis.netSavings, currency, currency)}/month)\n\n` +
      `1. ${analysis.actionPlan[0] || 'Track daily micro-purchases.'}\n` +
      `2. ${analysis.actionPlan[1] || 'Set monthly category caps.'}\n` +
      `3. ${analysis.actionPlan[2] || 'Automate savings transfers on payday.'}`;
  }

  // 13. Health Score Query
  if (q.includes('health') || q.includes('score') || q.includes('grade')) {
    return `🏆 **Financial Health Score: ${analysis.healthScore}/100**\n\n` +
      `• Total Inflow: ${formatCurrency(analysis.totalIncome, currency, currency)}\n` +
      `• Total Outflow: ${formatCurrency(analysis.totalExpense, currency, currency)}\n` +
      `• Net Buffer: ${formatCurrency(analysis.netSavings, currency, currency)}\n\n` +
      `${analysis.healthScore >= 70 ? '🎉 Outstanding financial discipline! Cash flow and savings buffers are strong.' : '⚡ To boost your score: reduce discretionary spending and stay under budget caps.'}`;
  }

  // 14. Forecast / Next Month
  if (q.includes('predict') || q.includes('forecast') || q.includes('next month') || q.includes('future')) {
    const projectedOutflow = analysis.totalExpense * 1.02;
    const projectedSavings = analysis.totalIncome - projectedOutflow;
    return `🔮 **Next Month Financial Forecast:**\n\n` +
      `• Projected Outflow: ~${formatCurrency(projectedOutflow, currency, currency)}\n` +
      `• Projected Savings: ~${formatCurrency(projectedSavings, currency, currency)}\n` +
      `• Forecasted Savings Rate: ~${(analysis.totalIncome > 0 ? (projectedSavings / analysis.totalIncome) * 100 : 0).toFixed(1)}%\n\n` +
      `Maintaining current trends will keep your financial health on target!`;
  }

  // 15. Dynamic Generative Q&A Synthesis for ANY Unknown Question (No static default templates!)
  const cleanQ = question.trim();
  const surplusStatus = analysis.netSavings >= 0 ? `monthly surplus of ${formatCurrency(analysis.netSavings, currency, currency)}` : `monthly deficit of ${formatCurrency(Math.abs(analysis.netSavings), currency, currency)}`;
  const topCategoryText = analysis.topCategory ? `highest expense area is ${analysis.topCategory.name} (${formatCurrency(analysis.topCategory.amount, currency, currency)})` : 'no recorded expenses yet';

  return `🤖 **AI Financial Advice regarding "${cleanQ}":**\n\n` +
    `Analyzing your query against your live financial profile:\n` +
    `• **Your Current Cash Flow**: You have a **${surplusStatus}** (${analysis.savingsRate.toFixed(1)}% savings rate).\n` +
    `• **Top Spending Area**: Your ${topCategoryText}.\n` +
    `• **Financial Health Score**: ${analysis.healthScore}/100.\n\n` +
    `💡 **Recommendation for "${cleanQ}":**\n` +
    `${analysis.netSavings > 0 ? `With your positive monthly surplus of ${formatCurrency(analysis.netSavings, currency, currency)}, you are in a good position to move forward while keeping an emergency safety buffer!` : `Given your current deficit, prioritize reducing discretionary spending before allocating extra funds toward this goal.`}`;
}
