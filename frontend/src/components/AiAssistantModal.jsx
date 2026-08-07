import React, { useState } from 'react';
import { X, Bot, Sparkles, Send, Award, CheckCircle, TrendingUp, AlertTriangle, Lightbulb, PieChart, ShieldAlert, Zap } from 'lucide-react';
import { analyzeFinances, askAiAssistant } from '../utils/aiAdvisor';
import { formatCurrency } from '../utils/formatters';

export default function AiAssistantModal({
  isOpen,
  onClose,
  transactions,
  budgets,
  currency
}) {
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: '👋 Hello! I am your SpendWise AI Financial Advisor 🤖.\nI have scanned your financial records, checked your 50/30/20 budget ratios, and calculated your Financial Health Score. Ask me anything about your spending or saving strategies!'
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  if (!isOpen) return null;

  const analysis = analyzeFinances(transactions, budgets, currency);

  const handleSend = (textToSend) => {
    const query = textToSend || inputQuery;
    if (!query.trim()) return;

    const userMsg = { sender: 'user', text: query };
    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputQuery('');
    setIsTyping(true);

    setTimeout(() => {
      const aiReplyText = askAiAssistant(query, analysis, currency);
      setMessages(prev => [...prev, { sender: 'ai', text: aiReplyText }]);
      setIsTyping(false);
    }, 400);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '680px', padding: '1.5rem' }}>
        
        {/* Modal Header */}
        <div className="flex items-center justify-between" style={{ marginBottom: '1.25rem' }}>
          <div className="flex items-center gap-2.5">
            <div style={{
              width: '40px', height: '40px', borderRadius: '12px',
              background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
            }}>
              <Bot size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>SpendWise AI Financial Advisor</h3>
                <span className="badge" style={{ backgroundColor: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary)', fontSize: '0.7rem' }}>
                  <Sparkles size={10} /> Smart AI
                </span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Automated financial analytics, 50/30/20 rule audit & forecasting</p>
            </div>
          </div>
          <button className="btn btn-secondary btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Financial Metrics Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3" style={{ marginBottom: '1rem' }}>
          
          {/* Health Score */}
          <div style={{
            padding: '0.875rem 1rem',
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)'
          }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Health Score
            </span>
            <div className="flex items-center gap-1.5" style={{ marginTop: '0.2rem' }}>
              <span style={{
                fontSize: '1.5rem', fontWeight: 800,
                color: analysis.healthScore >= 70 ? 'var(--success)' : analysis.healthScore >= 50 ? 'var(--warning)' : 'var(--danger)'
              }}>
                {analysis.healthScore}
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>/ 100</span>
            </div>
          </div>

          {/* Savings Rate */}
          <div style={{
            padding: '0.875rem 1rem',
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)'
          }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Monthly Surplus
            </span>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '0.2rem', color: analysis.netSavings >= 0 ? 'var(--success)' : 'var(--danger)' }}>
              {formatCurrency(analysis.netSavings, currency, currency)}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              {analysis.savingsRate.toFixed(1)}% savings rate
            </div>
          </div>

          {/* 50/30/20 Needs Ratio */}
          <div style={{
            padding: '0.875rem 1rem',
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)'
          }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Essential Needs Ratio
            </span>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '0.2rem', color: analysis.needsPct <= 50 ? 'var(--success)' : 'var(--warning)' }}>
              {analysis.needsPct.toFixed(0)}%
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              Target: ≤50% of income
            </div>
          </div>

        </div>

        {/* Category Alerts Banner if any */}
        {analysis.categoryAlerts.length > 0 && (
          <div style={{
            padding: '0.75rem 1rem',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            marginBottom: '1rem',
            fontSize: '0.8rem',
            color: 'var(--danger)'
          }}>
            <div className="flex items-center gap-1.5" style={{ fontWeight: 700, marginBottom: '0.25rem' }}>
              <AlertTriangle size={14} /> Category Budget Alerts:
            </div>
            {analysis.categoryAlerts.slice(0, 2).map((a, i) => (
              <div key={i}>{a.text}</div>
            ))}
          </div>
        )}

        {/* AI Action Plan Recommendations */}
        <div style={{ marginBottom: '1rem' }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>
            💡 AI Action Recommendations:
          </span>
          <div className="flex flex-col gap-1.5" style={{ fontSize: '0.8125rem' }}>
            {analysis.actionPlan.slice(0, 3).map((item, idx) => (
              <div key={idx} style={{
                padding: '0.5rem 0.75rem',
                backgroundColor: 'var(--primary-light)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                border: '1px solid rgba(99, 102, 241, 0.2)'
              }}>
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Chat History Box */}
        <div style={{
          height: '200px',
          overflowY: 'auto',
          backgroundColor: 'var(--bg-main)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          padding: '0.875rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          marginBottom: '1rem'
        }}>
          {messages.map((m, i) => (
            <div
              key={i}
              style={{
                alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
                backgroundColor: m.sender === 'user' ? 'var(--primary)' : 'var(--bg-card-solid)',
                color: m.sender === 'user' ? '#fff' : 'var(--text-primary)',
                border: m.sender === 'ai' ? '1px solid var(--border-color)' : 'none',
                padding: '0.625rem 0.875rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.8125rem',
                whiteSpace: 'pre-line',
                lineHeight: 1.5
              }}
            >
              {m.text}
            </div>
          ))}
          {isTyping && (
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
              🤖 AI is running financial analytics...
            </div>
          )}
        </div>

        {/* Quick Question Pills */}
        <div className="flex items-center gap-1.5" style={{ flexWrap: 'wrap', marginBottom: '0.75rem' }}>
          <button className="btn btn-secondary btn-sm" style={{ fontSize: '0.75rem' }} onClick={() => handleSend('50/30/20 budget check')}>
            📊 50/30/20 Rule Check
          </button>
          <button className="btn btn-secondary btn-sm" style={{ fontSize: '0.75rem' }} onClick={() => handleSend('What is my top expense category?')}>
            🍕 Top Outflow Category
          </button>
          <button className="btn btn-secondary btn-sm" style={{ fontSize: '0.75rem' }} onClick={() => handleSend('Predict next month forecast')}>
            🔮 Next Month Forecast
          </button>
          <button className="btn btn-secondary btn-sm" style={{ fontSize: '0.75rem' }} onClick={() => handleSend('Category budget alerts')}>
            ⚠️ Budget Alerts
          </button>
        </div>

        {/* Input Bar */}
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex items-center gap-2">
          <input
            type="text"
            className="form-control"
            placeholder="Ask AI advisor a question (e.g. 50/30/20 rule, forecast, tips)..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
          />
          <button type="submit" className="btn btn-primary" style={{ padding: '0.625rem 1rem' }}>
            <Send size={16} />
          </button>
        </form>

      </div>
    </div>
  );
}
