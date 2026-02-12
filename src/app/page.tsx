'use client';

import { Suspense } from 'react';
import Shell from '@/components/Shell';

export default function Page() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#050508', color: '#00ffc8' }}>
        <span className="animate-pulse">Loading...</span>
      </div>
    }>
      <Shell />
    </Suspense>
  );
}
