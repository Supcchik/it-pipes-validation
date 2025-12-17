'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AssetType } from '@/lib/types/asset-list';
import { getAssetTypeLabel } from '@/lib/utils/asset-type-utils';

interface AssetTypeSelectorProps {
  activeType: AssetType;
  counts: {
    ML: number;
    MH: number;
    L: number;
  };
  onTypeChange: (type: AssetType) => void;
  loading?: boolean;
}

export default function AssetTypeSelector({
  activeType,
  counts,
  onTypeChange,
  loading = false
}: AssetTypeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const types: AssetType[] = ['ML', 'MH', 'L'];

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setFocusedIndex(null);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (!isOpen) {
        // Open dropdown with Enter or Space
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          setIsOpen(true);
        }
        return;
      }

      switch (event.key) {
        case 'Escape':
          event.preventDefault();
          setIsOpen(false);
          setFocusedIndex(null);
          buttonRef.current?.focus();
          break;
        case 'ArrowDown':
          event.preventDefault();
          setFocusedIndex((prev) => {
            if (prev === null) return 0;
            return Math.min(prev + 1, types.length - 1);
          });
          break;
        case 'ArrowUp':
          event.preventDefault();
          setFocusedIndex((prev) => {
            if (prev === null) return types.length - 1;
            return Math.max(prev - 1, 0);
          });
          break;
        case 'Enter':
          event.preventDefault();
          if (focusedIndex !== null) {
            handleTypeSelect(types[focusedIndex]);
          }
          break;
      }
    }

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, focusedIndex, types]);

  const handleTypeSelect = (type: AssetType) => {
    if (type !== activeType && !loading) {
      onTypeChange(type);
    }
    setIsOpen(false);
    setFocusedIndex(null);
    buttonRef.current?.focus();
  };

  const handleButtonClick = () => {
    if (!loading) {
      setIsOpen(!isOpen);
      if (!isOpen) {
        setFocusedIndex(types.indexOf(activeType));
      }
    }
  };

  return (
    <div className="relative">
      {/* Button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={handleButtonClick}
        disabled={loading}
        className={cn(
          'h-10 px-3 rounded-lg border border-neutral-300 bg-white',
          'flex items-center gap-2',
          'text-sm font-medium',
          'transition-colors',
          'hover:bg-neutral-50 hover:border-neutral-400',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          isOpen && 'bg-neutral-50 border-neutral-400'
        )}
        aria-label="Select asset type"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className="text-neutral-500 font-normal">Asset:</span>
        <span className="text-neutral-900 font-medium">
          {loading ? '⏳' : activeType}
        </span>
        <ChevronDown
          className={cn(
            'w-4 h-4 text-neutral-400 transition-transform',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/10 z-[998]"
            onClick={() => {
              setIsOpen(false);
              setFocusedIndex(null);
            }}
          />

          {/* Dropdown Menu */}
          <div
            ref={dropdownRef}
            className="absolute top-12 left-0 w-60 bg-white border border-neutral-200 rounded-lg shadow-lg z-[999]"
            role="listbox"
          >
            {/* Header */}
            <div className="px-4 py-2 border-b border-neutral-200">
              <h3 className="text-sm font-semibold text-neutral-900">Asset Type</h3>
            </div>

            {/* Options */}
            <div className="py-1">
              {types.map((type, index) => {
                const isActive = type === activeType;
                const isFocused = focusedIndex === index;
                const count = counts[type];

                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleTypeSelect(type)}
                    className={cn(
                      'w-full px-4 py-2.5 flex items-center justify-between',
                      'text-sm transition-colors',
                      'hover:bg-neutral-50',
                      'focus:outline-none',
                      isActive && 'bg-blue-50 text-blue-700',
                      isFocused && !isActive && 'bg-neutral-100'
                    )}
                    role="option"
                    aria-selected={isActive}
                  >
                    <div className="flex items-center gap-3">
                      {/* Radio button */}
                      <div
                        className={cn(
                          'w-4 h-4 rounded-full border-2 flex items-center justify-center',
                          isActive
                            ? 'border-blue-600 bg-blue-600'
                            : 'border-neutral-300'
                        )}
                      >
                        {isActive && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>
                      {/* Label */}
                      <span className={cn('font-medium', isActive && 'text-blue-700')}>
                        {getAssetTypeLabel(type)}
                      </span>
                    </div>
                    {/* Count */}
                    <span className="text-xs text-neutral-500">
                      ({count})
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}


