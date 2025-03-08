import * as React from 'react';
import { BasicSelect, BasicSelectItem } from './basic-select';

// Re-export components with the same names as the shadcn components
export const Select = BasicSelect;
export const SelectItem = BasicSelectItem;

// Create empty components for the other Select parts to avoid errors
export const SelectTrigger = ({ children, ...props }: any) => children;
export const SelectValue = ({ children, ...props }: any) => children;
export const SelectContent = ({ children, ...props }: any) => <>{children}</>;
export const SelectGroup = ({ children, ...props }: any) => <>{children}</>;
export const SelectLabel = ({ children, ...props }: any) => <>{children}</>;
export const SelectSeparator = ({ ...props }: any) => null;
export const SelectScrollUpButton = ({ ...props }: any) => null;
export const SelectScrollDownButton = ({ ...props }: any) => null;

// Export for backward compatibility
export default {
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
};
