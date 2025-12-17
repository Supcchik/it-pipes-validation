'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AssetType } from '@/lib/types/asset-list';
import { 
  getAssetTypeLabel, 
  formatActiveTypes, 
  areAllTypesSelected,
  isTypeActive,
  toggleType,
  setAllTypes
} from '@/lib/utils/asset-type-utils';

interface AssetTypeSelectorProps {
  activeTypes: AssetType[]; // Тепер масив типів
  counts: {
    ML: number;
    MH: number;
    L: number;
  };
  onTypesChange: (types: AssetType[]) => void; // Змінено на множинний вибір
  loading?: boolean;
}

export default function AssetTypeSelector({
  activeTypes,
  counts,
  onTypesChange,
  loading = false
}: AssetTypeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const types: AssetType[] = ['ML', 'MH', 'L'];
  const allSelected = areAllTypesSelected(activeTypes);
  const displayText = formatActiveTypes(activeTypes);

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

      const totalItems = types.length + 1; // +1 for "Show All" checkbox

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
            return Math.min(prev + 1, totalItems - 1);
          });
          break;
        case 'ArrowUp':
          event.preventDefault();
          setFocusedIndex((prev) => {
            if (prev === null) return totalItems - 1;
            return Math.max(prev - 1, 0);
          });
          break;
        case 'Enter':
        case ' ':
          event.preventDefault();
          if (focusedIndex !== null) {
            if (focusedIndex < types.length) {
              handleTypeToggle(types[focusedIndex]);
            } else {
              // "Show All" checkbox
              handleSelectAll(!allSelected);
            }
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
  }, [isOpen, focusedIndex, types, allSelected]);

  const handleTypeToggle = (type: AssetType) => {
    if (loading) return;
    const newTypes = toggleType(activeTypes, type);
    onTypesChange(newTypes);
  };

  const handleSelectAll = (selectAll: boolean) => {
    if (loading) return;
    const newTypes = setAllTypes(selectAll);
    onTypesChange(newTypes);
  };

  const handleButtonClick = () => {
    if (!loading) {
      setIsOpen(!isOpen);
      if (!isOpen) {
        // Set focus to first selected type or first item
        const firstSelectedIndex = types.findIndex(t => isTypeActive(activeTypes, t));
        setFocusedIndex(firstSelectedIndex >= 0 ? firstSelectedIndex : 0);
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
        aria-label="Select asset types"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className="text-neutral-500 font-normal">Asset:</span>
        <span className="text-neutral-900 font-medium">
          {loading ? '⏳' : displayText}
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
                const isChecked = isTypeActive(activeTypes, type);
                const isFocused = focusedIndex === index;
                const count = counts[type];

                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleTypeToggle(type)}
                    className={cn(
                      'w-full px-4 py-2.5 flex items-center justify-between',
                      'text-sm transition-colors',
                      'hover:bg-neutral-50',
                      'focus:outline-none',
                      isChecked && 'bg-blue-50 text-blue-700',
                      isFocused && !isChecked && 'bg-neutral-100'
                    )}
                    role="option"
                    aria-selected={isChecked}
                  >
                    <div className="flex items-center gap-3">
                      {/* Checkbox */}
                      <div
                        className={cn(
                          'w-4 h-4 rounded border-2 flex items-center justify-center transition-colors',
                          isChecked
                            ? 'border-blue-600 bg-blue-600'
                            : 'border-neutral-300 bg-white'
                        )}
                      >
                        {isChecked && (
                          <Check className="w-3 h-3 text-white" />
                        )}
                      </div>
                      {/* Label */}
                      <span className={cn('font-medium', isChecked && 'text-blue-700')}>
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
              
              {/* Divider */}
              <div className="h-px bg-neutral-200 my-1" />
              
              {/* Show All Types checkbox */}
              <button
                type="button"
                onClick={() => handleSelectAll(!allSelected)}
                className={cn(
                  'w-full px-4 py-2.5 flex items-center gap-3',
                  'text-sm transition-colors',
                  'hover:bg-neutral-50',
                  'focus:outline-none',
                  allSelected && 'bg-blue-50 text-blue-700',
                  focusedIndex === types.length && !allSelected && 'bg-neutral-100'
                )}
                role="option"
                aria-selected={allSelected}
              >
                {/* Checkbox */}
                <div
                  className={cn(
                    'w-4 h-4 rounded border-2 flex items-center justify-center transition-colors',
                    allSelected
                      ? 'border-blue-600 bg-blue-600'
                      : 'border-neutral-300 bg-white'
                  )}
                >
                  {allSelected && (
                    <Check className="w-3 h-3 text-white" />
                  )}
                </div>
                {/* Label */}
                <span className={cn('font-medium', allSelected && 'text-blue-700')}>
                  Show All Types
                </span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
