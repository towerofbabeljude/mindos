import React, { useState, useEffect } from 'react';
import { askGemini, checkAiHealth } from './aiApi';
import { Sparkles, Send, AlertCircle, Bot, RefreshCw, CheckCircle2, Copy, Check } from 'lucide-react';

export const AIPage = () => {
  const [prompt, setPrompt] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [health, setHealth] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Initial health check
    checkAiHealth()
      .then((data) => {
        if (!data.error) setHealth(data);
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!prompt.trim() || loading) return;

    setError(null);
    setLoading(true);
    setAnswer('');

    const result = await askGemini(prompt);

    if (result.error) {
      setError(result.error);
    } else {
      setAnswer(result.answer || 'No response text received.');
    }

    setLoading(false);
  };

  const handleCopy = () => {
    if (!answer) return;
    navigator.clipboard.writeText(answer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSuggestedPrompt = (suggested) => {
    setPrompt(suggested);
  };

  const suggestions = [
    "How can I manage study burnout and mental fatigue effectively?",
    "Give me a 5-minute breathing and grounding reset technique.",
    "What are practical tips to balance multiple academic assignment deadlines?",
    "How does restorative sleep impact cognitive memory and focus?"
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '860px', margin: '0 auto' }}>
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.35rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, var(--blue-deep) 0%, var(--green-deep) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 14px var(--blue-glow)'
            }}>
              <Bot size={24} />
            </div>
            <div>
              <h1 style={{
                fontSize: '2rem',
                fontWeight: 700,
                color: 'var(--ink)',
                fontFamily: 'var(--font-heading)',
                margin: 0,
                lineHeight: 1.2
              }}>
                Gemini AI Assistant
              </h1>
              <p style={{ fontSize: '0.92rem', color: 'var(--ink-soft)', margin: '0.15rem 0 0 0' }}>
                Isolated intelligent wellbeing & academic companion powered by Google Gemini.
              </p>
            </div>
          </div>

          {health && (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.75rem',
              fontWeight: 600,
              padding: '0.3rem 0.75rem',
              borderRadius: '999px',
              background: health.configured ? 'var(--green-tint)' : 'var(--amber-tint)',
              color: health.configured ? 'var(--green-deep)' : 'var(--amber-deep)',
              border: `1px solid ${health.configured ? 'var(--green-border)' : 'var(--amber-border)'}`
            }}>
              <span style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: health.configured ? 'var(--green-deep)' : 'var(--amber-deep)'
              }} />
              <span>{health.model || 'Gemini Flash'} {health.configured ? 'Active' : 'Unconfigured'}</span>
            </div>
          )}
        </div>
      </div>

      {/* Suggested prompts chips */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Suggested Prompts:
        </span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {suggestions.map((text, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSuggestedPrompt(text)}
              className="btn btn-secondary btn-sm"
              style={{
                fontSize: '0.8rem',
                padding: '0.35rem 0.75rem',
                borderRadius: '999px',
                textAlign: 'left'
              }}
            >
              {text}
            </button>
          ))}
        </div>
      </div>

      {/* Prompt Form Input Card */}
      <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <label htmlFor="gemini-prompt" style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--ink)' }}>
          Ask a Question or Request Advice:
        </label>

        <textarea
          id="gemini-prompt"
          rows={4}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask Gemini anything regarding mental stamina, stress management, schedule balancing, or general questions..."
          className="input-field"
          style={{
            width: '100%',
            resize: 'vertical',
            padding: '0.85rem',
            fontSize: '0.95rem',
            lineHeight: 1.5,
            borderRadius: '10px'
          }}
          disabled={loading}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              handleSubmit(e);
            }
          }}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--ink-dim)' }}>
            Press <kbd style={{ padding: '0.15rem 0.35rem', background: 'var(--paper-deep)', borderRadius: '4px', border: '1px solid var(--line)' }}>Ctrl</kbd> + <kbd style={{ padding: '0.15rem 0.35rem', background: 'var(--paper-deep)', borderRadius: '4px', border: '1px solid var(--line)' }}>Enter</kbd> to submit
          </span>

          <div style={{ display: 'flex', gap: '0.65rem' }}>
            {prompt && !loading && (
              <button
                type="button"
                onClick={() => setPrompt('')}
                className="btn btn-secondary btn-sm"
              >
                Clear
              </button>
            )}
            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className="btn btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.6rem 1.4rem',
                opacity: loading || !prompt.trim() ? 0.6 : 1,
                cursor: loading || !prompt.trim() ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? (
                <>
                  <RefreshCw size={16} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                  <span>Thinking...</span>
                </>
              ) : (
                <>
                  <Send size={16} />
                  <span>Ask Gemini</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Error Alert Display */}
      {error && (
        <div
          className="glass-panel"
          style={{
            padding: '1rem 1.25rem',
            background: 'var(--rose-tint)',
            border: '1px solid var(--rose-border)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
            color: 'var(--rose-deep)',
            borderRadius: '12px'
          }}
        >
          <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.92rem', marginBottom: '0.2rem' }}>
              Unable to complete AI request
            </div>
            <div style={{ fontSize: '0.88rem', lineHeight: 1.4 }}>
              {error}
            </div>
          </div>
        </div>
      )}

      {/* Answer Display Card */}
      {answer && (
        <div
          className="glass-panel"
          style={{
            padding: '1.75rem',
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(180deg, var(--paper-card) 0%, var(--paper-deep) 100%)',
            border: '1px solid var(--line)',
            boxShadow: 'var(--shadow-soft)',
            animation: 'fadeIn 0.3s ease'
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: '0.75rem',
            marginBottom: '1rem',
            borderBottom: '1px solid var(--line-subtle)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={18} color="var(--blue-deep)" />
              <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--ink)', fontFamily: 'var(--font-heading)' }}>
                Gemini Response
              </span>
            </div>

            <button
              onClick={handleCopy}
              className="btn btn-secondary btn-sm"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.3rem 0.65rem',
                fontSize: '0.8rem'
              }}
              title="Copy response text"
            >
              {copied ? (
                <>
                  <Check size={14} color="var(--green-deep)" />
                  <span style={{ color: 'var(--green-deep)' }}>Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={14} />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          <div style={{
            fontSize: '0.95rem',
            lineHeight: 1.65,
            color: 'var(--ink)',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            fontFamily: 'var(--font-body)'
          }}>
            {answer}
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};
