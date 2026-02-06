'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

export type DisplayDensity = 'compact' | 'comfortable';

interface DisplayDensityContextValue {
  displayDensity: DisplayDensity;
  setDisplayDensity: (density: DisplayDensity) => void;
}

const DisplayDensityContext = createContext<DisplayDensityContextValue | null>(null);

export function DisplayDensityProvider({ children }: { children: React.ReactNode }) {
  const [displayDensity, setDisplayDensityState] = useState<DisplayDensity>('comfortable');
  const setDisplayDensity = useCallback((density: DisplayDensity) => setDisplayDensityState(density), []);
  const value: DisplayDensityContextValue = { displayDensity, setDisplayDensity };
  return (
    <DisplayDensityContext.Provider value={value}>
      {children}
    </DisplayDensityContext.Provider>
  );
}

export function useDisplayDensity(): DisplayDensityContextValue {
  const ctx = useContext(DisplayDensityContext);
  if (!ctx) {
    throw new Error('useDisplayDensity must be used within DisplayDensityProvider');
  }
  return ctx;
}

/** Безпечний хук: повертає displayDensity і setDisplayDensity або null */
export function useDisplayDensityOptional(): DisplayDensityContextValue | null {
  return useContext(DisplayDensityContext);
}
