import React, { useState } from 'react';
import { X, Bot, Sparkles, Send, Award, CheckCircle, TrendingUp, AlertCircle, Lightbulb } from 'lucide-react';
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
      text: 'Hello! I am your SpendWise AI Financial Assistant 🤖. I have scanned your financial records and calculated your Financial Health Score. Ask me anything about your spending or saving strategies!'
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
    }, 600);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '640px', padding: '1.5rem' }}>
        
        {/* Modal Header */}
        <div className="flex items-center justify-between" style={{ marginBottom: '1.25rem' }}>
          <div className="flex items-center gap-2">
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff'
            }}>
              <Bot size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>SpendWise AI Financial Advisor</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Smart automated financial analytics & savings strategies</p>
            </div>
          </div>
          <button className="btn btn-secondary btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Health Score & Key Metrics Banner */}
        <div style={{
          padding: '1rem 1.25rem',
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              FINANCIAL HEALTH SCORE
            </span>
            <div className="flex items-center gap-2" style={{ marginTop: '0.2rem' }}>
              <span style={{
                fontSize: '1.8rem', fontWeight: 800,
                color: analysis.healthScore >= 70 ? 'var(--success)' : analysis.healthScore >= 50 ? 'var(--warning)' : 'var(--danger)'
              }}>
                {analysis.healthScore} / 100
              </span>
              <span className="badge" style={{
                backgroundColor: analysis.healthScore >= 70 ? 'var(--success-bg)' : 'var(--warning-bg)',
                color: analysis.healthScore >= 70 ? 'var(--success)' : 'var(--warning)'
              }}>
                <Award size={12} /> {analysis.healthScore >= 70 ? 'Optimal Health' : 'Needs Optimization'}
              </span>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Monthly Net Savings</span>
            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: analysis.netSavings >= 0 ? 'var(--success)' : 'var(--danger)' }}>
              {formatCurrency(analysis.netSavings, currency)} ({analysis.savingsRate.toFixed(1)}%)
            </span>
          </div>
        </div>

        {/* AI Action Plan Recommendations */}
        <div style={{ marginBottom: '1rem' }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>
            💡 Smart Action Plan Items:
          </span>
          <div className="flex flex-col gap-1.5" style={{ fontSize: '0.8125rem' }}>
            {analysis.actionPlan.map((item, idx) => (
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
          height: '180px',
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
                whiteSpace: 'pre-line'
              }}
            >
              {m.text}
            </div>
          ))}
          {isTyping && (
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
              AI is analyzing financial data...
            </div>
          )}
        </div>

        {/* Quick Question Pills */}
        <div className="flex items-center gap-1.5" style={{ flexWrap: 'wrap', marginBottom: '0.75rem' }}>
          <button className="btn btn-secondary btn-sm" style={{ fontSize: '0.75rem' }} onClick={() => handleSend('How can I save more money?')}>
            💡 How to save more?
          </button>
          <button className="btn btn-secondary btn-sm" style={{ fontSize: '0.75rem' }} onClick={() => handleSend('What is my highest expense category?')}>
            📊 Top expense category?
          </button>
          <button className="btn btn-secondary btn-sm" style={{ fontSize: '0.75rem' }} onClick={() => handleSend('Analyze my health score')}>
            🏆 Health score breakdown
          </button>
        </div>

        {/* Input Bar */}
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex items-center gap-2">
          <input
            type="text"
            className="form-control"
            placeholder="Ask AI financial advisor a question..."
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
