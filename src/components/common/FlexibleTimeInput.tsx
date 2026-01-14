import React, { useState } from 'react';

// Helper function to parse flexible time input
const parseFlexibleTime = (input: string): string => {
  if (!input || input.trim() === '') return '';
  
  const cleaned = input.trim();
  
  // Already in correct format (e.g., "1'30"0" or "0h01'30"0" or "1h13'25"5")
  if (cleaned.match(/^\d+h\d{2}'\d{2}"\d$/)) {
    return cleaned;
  }
  
  // Format: "130" or "1:30" or "1.30" -> "1'30"0"
  // Format: "113255" -> "1h13'25"5"
  // Format: "1325" -> "1'32"5"
  const formats = [
    // 113255 (6 digits) -> 1h13'25"5
    { pattern: /^(\d{1,2})(\d{2})(\d{2})(\d)$/, handler: (m: RegExpMatchArray) => `${m[1]}h${m[2]}'${m[3]}"${m[4]}` },
    // 11325 (5 digits) -> 1h13'25"0
    { pattern: /^(\d{1,2})(\d{2})(\d{2})$/, handler: (m: RegExpMatchArray) => {
      const first = m[1];
      if (first.length === 1 && parseInt(first) <= 9) {
        // Treat as h:mm:ss format
        return `${first}h${m[2]}'${m[3]}"0`;
      } else {
        // Treat as mm:ss format
        return `${m[1]}'${m[2]}"${m[3].charAt(0)}`;
      }
    }},
    // 1325 (4 digits) -> 1'32"5 or 13'25"0
    { pattern: /^(\d{1,2})(\d{2})(\d?)$/, handler: (m: RegExpMatchArray) => {
      if (m[3]) {
        return `${m[1]}'${m[2]}"${m[3]}`;
      } else {
        return `${m[1]}'${m[2]}"0`;
      }
    }},
    // 130 -> 1'30"0
    { pattern: /^(\d{1,2})(\d{2})$/, handler: (m: RegExpMatchArray) => `${m[1]}'${m[2]}"0` },
    // 1:30 -> 1'30"0
    { pattern: /^(\d{1,2}):(\d{2})$/, handler: (m: RegExpMatchArray) => `${m[1]}'${m[2]}"0` },
    // 1.30 -> 1'30"0
    { pattern: /^(\d{1,2})\.(\d{2})$/, handler: (m: RegExpMatchArray) => `${m[1]}'${m[2]}"0` },
    // 1'30 -> 1'30"0
    { pattern: /^(\d{1,2})'(\d{2})$/, handler: (m: RegExpMatchArray) => `${m[1]}'${m[2]}"0` },
    // 1:30:5 -> 1h30'05"5
    { pattern: /^(\d{1,2}):(\d{2}):(\d{1,2})$/, handler: (m: RegExpMatchArray) => `${m[1]}h${m[2]}'${m[3].padStart(2, '0')}"0` },
    // 1.30.5 -> 1h30'05"5
    { pattern: /^(\d{1,2})\.(\d{2})\.(\d{1,2})$/, handler: (m: RegExpMatchArray) => `${m[1]}h${m[2]}'${m[3].padStart(2, '0')}"0` },
    // 1h30'5 -> 1h30'05"0
    { pattern: /^(\d{1,2})h(\d{2})'(\d{1,2})$/, handler: (m: RegExpMatchArray) => `${m[1]}h${m[2]}'${m[3].padStart(2, '0')}"0` },
  ];
  
  for (const { pattern, handler } of formats) {
    const match = cleaned.match(pattern);
    if (match) {
      return handler(match);
    }
  }
  
  return cleaned; // Return as-is if no pattern matches
};

interface FlexibleTimeInputProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  label?: string;
  optional?: boolean;
  disabled?: boolean;
  className?: string;
  showHelperText?: boolean;
}

export default function FlexibleTimeInput({
  value,
  onChange,
  onBlur,
  placeholder = "0h00'00\"0",
  label = "TIME",
  optional = false,
  disabled = false,
  className = "",
  showHelperText = true,
}: FlexibleTimeInputProps) {
  const [inputValue, setInputValue] = useState(value);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleBlur = () => {
    const formatted = parseFlexibleTime(inputValue);
    if (formatted) {
      setInputValue(formatted);
      onChange(formatted);
    }
    onBlur?.();
  };

  // Update local state when prop value changes
  React.useEffect(() => {
    setInputValue(value);
  }, [value]);

  return (
    <div className={className}>
      {label && (
        <label className="block text-xs font-semibold text-gray-700 mb-1">
          {label} {optional && <span className="text-gray-400 font-normal text-[10px]">(optional)</span>}
        </label>
      )}
      <input
        type="text"
        value={inputValue}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        autoComplete="off"
        className="w-full px-3 py-2 text-base border-2 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono bg-green-50"
        disabled={disabled}
      />
      {showHelperText && (
        <p className="mt-1 text-[10px] text-green-700">
          ⚡ Fast input: Type <strong>130</strong> or <strong>1:30</strong> or <strong>1.30</strong> → <strong>1&apos;30&quot;0</strong>
        </p>
      )}
    </div>
  );
}

