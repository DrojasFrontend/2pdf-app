'use client';
import { useState } from 'react';
import { CopyIcon } from './Icons';

export default function ApiKeyRevealModal({ isOpen, onClose, apiKey }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !apiKey) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(apiKey.key);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Error copying to clipboard:', err);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          backgroundColor: '#161b22',
          border: '1px solid #30363d',
          borderRadius: '8px',
          padding: '24px',
          width: '90%',
          maxWidth: '600px',
          color: '#c9d1d9',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px',
          marginBottom: '16px',
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: 'rgba(35, 134, 54, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
          }}>
            🔑
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', margin: 0 }}>
              API Key Creada
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#8b949e', margin: 0 }}>
              {apiKey.name}
            </p>
          </div>
        </div>

        <div style={{
          backgroundColor: 'rgba(248, 81, 73, 0.1)',
          border: '1px solid rgba(248, 81, 73, 0.3)',
          borderRadius: '6px',
          padding: '12px',
          marginBottom: '16px',
        }}>
          <p style={{ 
            fontSize: '0.875rem', 
            color: '#f85149', 
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <span style={{ fontSize: '16px' }}>⚠️</span>
            <strong>Importante:</strong> Esta es la única vez que verás esta API Key. Cópiala y guárdala en un lugar seguro.
          </p>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontSize: '0.875rem',
            fontWeight: '500',
          }}>
            Tu API Key:
          </label>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <code style={{
              flex: 1,
              padding: '12px 16px',
              backgroundColor: '#0d1117',
              border: '1px solid #30363d',
              borderRadius: '6px',
              fontFamily: 'monospace',
              fontSize: '14px',
              color: '#58a6ff',
              wordBreak: 'break-all',
            }}>
              {apiKey.key}
            </code>
            <button
              onClick={handleCopy}
              style={{
                padding: '12px 16px',
                backgroundColor: copied ? '#238636' : '#21262d',
                color: '#fff',
                border: '1px solid #30363d',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.875rem',
                fontWeight: '500',
                transition: 'background-color 0.2s',
                whiteSpace: 'nowrap',
              }}
            >
              {copied ? (
                <>
                  <span>✓</span>
                  Copiado
                </>
              ) : (
                <>
                  <CopyIcon />
                  Copiar
                </>
              )}
            </button>
          </div>
        </div>

        <div style={{
          backgroundColor: '#0d1117',
          border: '1px solid #30363d',
          borderRadius: '6px',
          padding: '16px',
          marginBottom: '20px',
        }}>
          <p style={{ 
            fontSize: '0.875rem', 
            color: '#8b949e', 
            margin: '0 0 12px 0',
          }}>
            Usa esta key en tus requests:
          </p>
          <code style={{
            display: 'block',
            fontFamily: 'monospace',
            fontSize: '13px',
            color: '#c9d1d9',
            whiteSpace: 'pre-wrap',
          }}>
{`curl -X POST https://api.2pdf.net/v1/documents \\
  -H "X-API-Key: ${apiKey.key}" \\
  -H "Content-Type: application/json" \\
  -d '{"template_id": "...", "data": {...}}'`}
          </code>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 24px',
              backgroundColor: '#238636',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500',
            }}
          >
            Entendido, ya la copié
          </button>
        </div>
      </div>
    </div>
  );
}

