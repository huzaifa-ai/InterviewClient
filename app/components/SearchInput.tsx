'use client';

import { useState, useEffect } from 'react';
import { TextInput } from '@tremor/react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  minLength?: number;
  placeholder?: string;
  className?: string;
}

export default function SearchInput({ 
  value: externalValue, 
  onChange,
  placeholder = 'Search...', 
  className = '' 
}: SearchInputProps) {
  const [localValue, setLocalValue] = useState(externalValue);

  // Sync with external value
  useEffect(() => {
    setLocalValue(externalValue);
  }, [externalValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    onChange(newValue);
  };

  return (
    <div className="relative">
      <TextInput
        icon={MagnifyingGlassIcon}
        placeholder={placeholder}
        value={localValue}
        onChange={handleChange}
        className={className}
      />
    </div>
  );
}
