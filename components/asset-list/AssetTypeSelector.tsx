'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AssetType } from '@/lib/types/asset-list';
import { getAssetTypeLabel } from '@/lib/utils/asset-type-utils';

interface AssetTypeSelectorProps {
  activeTypes: AssetType[];
  counts: {
    ML: number;
    MH: number;
    L: number;
  };
  onTypesChange: (types: AssetType[]) => void;
  loading?: boolean;
}

/** Лейбл для пункту: "Manholes (MH)", "Mainlines (ML)", "Laterals (L)" */
function getOptionLabel(type: AssetType): string {
  const base = getAssetTypeLabel(type);
  return `${base} (${type})`;
}

export default function AssetTypeSelector({
  activeTypes,
  onTypesChange,
  loading = false
}: AssetTypeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const types: AssetType[] = ['MH', 'ML', 'L'];
  // Single-select: поточний тип — перший з масиву або ML
  const currentType: AssetType = activeTypes.length > 0 ? activeTypes[0] : 'ML';
  // У кнопці — тільки скорочення (ML, MH, L); повна назва лише в дропдауні
  const displayText = currentType;

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
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (!isOpen) {
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
        case ' ':
          event.preventDefault();
          if (focusedIndex !== null && focusedIndex >= 0 && focusedIndex < types.length) {
            handleSelect(types[focusedIndex]);
          }
          break;
      }
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, focusedIndex]);

  const handleSelect = (type: AssetType) => {
    if (loading) return;
    onTypesChange([type]);
    setIsOpen(false);
    setFocusedIndex(null);
  };

  const handleButtonClick = () => {
    if (!loading) {
      setIsOpen(!isOpen);
      if (!isOpen) {
        const idx = types.indexOf(currentType);
        setFocusedIndex(idx >= 0 ? idx : 0);
      }
    }
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={handleButtonClick}
        disabled={loading}
        className={cn(
          'h-10 px-4 py-2 rounded-lg border border-[#E4E4E7] bg-white',
          'flex items-center gap-2',
          'text-sm text-[#312C29]',
          'transition-colors',
          'hover:bg-neutral-50 hover:border-[#D4D4D8]',
          'focus:outline-none focus:ring-2 focus:ring-[#E86F25] focus:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          isOpen && 'bg-neutral-50 border-[#D4D4D8]'
        )}
        aria-label="Select asset type"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className="font-normal">Asset:</span>
        <span className="font-medium">
          {loading ? '⏳' : displayText}
        </span>
        <ChevronDown
          className={cn(
            'w-4 h-4 text-[#09090B] transition-transform',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/10 z-[998]"
            onClick={() => {
              setIsOpen(false);
              setFocusedIndex(null);
            }}
          />
          <div
            ref={dropdownRef}
            className="absolute top-12 left-0 min-w-[200px] bg-white border border-[#E4E4E7] rounded-lg shadow-lg z-[999] p-1 flex flex-col"
            role="listbox"
          >
            {types.map((type, index) => {
              const isSelected = currentType === type;
              const isFocused = focusedIndex === index;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleSelect(type)}
                  className={cn(
                    'w-full px-2 py-2 rounded text-left flex items-center gap-4',
                    'text-sm font-normal text-[#18181B] leading-5',
                    'transition-colors',
                    'hover:bg-[#F4F4F5]',
                    'focus:outline-none',
                    isFocused && 'bg-[#F4F4F5]'
                  )}
                  role="option"
                  aria-selected={isSelected}
                >
                  <span className="text-[14px] font-normal text-[#18181B] leading-5">
                    {getOptionLabel(type)}
                  </span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
