'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import type { ScreenInfo } from '@/lib/types';

export function InteractiveScreen({ screen, onRefresh, externalScreenInfo }: { screen: string; onRefresh: () => void; externalScreenInfo?: ScreenInfo | null }) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [screenInfo, setScreenInfo] = useState<ScreenInfo | null>(null);
  const [clicking, setClicking] = useState(false);
  const [lastClick, setLastClick] = useState<{ x: number; y: number } | null>(null);
  const [interactMode, setInteractMode] = useState(false);
  const [typingText, setTypingText] = useState('');
  const [showTypeBox, setShowTypeBox] = useState(false);
  const [hoverMode, setHoverMode] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (externalScreenInfo) {
      setScreenInfo(externalScreenInfo);
    }
  }, [externalScreenInfo]);

  useEffect(() => {
    if (!externalScreenInfo) {
      fetch('/api/screen/info').then(r => r.json()).then(setScreenInfo).catch(() => {});
    }
  }, [externalScreenInfo]);

  const handleClick = async (e: React.MouseEvent<HTMLImageElement>) => {
    if (!interactMode || !screenInfo || !imgRef.current) return;
    e.preventDefault();
    e.stopPropagation();

    const rect = imgRef.current.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width;
    const relY = (e.clientY - rect.top) / rect.height;
    const x = Math.round(relX * screenInfo.logicalWidth);
    const y = Math.round(relY * screenInfo.logicalHeight);
    const isHover = hoverMode || e.shiftKey;

    setClicking(true);
    setLastClick({ x: e.clientX - rect.left, y: e.clientY - rect.top });

    try {
      await fetch('/api/screen/click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ x, y, type: isHover ? 'hover' : 'click' }),
      });
      if (!isHover) {
        setTimeout(() => hiddenInputRef.current?.focus(), 100);
      }
      setTimeout(onRefresh, 500);
    } catch {}
    setTimeout(() => { setClicking(false); setLastClick(null); }, 500);
  };

  const handleKey = useCallback(async (key: string) => {
    try {
      await fetch('/api/screen/click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ x: 0, y: 0, type: 'key', text: key }),
      });
      setTimeout(onRefresh, 300);
    } catch {}
  }, [onRefresh]);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      containerRef.current.requestFullscreen();
    }
  };

  const handleShortcut = async (shortcut: string) => {
    try {
      await fetch('/api/screen/click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ x: 0, y: 0, type: 'shortcut', text: shortcut }),
      });
      setTimeout(onRefresh, 300);
    } catch {}
  };

  const handleType = async () => {
    if (!typingText) return;
    try {
      await fetch('/api/screen/click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ x: 0, y: 0, type: 'type', text: typingText }),
      });
      setTypingText('');
      setTimeout(onRefresh, 300);
    } catch {}
  };

  useEffect(() => {
    if (!interactMode) return;

    const keyMap: Record<string, string> = {
      Enter: 'return', Backspace: 'delete', Escape: 'escape', Tab: 'tab',
      ArrowUp: 'arrow-up', ArrowDown: 'arrow-down', ArrowLeft: 'arrow-left', ArrowRight: 'arrow-right',
      ' ': 'space',
    };

    const handleKeyDown = async (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      const mapped = keyMap[e.key];
      if (mapped) {
        e.preventDefault();
        await fetch('/api/screen/click', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ x: 0, y: 0, type: 'key', text: mapped }),
        });
        setTimeout(onRefresh, 400);
      } else if (e.key.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        await fetch('/api/screen/click', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ x: 0, y: 0, type: 'type', text: e.key }),
        });
        setTimeout(onRefresh, 800);
      } else if (e.key.length === 1 && e.metaKey) {
        e.preventDefault();
        await fetch('/api/screen/click', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ x: 0, y: 0, type: 'shortcut', text: `cmd+${e.key}` }),
        });
        setTimeout(onRefresh, 400);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [interactMode, onRefresh]);

  const handleHiddenInput = async (e: React.FormEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value;
    if (!value) return;
    e.currentTarget.value = '';
    try {
      await fetch('/api/screen/click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ x: 0, y: 0, type: 'type', text: value }),
      });
      setTimeout(onRefresh, 800);
    } catch {}
  };

  const handleHiddenKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    const keyMap: Record<string, string> = {
      Enter: 'return', Backspace: 'delete', Escape: 'escape', Tab: 'tab',
      ArrowUp: 'arrow-up', ArrowDown: 'arrow-down', ArrowLeft: 'arrow-left', ArrowRight: 'arrow-right',
    };
    const mapped = keyMap[e.key];
    if (mapped) {
      e.preventDefault();
      await handleKey(mapped);
    }
  };

  const btnStyle = "px-2.5 py-1 rounded text-[11px] font-medium transition-all";
  const btnDefault = `${btnStyle} border`;
  const btnDefaultStyle = { background: 'var(--bg-elevated)', borderColor: 'var(--border-dim)', color: 'var(--text-secondary)' };

  return (
    <div ref={containerRef} className="space-y-2" style={{ background: 'var(--bg-primary)' }}>
      <div className="flex flex-wrap items-center gap-1.5">
        <button
          onClick={() => setInteractMode(!interactMode)}
          className={`${btnStyle} border`}
          style={interactMode ? { background: 'rgba(0,255,200,0.15)', borderColor: 'var(--accent-cyan)', color: 'var(--accent-cyan)' } : btnDefaultStyle}
        >
          {interactMode ? '◉ INTERACTIVE' : '○ INTERACTIVE'}
        </button>
        {interactMode && (
          <>
            <button
              onClick={() => setHoverMode(!hoverMode)}
              className={`${btnStyle} border`}
              style={hoverMode ? { background: 'rgba(255,214,0,0.15)', borderColor: 'var(--accent-yellow)', color: 'var(--accent-yellow)' } : btnDefaultStyle}
            >
              {hoverMode ? '◉ HOVER' : '○ HOVER'}
            </button>
            <button onClick={() => { setShowTypeBox(!showTypeBox); hiddenInputRef.current?.focus(); }} className={btnDefault} style={btnDefaultStyle}>
              TYPE
            </button>
            <span className="mx-1" style={{ color: 'var(--border-dim)' }}>│</span>
            {['return:↵', 'escape:ESC', 'space:SPC', 'tab:TAB', 'delete:⌫'].map(k => {
              const [key, label] = k.split(':');
              return <button key={key} onClick={() => handleKey(key)} className={btnDefault} style={btnDefaultStyle}>{label}</button>;
            })}
            <span className="mx-1" style={{ color: 'var(--border-dim)' }}>│</span>
            {['cmd+a:⌘A', 'cmd+c:⌘C', 'cmd+v:⌘V'].map(k => {
              const [key, label] = k.split(':');
              return <button key={key} onClick={() => handleShortcut(key)} className={btnDefault} style={btnDefaultStyle}>{label}</button>;
            })}
          </>
        )}
        <div className="ml-auto flex gap-1.5">
          <button onClick={toggleFullscreen} className={btnDefault} style={btnDefaultStyle}>⛶ FULL</button>
          <button onClick={onRefresh} className={btnDefault} style={btnDefaultStyle}>↻ CAPTURE</button>
        </div>
      </div>

      {showTypeBox && (
        <div className="flex gap-2">
          <input
            type="text"
            value={typingText}
            onChange={(e) => setTypingText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleType()}
            placeholder="Type text and press Enter..."
            className="flex-1 rounded px-3 py-1.5 text-sm"
            autoFocus
          />
          <button onClick={handleType} className={btnDefault} style={{ background: 'rgba(0,255,200,0.1)', borderColor: 'var(--accent-cyan)', color: 'var(--accent-cyan)' }}>
            SEND
          </button>
        </div>
      )}

      <div className="relative rounded overflow-hidden border" style={{ borderColor: 'var(--border-dim)' }}>
        {screen ? (
          <>
            <img
              ref={imgRef}
              src={screen}
              alt="Screen"
              className={`w-full h-auto ${interactMode ? (hoverMode ? 'cursor-pointer' : 'cursor-crosshair') : ''}`}
              style={interactMode ? { touchAction: 'none', userSelect: 'none', WebkitUserSelect: 'none' } : undefined}
              onClick={handleClick}
              onTouchEnd={(e) => { if (interactMode) e.preventDefault(); }}
              draggable={false}
            />
            {clicking && lastClick && (
              <div
                className="absolute w-5 h-5 rounded-full border -translate-x-1/2 -translate-y-1/2 animate-ping pointer-events-none"
                style={{
                  left: lastClick.x, top: lastClick.y,
                  borderColor: hoverMode ? 'var(--accent-yellow)' : 'var(--accent-cyan)',
                  background: hoverMode ? 'rgba(255,214,0,0.3)' : 'rgba(0,255,200,0.3)',
                }}
              />
            )}
            {interactMode && (
              <>
                <div className="absolute bottom-2 left-2 px-2 py-1 rounded text-[10px]" style={{ background: 'rgba(0,0,0,0.8)', color: 'var(--accent-cyan)' }}>
                  {hoverMode ? 'TAP → HOVER · SHIFT+TAP → CLICK' : 'TAP → CLICK · SHIFT+TAP → HOVER'}
                </div>
                <input
                  ref={hiddenInputRef}
                  type="text"
                  autoCapitalize="off"
                  autoCorrect="off"
                  autoComplete="off"
                  spellCheck={false}
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 opacity-[0.01] text-[1px]"
                  onInput={handleHiddenInput}
                  onKeyDown={handleHiddenKeyDown}
                />
              </>
            )}
          </>
        ) : (
          <div className="h-96 flex items-center justify-center" style={{ color: 'var(--text-dim)' }}>
            <span className="animate-pulse-glow">◈ Capturing screen...</span>
          </div>
        )}
      </div>
    </div>
  );
}
