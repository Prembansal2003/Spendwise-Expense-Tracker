import React, { useState, useRef, useEffect } from 'react';
import { X, Bot, Sparkles, Award, CheckCircle, TrendingUp, AlertTriangle, Lightbulb, PieChart, ShieldAlert, Zap, HelpCircle } from 'lucide-react';
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
      text: '👋 Welcome to SpendWise AI Financial Advisor! 🤖\nSelect any question from the categories below to generate an instant, data-driven financial analysis using your live records.'
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (isOpen && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen]);

  if (!isOpen) return null;

  const analysis = analyzeFinances(transactions, budgets, currency);

  const handleSelectQuestion = (queryText) => {
    if (!queryText || isTyping) return;

    const userMsg = { sender: 'user', text: queryText };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    setTimeout(() => {
      const aiReplyText = askAiAssistant(queryText, analysis, currency, transactions, budgets);
      setMessages(prev => [...prev, { sender: 'ai', text: aiReplyText }]);
      setIsTyping(false);
    }, 350);
  };

  // Grouped Selectable Financial Questions
  const QUESTION_GROUPS = [
    {
      category: '📊 Health & Ratios',
      questions: [
        { label: '📊 50/30/20 Budget Check', query: '50/30/20 budget check' },
        { label: '🏆 Health Score Audit', query: 'What is my Financial Health Score breakdown?' },
        { label: '⚠️ Budget Cap Alerts', query: 'Are any category budgets near or over limit?' }
      ]
    },
    {
      category: '🔍 Expenses & Outflow',
      questions: [
        { label: '🍕 Highest Expense Category', query: 'What is my top expense category?' },
        { label: '📈 Why Are Expenses High?', query: 'Why are my expenses high this month?' },
        { label: '🍽️ Food & Dining Total', query: 'How much did I spend on food?' },
        { label: '⚡ Utilities & Bills Total', query: 'How much did I spend on utilities?' },
        { label: '🎬 Entertainment & Streaming', query: 'How much did I spend on entertainment?' }
      ]
    },
    {
      category: '💰 Income & Cash Flow',
      questions: [
        { label: '💵 Monthly Income Summary', query: 'What is my total monthly income breakdown?' },
        { label: '🔮 Next Month Forecast', query: 'Predict next month financial forecast' }
      ]
    },
    {
      category: '💡 Wealth & Goal Strategy',
      questions: [
        { label: '💡 Tailored Savings Action Plan', query: 'Give me a tailored savings action plan' },
        { label: '📈 Stocks, Gold & Investments', query: 'Should I invest in stocks, gold, or mutual funds?' },
        { label: '✈️ Trip & Goal Calculator', query: 'How to save for a trip to Japan?' },
        { label: '🛡️ Emergency Safety Buffer', query: 'How much emergency safety buffer do I need?' },
        { label: '💳 Credit Card & Debt Strategy', query: 'How to optimize credit card debt & taxes?' }
      ]
    }
  ];

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{
        maxWidth: '720px',
        maxHeight: '88vh',
        display: 'flex',
        flexDirection: 'column',
        padding: '1.25rem',
        overflow: 'hidden'
      }}>
        
        {/* Modal Header (Fixed top) */}
        <div className="flex items-center justify-between" style={{ marginBottom: '0.75rem', flexShrink: 0 }}>
          <div className="flex items-center gap-2.5">
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
            }}>
              <Bot size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>SpendWise AI Financial Advisor</h3>
                <span className="badge" style={{ backgroundColor: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary)', fontSize: '0.68rem', padding: '0.15rem 0.4rem' }}>
                  <Sparkles size={10} /> Guided AI
                </span>
              </div>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Select a question below for instant data-driven analysis</p>
            </div>
          </div>
          <button className="btn btn-secondary btn-icon" style={{ width: '2rem', height: '2rem' }} onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Body Content */}
        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.25rem', marginBottom: '0.5rem' }}>
          
          {/* Health Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5" style={{ marginBottom: '0.75rem' }}>
            <div style={{
              padding: '0.65rem 0.8rem', backgroundColor: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)'
            }}>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Health Score
              </span>
              <div className="flex items-center gap-1.5" style={{ marginTop: '0.1rem' }}>
                <span style={{
                  fontSize: '1.25rem', fontWeight: 800,
                  color: analysis.healthScore >= 70 ? 'var(--success)' : analysis.healthScore >= 50 ? 'var(--warning)' : 'var(--danger)'
                }}>
                  {analysis.healthScore}
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>/ 100</span>
              </div>
            </div>

            <div style={{
              padding: '0.65rem 0.8rem', backgroundColor: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)'
            }}>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Monthly Surplus
              </span>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, marginTop: '0.1rem', color: analysis.netSavings >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                {formatCurrency(analysis.netSavings, currency, currency)}
              </div>
            </div>

            <div style={{
              padding: '0.65rem 0.8rem', backgroundColor: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)'
            }}>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Needs Ratio
              </span>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, marginTop: '0.1rem', color: analysis.needsPct <= 50 ? 'var(--success)' : 'var(--warning)' }}>
                {analysis.needsPct.toFixed(0)}%
              </div>
            </div>
          </div>

          {/* Chat Stream History */}
          <div style={{
            minHeight: '140px',
            backgroundColor: 'var(--bg-main)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '0.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.6rem',
            marginBottom: '0.85rem'
          }}>
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '88%',
                  backgroundColor: m.sender === 'user' ? 'var(--primary)' : 'var(--bg-card-solid)',
                  color: m.sender === 'user' ? '#fff' : 'var(--text-primary)',
                  border: m.sender === 'ai' ? '1px solid var(--border-color)' : 'none',
                  padding: '0.55rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.78rem',
                  whiteSpace: 'pre-line',
                  lineHeight: 1.45
                }}
              >
                {m.text}
              </div>
            ))}
            {isTyping && (
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                🤖 AI is generating financial response...
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Selectable Questions Grid Explorer */}
          <div>
            <div className="flex items-center gap-1.5" style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              <HelpCircle size={14} color="var(--primary)" /> Select a question to ask AI Advisor:
            </div>

            <div className="flex flex-col gap-3">
              {QUESTION_GROUPS.map((group, gIdx) => (
                <div key={gIdx}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '0.3rem' }}>
                    {group.category}
                  </span>
                  <div className="flex items-center gap-1.5" style={{ flexWrap: 'wrap' }}>
                    {group.questions.map((qItem, qIdx) => (
                      <button
                        key={qIdx}
                        className="btn btn-secondary btn-sm"
                        style={{
                          fontSize: '0.74rem',
                          padding: '0.3rem 0.6rem',
                          borderRadius: 'var(--radius-md)',
                          borderColor: 'var(--border-color)',
                          transition: 'all 0.15s ease'
                        }}
                        onClick={() => handleSelectQuestion(qItem.query)}
                      >
                        {qItem.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
