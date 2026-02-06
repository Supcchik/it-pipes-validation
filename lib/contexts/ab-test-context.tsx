'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

/** Варіант A/B тестування Columns–Filters: A = Smart Auto-Add, B = Context-Aware Filters */
export type ABVariant = 'A' | 'B';

interface ABTestContextValue {
  variant: ABVariant;
  setVariant: (v: ABVariant) => void;
}

const ABTestContext = createContext<ABTestContextValue | null>(null);

export function ABTestProvider({ children }: { children: React.ReactNode }) {
  const [variant, setVariantState] = useState<ABVariant>('A');
  const setVariant = useCallback((v: ABVariant) => setVariantState(v), []);
  const value: ABTestContextValue = { variant, setVariant };
  return (
    <ABTestContext.Provider value={value}>
      {children}
    </ABTestContext.Provider>
  );
}

export function useABTest(): ABTestContextValue {
  const ctx = useContext(ABTestContext);
  if (!ctx) {
    throw new Error('useABTest must be used within ABTestProvider');
  }
  return ctx;
}

/** Безпечний хук: повертає variant і setVariant або null якщо провайдер відсутній */
export function useABTestOptional(): ABTestContextValue | null {
  return useContext(ABTestContext);
}
