import React, { useState, useEffect, useRef } from 'react';
import { sendChatMessage, checkChatbotHealth } from './chatbotApi';
import {
  HeartHandshake,
  Send,
  RotateCcw,
  AlertTriangle,
  PhoneCall,
  Sparkles,
  ShieldAlert,
  User,
  ExternalLink,
  Clock,
  Info
} from 'lucide-react';

const INITIAL_MESSAGE = {
  role: 'assistant',
  content: "Hello! I'm MindOS Companion, a calm, supportive space for your wellbeing. Whether you're feeling stressed about exams, dealing with study burnout, or just need a mindful reset—I'm here to listen without judgment. How are you feeling today?",
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
};

const SUGGESTIONS = [
  "I'm feeling overwhelmed with exam deadlines",
  "Can you guide me through a quick grounding exercise?",
  "I'm experiencing study burnout and mental fatigue",
  "Help me reframe negative, anxious thoughts"
];

export const ChatbotPage = () => {
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasCrisisAlert, setHasCrisisAlert] = useState(false);
  const [healthInfo, setHealthInfo] = useState(null);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Auto-scroll to bottom whenever messages update or loading changes
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, hasCrisisAlert]);

  // Check backend health on mount
  useEffect(() => {
    checkChatbotHealth()
      .then((data) => {
        if (!data.error) {
          setHealthInfo(data);
        }
      })
      .catch(() => {});
  }, []);

  const handleSend = async (textToSend) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    setError(null);
    setInput('');

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMessage = { role: 'user', content: query, timestamp: timeStr };

    // Update in-memory state with user message
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsLoading(true);

    // Format for backend (last 20 messages, excluding client-only timestamp)
    const apiPayload = updatedMessages.map(({ role, content }) => ({ role, content }));

    const res = await sendChatMessage(apiPayload);

    setIsLoading(false);

    if (res.error) {
      setError(res.error);
      return;
    }

    const botMessage = {
      role: 'assistant',
      content: res.reply,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isCrisis: Boolean(res.crisis)
    };

    setMessages((prev) => [...prev, botMessage]);

    if (res.crisis) {
      setHasCrisisAlert(true);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        ...INITIAL_MESSAGE,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setInput('');
    setError(null);
    setHasCrisisAlert(false);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '1.25rem',
      maxWidth: '920px',
      margin: '0 auto',
      minHeight: 'calc(100vh - 120px)'
    }}>
      {/* 1. Header Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        paddingBottom: '0.25rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, var(--green-deep) 0%, var(--sunset-deep) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 4px 16px rgba(98, 121, 79, 0.35)'
          }}>
            <HeartHandshake size={26} />
          </div>
          <div>
            <h1 style={{
              fontSize: '1.85rem',
              fontWeight: 700,
              color: 'var(--ink)',
              fontFamily: 'var(--font-heading)',
              margin: 0,
              lineHeight: 1.2
            }}>
              Wellbeing Companion
            </h1>
            <p style={{ fontSize: '0.9rem', color: 'var(--ink-soft)', margin: '0.15rem 0 0 0' }}>
              Gentle, private, and judgment-free mental wellbeing support for your student life.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          {healthInfo && (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.75rem',
              fontWeight: 600,
              padding: '0.3rem 0.75rem',
              borderRadius: '999px',
              background: healthInfo.configured ? 'var(--green-tint)' : 'var(--amber-tint)',
              color: healthInfo.configured ? 'var(--green-deep)' : 'var(--amber-deep)',
              border: `1px solid ${healthInfo.configured ? 'var(--green-border)' : 'var(--amber-border)'}`
            }}>
              <span style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: healthInfo.configured ? 'var(--green-deep)' : 'var(--amber-deep)'
              }} />
              <span>{healthInfo.model || 'Gemini'} {healthInfo.configured ? 'Ready' : 'API Key Missing'}</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleResetChat}
            className="btn btn-secondary btn-sm"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.82rem',
              padding: '0.4rem 0.85rem'
            }}
            title="Start a new chat conversation"
          >
            <RotateCcw size={14} />
            <span>New Chat</span>
          </button>
        </div>
      </div>

      {/* 2. Permanent Visible Medical/Crisis Disclaimer */}
      <div style={{
        background: 'rgba(232, 184, 75, 0.12)',
        border: '1px solid var(--golden-border)',
        borderRadius: 'var(--radius-md)',
        padding: '0.75rem 1rem',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem',
        boxShadow: '0 2px 8px rgba(232, 184, 75, 0.08)'
      }}>
        <Info size={18} color="var(--amber-deep)" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div style={{ fontSize: '0.84rem', color: 'var(--ink-soft)', lineHeight: 1.45 }}>
          <strong style={{ color: 'var(--amber-deep)' }}>Important Wellbeing Notice:</strong>{' '}
          This AI is not a substitute for professional mental health diagnosis, treatment, or medical advice.
          If you're in crisis, please contact a helpline or emergency services immediately.
        </div>
      </div>

      {/* 3. Highlighted Helpline Card (Rendered prominently when crisis is detected) */}
      {hasCrisisAlert && (
        <div style={{
          background: 'linear-gradient(135deg, #fff5f5 0%, #fef2e8 100%)',
          border: '2px solid #e53e3e',
          borderRadius: 'var(--radius-md)',
          padding: '1.25rem',
          boxShadow: '0 4px 20px rgba(229, 62, 62, 0.22)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: '#e53e3e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff'
            }}>
              <PhoneCall size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#c53030', fontWeight: 700 }}>
                Immediate Crisis & Support Helplines
              </h3>
              <p style={{ margin: 0, fontSize: '0.82rem', color: '#742a2a' }}>
                Free, confidential support is available 24/7. You don't have to carry this alone.
              </p>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '0.75rem',
            marginTop: '0.25rem'
          }}>
            <div style={{
              background: '#ffffff',
              padding: '0.75rem',
              borderRadius: '8px',
              border: '1px solid #feb2b2'
            }}>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#9b2c2c' }}>
                India: Tele-MANAS
              </div>
              <div style={{ fontSize: '0.8rem', color: '#4a5568', margin: '0.2rem 0' }}>
                National 24/7 Mental Health Helpline
              </div>
              <a
                href="tel:14416"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  color: '#c53030',
                  textDecoration: 'none'
                }}
              >
                <PhoneCall size={14} /> Call 14416 / 1800 891 4416
              </a>
            </div>

            <div style={{
              background: '#ffffff',
              padding: '0.75rem',
              borderRadius: '8px',
              border: '1px solid #feb2b2'
            }}>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#9b2c2c' }}>
                US & Canada: 988 Lifeline
              </div>
              <div style={{ fontSize: '0.8rem', color: '#4a5568', margin: '0.2rem 0' }}>
                Free, 24/7 Call & Text Support
              </div>
              <a
                href="tel:988"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  color: '#c53030',
                  textDecoration: 'none'
                }}
              >
                <PhoneCall size={14} /> Call or Text 988
              </a>
            </div>

            <div style={{
              background: '#ffffff',
              padding: '0.75rem',
              borderRadius: '8px',
              border: '1px solid #feb2b2'
            }}>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#9b2c2c' }}>
                Immediate Emergency
              </div>
              <div style={{ fontSize: '0.8rem', color: '#4a5568', margin: '0.2rem 0' }}>
                Local emergency response
              </div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#c53030' }}>
                India: 112 | US: 911 | UK: 999
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Chat Messages Area */}
      <div className="glass-panel" style={{
        flex: 1,
        minHeight: '420px',
        maxHeight: '560px',
        display: 'flex',
        flexDirection: 'column',
        padding: '1.25rem',
        overflowY: 'auto'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
          {messages.map((msg, index) => {
            const isUser = msg.role === 'user';
            const isCrisisBubble = Boolean(msg.isCrisis);

            return (
              <div
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: isUser ? 'flex-end' : 'flex-start',
                  alignItems: 'flex-start',
                  gap: '0.75rem'
                }}
              >
                {!isUser && (
                  <div style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '10px',
                    background: isCrisisBubble
                      ? '#e53e3e'
                      : 'linear-gradient(135deg, var(--green-deep) 0%, var(--green) 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    flexShrink: 0,
                    marginTop: '2px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}>
                    {isCrisisBubble ? <ShieldAlert size={18} /> : <HeartHandshake size={18} />}
                  </div>
                )}

                <div style={{
                  maxWidth: '78%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isUser ? 'flex-end' : 'flex-start'
                }}>
                  <div style={{
                    padding: '0.85rem 1.15rem',
                    borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    background: isUser
                      ? 'linear-gradient(135deg, var(--blue-deep) 0%, var(--blue-vivid) 100%)'
                      : isCrisisBubble
                        ? '#fff5f5'
                        : 'var(--paper-card)',
                    color: isUser
                      ? '#ffffff'
                      : isCrisisBubble
                        ? '#742a2a'
                        : 'var(--ink)',
                    border: isUser
                      ? '1px solid rgba(255,255,255,0.2)'
                      : isCrisisBubble
                        ? '1px solid #feb2b2'
                        : '1px solid var(--line)',
                    boxShadow: isUser
                      ? '0 3px 12px var(--blue-glow)'
                      : '0 2px 10px rgba(43, 39, 31, 0.05)',
                    fontSize: '0.94rem',
                    lineHeight: 1.55,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word'
                  }}>
                    {msg.content}
                  </div>

                  {msg.timestamp && (
                    <span style={{
                      fontSize: '0.72rem',
                      color: 'var(--ink-dim)',
                      marginTop: '0.25rem',
                      padding: '0 0.35rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}>
                      <Clock size={11} /> {msg.timestamp}
                    </span>
                  )}
                </div>

                {isUser && (
                  <div style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '10px',
                    background: 'var(--paper-deep)',
                    border: '1px solid var(--line)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--ink-soft)',
                    flexShrink: 0,
                    marginTop: '2px'
                  }}>
                    <User size={18} />
                  </div>
                )}
              </div>
            );
          })}

          {/* Typing / Loading indicator */}
          {isLoading && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              <div style={{
                width: '34px',
                height: '34px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, var(--green-deep) 0%, var(--green) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                flexShrink: 0
              }}>
                <HeartHandshake size={18} />
              </div>

              <div style={{
                padding: '0.75rem 1rem',
                borderRadius: '16px 16px 16px 4px',
                background: 'var(--paper-card)',
                border: '1px solid var(--line)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: 'var(--ink-soft)',
                fontSize: '0.85rem'
              }}>
                <span style={{
                  display: 'inline-block',
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: 'var(--green-deep)',
                  animation: 'pulse 1.2s infinite ease-in-out'
                }} />
                <span style={{
                  display: 'inline-block',
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: 'var(--sunset)',
                  animation: 'pulse 1.2s infinite ease-in-out 0.2s'
                }} />
                <span style={{
                  display: 'inline-block',
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: 'var(--blue-deep)',
                  animation: 'pulse 1.2s infinite ease-in-out 0.4s'
                }} />
                <span style={{ marginLeft: '0.35rem', fontStyle: 'italic' }}>
                  MindOS Companion is reflecting...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 5. Error Alert Box */}
      {error && (
        <div style={{
          background: 'var(--rose-tint)',
          border: '1px solid var(--rose-border)',
          color: 'var(--rose-deep)',
          borderRadius: 'var(--radius-sm)',
          padding: '0.75rem 1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          fontSize: '0.88rem'
        }}>
          <AlertTriangle size={18} style={{ flexShrink: 0 }} />
          <div style={{ flex: 1 }}>{error}</div>
          <button
            type="button"
            onClick={() => setError(null)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--rose-deep)',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.9rem'
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* 6. Suggested Prompts Chips */}
      {messages.length <= 3 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <div style={{
            fontSize: '0.76rem',
            fontWeight: 700,
            color: 'var(--ink-dim)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Suggested Wellbeing Topics:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
            {SUGGESTIONS.map((text, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(text)}
                disabled={isLoading}
                className="btn btn-secondary btn-sm"
                style={{
                  fontSize: '0.8rem',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '999px',
                  textAlign: 'left'
                }}
              >
                <Sparkles size={12} style={{ marginRight: '0.35rem', color: 'var(--sunset)' }} />
                {text}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 7. Input Form Area */}
      <div className="glass-panel" style={{
        padding: '0.75rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.75rem' }}>
          <textarea
            ref={textareaRef}
            rows={2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your thoughts, worries, or ask for a calming exercise... (Press Enter to send)"
            disabled={isLoading}
            maxLength={2000}
            style={{
              flex: 1,
              resize: 'none',
              border: '1px solid var(--line)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.65rem 0.85rem',
              fontSize: '0.92rem',
              color: 'var(--ink)',
              background: 'var(--paper-card)',
              outline: 'none',
              transition: 'border-color 0.2s ease',
              lineHeight: 1.4
            }}
            onFocus={(e) => (e.target.style.borderColor = 'var(--blue-deep)')}
            onBlur={(e) => (e.target.style.borderColor = 'var(--line)')}
          />

          <button
            type="button"
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className="btn btn-primary"
            style={{
              height: '46px',
              padding: '0 1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              opacity: !input.trim() || isLoading ? 0.6 : 1,
              cursor: !input.trim() || isLoading ? 'not-allowed' : 'pointer'
            }}
          >
            <Send size={16} />
            <span>Send</span>
          </button>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.74rem',
          color: 'var(--ink-dim)',
          padding: '0 0.25rem'
        }}>
          <span>Conversations live strictly in browser memory and are never saved to disk.</span>
          <span>{input.length} / 2000</span>
        </div>
      </div>
    </div>
  );
};

export default ChatbotPage;
