import React from 'react';
import { Input } from "./input";
import { cn } from "@/lib/utils";

export interface CurrencyInputProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
}

export const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ className, value, onChange, ...props }, ref) => {
    const formatValue = (val: string) => {
      // Remove existing commas and non-numeric characters except decimal
      const numericValue = val.replace(/[^0-9.]/g, '');
      
      if (!numericValue) return '';
      
      // Split into whole and decimal parts
      const [whole, decimal] = numericValue.split('.');
      
      // Format whole number part with Indian grouping
      if (whole.length <= 3) {
        return decimal ? `${whole}.${decimal}` : whole;
      }
      
      // Apply Indian number system grouping (2,2,3)
      const lastThree = whole.substring(whole.length - 3);
      const remainingDigits = whole.substring(0, whole.length - 3);
      const formatted = remainingDigits.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree;
      
      return decimal ? `${formatted}.${decimal}` : formatted;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value.replace(/,/g, '');
      onChange(rawValue); // Store raw value without commas
    };

    return (
      <Input
        type="text"
        value={formatValue(value)}
        onChange={handleChange}
        ref={ref}
        className={cn("font-mono", className)}
        {...props}
      />
    );
  }
);