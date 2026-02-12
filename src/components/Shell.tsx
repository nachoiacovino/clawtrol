'use client';

import { useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { MODULE_COMPONENTS } from '@/components/modules';
import { MODULE_META } from '@/lib/config';
import type { ModuleId } from '@/lib/config';
import config from '../../clawtrol.config';

const enabledModules = config.modules ?? Object.keys(MODULE_META) as ModuleId[];

export default function Shell() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const tabFromUrl = searchParams.get('tab') as ModuleId | null;
  const initialTab: ModuleId = tabFromUrl && enabledModules.includes(tabFromUrl) ? tabFromUrl : enabledModules[0];

  const [activeTab, setActiveTabState] = useState<ModuleId>(initialTab);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const setActiveTab = useCallback((tab: ModuleId) => {
    setActiveTabState(tab);
    router.push(`?tab=${tab}`, { scroll: false });
  }, [router]);

  const tabs = enabledModules.map(id => ({
    id,
    label: MODULE_META[id].label.toUpperCase(),
    icon: MODULE_META[id].icon,
  }));

  const ActiveModule = MODULE_COMPONENTS[activeTab];

  return (
    <div className="min-h-screen relative" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b" style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-dim)' }}>
        <div className="max-w-[1400px] mx-auto px-4 py-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded flex items-center justify-center text-lg" style={{ background: 'rgba(0,255,200,0.1)', border: '1px solid rgba(0,255,200,0.2)' }}>
              👾
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-[0.2em] uppercase" style={{ fontFamily: 'var(--font-orbitron)', color: 'var(--accent-cyan)' }}>
                {config.title ?? 'Clawtrol'}
              </h1>
              <p className="text-[10px] tracking-wider" style={{ color: 'var(--text-dim)' }}>
                CONTROL CENTER
              </p>
            </div>
          </div>
        </div>

        {/* Mobile: Current tab + hamburger */}
        <div className="md:hidden max-w-[1400px] mx-auto px-4 py-2 flex justify-between items-center border-t" style={{ borderColor: 'var(--border-dim)' }}>
          <div className="flex items-center gap-2">
            <span className="text-[10px]" style={{ color: 'var(--accent-cyan)' }}>{tabs.find(t => t.id === activeTab)?.icon}</span>
            <span className="text-[10px] tracking-[0.15em] font-medium" style={{ color: 'var(--accent-cyan)' }}>{tabs.find(t => t.id === activeTab)?.label}</span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-8 h-8 rounded border transition-colors flex items-center justify-center"
            style={{ borderColor: 'var(--border-accent)', color: 'var(--accent-cyan)', background: 'rgba(0,255,200,0.05)' }}
          >
            <span className="text-sm">{mobileMenuOpen ? '✕' : '☰'}</span>
          </button>
        </div>

        {/* Mobile menu overlay */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 border-b z-50" style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-dim)' }}>
            <div className="max-w-[1400px] mx-auto p-2 grid grid-cols-2 gap-1">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setMobileMenuOpen(false); }}
                  className="px-3 py-2.5 rounded text-left transition-colors"
                  style={activeTab === tab.id
                    ? { background: 'rgba(0,255,200,0.1)', color: 'var(--accent-cyan)' }
                    : { background: 'var(--bg-secondary)', color: 'var(--text-dim)' }
                  }
                >
                  <span className="mr-2">{tab.icon}</span>
                  <span className="text-[10px] tracking-[0.1em]">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Desktop tabs */}
        <div className="hidden md:flex max-w-[1400px] mx-auto px-4 gap-0 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-[10px] tracking-[0.15em] font-medium transition-all whitespace-nowrap border-b-2 ${
                activeTab === tab.id ? 'tab-active' : ''
              }`}
              style={activeTab === tab.id ? {} : { color: 'var(--text-dim)', borderColor: 'transparent' }}
            >
              <span className="mr-1.5">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-[1400px] mx-auto p-4 pt-28 md:pt-24 space-y-3 relative z-10 overflow-x-hidden">
        <ActiveModule />
      </main>

      {/* Footer */}
      <footer className="text-center py-3" style={{ color: 'var(--text-dim)' }}>
        <div className="text-[9px] tracking-[0.3em] uppercase" style={{ fontFamily: 'var(--font-orbitron)' }}>
          {config.title ?? 'Clawtrol'} · CONTROL CENTER
        </div>
      </footer>
    </div>
  );
}
