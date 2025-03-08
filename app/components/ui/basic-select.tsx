import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}

interface SelectItemProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

// Custom Select component that doesn't use Radix UI
export function BasicSelect({
  value,
  onValueChange,
  placeholder = 'Select an option',
  disabled = false,
  className,
  children,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [displayValue, setDisplayValue] = useState('');
  const selectRef = useRef<HTMLDivElement>(null);

  // Find the display label for the currently selected value
  useEffect(() => {
    // Default to placeholder
    let label = placeholder;

    // Iterate through children to find the matching value
    React.Children.forEach(children, (child) => {
      if (React.isValidElement(child) && child.props.value === value) {
        label = child.props.children;
      }
    });

    setDisplayValue(label);
  }, [value, children, placeholder]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [selectRef]);

  // Handle selection of an item
  const handleSelect = (newValue: string) => {
    onValueChange(newValue || 'default-value'); // Ensure it's never empty
    setIsOpen(false);
  };

  return (
    <div ref={selectRef} className={cn('relative w-full', className)}>
      <button
        type='button'
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={cn(
          'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
        disabled={disabled}
        aria-expanded={isOpen}
      >
        <span className='truncate'>{displayValue}</span>
        <ChevronDown className='h-4 w-4 opacity-50' />
      </button>

      {isOpen && (
        <div className='absolute z-50 w-full min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-80 mt-1'>
          <div className='p-1 max-h-60 overflow-auto'>
            {React.Children.map(children, (child) => {
              if (React.isValidElement(child)) {
                return React.cloneElement(
                  child as React.ReactElement<SelectItemProps>,
                  {
                    onSelect: () =>
                      handleSelect(child.props.value || 'default-value'),
                  }
                );
              }
              return child;
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// Custom SelectItem component that doesn't use Radix UI
export function BasicSelectItem({
  value,
  children,
  className,
  ...props
}: SelectItemProps & { onSelect?: () => void }) {
  // Ensure value is never empty
  const safeValue =
    value || `item-${Math.random().toString(36).substring(2, 9)}`;

  // Handle click on the item
  const handleClick = () => {
    if (props.onSelect) {
      props.onSelect();
    }
  };

  return (
    <div
      className={cn(
        'relative flex cursor-default select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        className
      )}
      onClick={handleClick}
      data-value={safeValue}
      role='option'
      aria-selected={false}
      {...props}
    >
      {children}
    </div>
  );
}

// Also export a default object for importers that use default import
export default {
  BasicSelect,
  BasicSelectItem,
};
