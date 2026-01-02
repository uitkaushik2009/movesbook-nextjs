import React, { useState, useEffect } from 'react';

interface TimeInputProps {
  value: string; // Internal format like "0h05'30"0" or "5'30""
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  className?: string;
  label?: string;
  showLabel?: boolean;
  allowedUnits?: ('hours' | 'minutes' | 'seconds')[];
  defaultUnit?: 'hours' | 'minutes' | 'seconds';
  maxHours?: number;
  maxMinutes?: number;
  maxSeconds?: number;
}

export default function TimeInput({
  value,
  onChange,
  onBlur,
  placeholder = "Enter time",
  className = "",
  label = "Time",
  showLabel = true,
  allowedUnits = ['hours', 'minutes', 'seconds'],
  defaultUnit = 'minutes',
  maxHours = 99,
  maxMinutes = 59,
  maxSeconds = 59,
}: TimeInputProps) {
  const [hours, setHours] = useState<string>('0');
  const [minutes, setMinutes] = useState<string>('0');
  const [seconds, setSeconds] = useState<string>('0');
  const [unit, setUnit] = useState<'hours' | 'minutes' | 'seconds'>(defaultUnit);

  // Parse the value from formats like "0h05'30"0", "1h23'45"0", "5'30"", "1'00""
  useEffect(() => {
    if (!value) {
      setHours('0');
      setMinutes('0');
      setSeconds('0');
      return;
    }

    // Parse format like "0h05'30"0" or "1h23'45"0" (with hours) or "5'30"" (without hours)
    const hourMatch = value.match(/(\d+)h/);
    const minMatch = value.match(/(\d+)'/);
    const secMatch = value.match(/'(\d+)"/);

    const h = hourMatch ? hourMatch[1] : '0';
    const m = minMatch ? minMatch[1] : '0';
    const s = secMatch ? secMatch[1] : '0';

    setHours(h);
    setMinutes(m);
    setSeconds(s);

    // Don't auto-select unit when loading existing values
    // Keep the current unit unless it's the first render
  }, [value]);

  // Convert to internal format and call onChange
  const updateValue = (h: string, m: string, s: string) => {
    const hNum = parseInt(h) || 0;
    const mNum = parseInt(m) || 0;
    const sNum = parseInt(s) || 0;

    // Format based on whether hours are needed
    // If allowedUnits includes 'hours', use full format: "Hh:MM'SS"0"
    // Otherwise use short format: "M'SS""
    if (allowedUnits.includes('hours')) {
      const formatted = `${hNum}h${mNum.toString().padStart(2, '0')}'${sNum.toString().padStart(2, '0')}"0`;
      onChange(formatted);
    } else {
      // Short format for pause times: "M'SS""
      const formatted = `${mNum}'${sNum.toString().padStart(2, '0')}"`;
      onChange(formatted);
    }
  };

  const handleNumberChange = (inputValue: string) => {
    // Only allow numbers
    const numValue = inputValue.replace(/\D/g, '');
    if (!numValue) {
      updateValue('0', '0', '0');
      return;
    }

    const num = parseInt(numValue);

    if (unit === 'hours') {
      const limitedNum = Math.min(num, maxHours);
      setHours(limitedNum.toString());
      updateValue(limitedNum.toString(), minutes, seconds);
    } else if (unit === 'minutes') {
      const limitedNum = Math.min(num, maxMinutes);
      setMinutes(limitedNum.toString());
      updateValue(hours, limitedNum.toString(), seconds);
    } else if (unit === 'seconds') {
      const limitedNum = Math.min(num, maxSeconds);
      setSeconds(limitedNum.toString());
      updateValue(hours, minutes, limitedNum.toString());
    }
  };

  const handleUnitChange = (newUnit: 'hours' | 'minutes' | 'seconds') => {
    setUnit(newUnit);
  };

  const getCurrentValue = () => {
    if (unit === 'hours') return hours;
    if (unit === 'minutes') return minutes;
    return seconds;
  };

  const getDisplayValue = () => {
    const h = parseInt(hours);
    const m = parseInt(minutes);
    const s = parseInt(seconds);
    
    if (h > 0) {
      return `${h}h ${m.toString().padStart(2, '0')}'${s.toString().padStart(2, '0')}"`;
    } else if (m > 0) {
      return `${m}'${s.toString().padStart(2, '0')}"`;
    } else {
      return `${s}"`;
    }
  };

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {showLabel && (
        <label className="block text-xs font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="flex items-center gap-2">
        {/* Number Input */}
        <input
          type="text"
          inputMode="numeric"
          value={getCurrentValue()}
          onChange={(e) => handleNumberChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          className="w-24 px-3 py-2 text-lg border-2 border-blue-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono bg-blue-50"
        />

        {/* Unit Selector */}
        <select
          value={unit}
          onChange={(e) => handleUnitChange(e.target.value as any)}
          className="px-3 py-2 border-2 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm bg-white"
        >
          {allowedUnits.includes('hours') && <option value="hours">hours</option>}
          {allowedUnits.includes('minutes') && <option value="minutes">minutes</option>}
          {allowedUnits.includes('seconds') && <option value="seconds">seconds</option>}
        </select>

        {/* Display Formatted Value */}
        <div className="flex-1 px-3 py-2 bg-gray-100 border border-gray-300 rounded text-sm font-mono text-gray-700">
          = {getDisplayValue()}
        </div>
      </div>
    </div>
  );
}

