'use client';

import React from 'react';

export function renderMarkdown(text: string) {
  const parts = text.split(/(```[\s\S]*?```)/g);

  return parts.map((part, i) => {
    if (part.startsWith('```') && part.endsWith('```')) {
      const inner = part.slice(3, -3);
      const firstNewline = inner.indexOf('\n');
      const code = firstNewline > -1 ? inner.slice(firstNewline + 1) : inner;
      const lang = firstNewline > -1 ? inner.slice(0, firstNewline).trim() : '';
      return (
        <pre key={i} className="my-2 p-3 rounded overflow-x-auto text-[11px]" style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-dim)' }}>
          {lang && <div className="text-[9px] mb-1 uppercase tracking-wider" style={{ color: 'var(--text-dim)' }}>{lang}</div>}
          <code style={{ color: 'var(--accent-cyan)' }}>{code}</code>
        </pre>
      );
    }

    const lines = part.split('\n');
    return lines.map((line, li) => {
      const h3 = line.match(/^### (.+)/);
      if (h3) return <div key={`${i}-${li}`} className="text-[13px] font-bold mt-2 mb-1" style={{ color: 'var(--accent-cyan)' }}>{h3[1]}</div>;
      const h2 = line.match(/^## (.+)/);
      if (h2) return <div key={`${i}-${li}`} className="text-[14px] font-bold mt-2 mb-1" style={{ color: 'var(--accent-cyan)' }}>{h2[1]}</div>;
      const h1 = line.match(/^# (.+)/);
      if (h1) return <div key={`${i}-${li}`} className="text-[15px] font-bold mt-2 mb-1" style={{ color: 'var(--accent-cyan)' }}>{h1[1]}</div>;

      const bullet = line.match(/^(\s*)[•\-\*] (.+)/);
      if (bullet) {
        const indent = Math.min(Math.floor(bullet[1].length / 2), 3);
        return <div key={`${i}-${li}`} style={{ paddingLeft: `${indent * 16 + 8}px`, color: 'var(--text-primary)' }}>• {renderInline(bullet[2])}</div>;
      }

      if (!line.trim()) return <div key={`${i}-${li}`} className="h-2" />;

      return <div key={`${i}-${li}`}>{renderInline(line)}</div>;
    });
  });
}

export function renderInline(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const regex = /(\*\*(.+?)\*\*|__(.+?)__|`([^`]+)`|\*(.+?)\*|_(.+?)_|\[([^\]]+)\]\(([^)]+)\))/g;
  let lastIndex = 0;
  let match;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    if (match[2] || match[3]) {
      nodes.push(<strong key={key++} style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{match[2] || match[3]}</strong>);
    } else if (match[4]) {
      nodes.push(<code key={key++} className="px-1 py-0.5 rounded text-[11px]" style={{ background: 'rgba(0,255,200,0.1)', color: 'var(--accent-cyan)' }}>{match[4]}</code>);
    } else if (match[5] || match[6]) {
      nodes.push(<em key={key++} style={{ fontStyle: 'italic', color: 'var(--text-secondary)' }}>{match[5] || match[6]}</em>);
    } else if (match[7] && match[8]) {
      nodes.push(<a key={key++} href={match[8]} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-cyan)', textDecoration: 'underline' }}>{match[7]}</a>);
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes.length > 0 ? nodes : [text];
}
