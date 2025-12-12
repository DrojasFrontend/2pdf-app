'use client';
import Editor from '@monaco-editor/react';

export default function HtmlEditor({ value, onChange }) {
  const handleDownload = () => {
    const blob = new Blob([value], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template.html.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ position: 'relative', height: '100%', width: '100%' }}>
      <button
        onClick={handleDownload}
        title="Descargar HTML como .txt"
        style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          zIndex: 10,
          padding: '0.5rem 1rem',
          backgroundColor: '#21262d',
          color: '#c9d1d9',
          border: '1px solid #30363d',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '0.875rem',
          transition: 'background-color 0.2s',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}
        onMouseOver={(e) => {
          e.target.style.backgroundColor = '#30363d';
        }}
        onMouseOut={(e) => {
          e.target.style.backgroundColor = '#21262d';
        }}
      >
        <span>⬇</span>
        <span>Descargar HTML</span>
      </button>
      <Editor
        height="100%"
        language="html"
        theme="vs-dark"
        value={value}
        onChange={onChange}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          wordWrap: 'on',
          automaticLayout: true,
        }}
      />
    </div>
  );
}

