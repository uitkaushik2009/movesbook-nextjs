'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';

interface WeeklyInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  weekNumber: number;
  initialNotes?: string[];
  onSave: (notes: string[]) => void;
}

export default function WeeklyInfoModal({
  isOpen,
  onClose,
  weekNumber,
  initialNotes = [''],
  onSave
}: WeeklyInfoModalProps) {
  const [notes, setNotes] = useState<string[]>(initialNotes.length > 0 ? initialNotes : ['']);
  const [isExpanded, setIsExpanded] = useState(false);

  if (!isOpen) return null;

  const handleAddRow = () => {
    setNotes([...notes, '']);
  };

  const handleRemoveRow = (index: number) => {
    if (notes.length > 1) {
      setNotes(notes.filter((_, i) => i !== index));
    }
  };

  const handleNoteChange = (index: number, value: string) => {
    const newNotes = [...notes];
    newNotes[index] = value;
    setNotes(newNotes);
  };

  const handleSave = () => {
    onSave(notes.filter(note => note.trim() !== ''));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            Weekly Info - Week {weekNumber}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-600 mb-4">
            Add annotations and notes for the entire week. The first row will be displayed on screen. Click to view all rows.
          </p>

          {/* Notes Rows */}
          <div className="space-y-3">
            {notes.map((note, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-500 w-8">
                  {index + 1}.
                </span>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => handleNoteChange(index, e.target.value)}
                  placeholder={`Note ${index + 1}`}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                {notes.length > 1 && (
                  <button
                    onClick={() => handleRemoveRow(index)}
                    className="px-2 py-2 text-red-500 hover:bg-red-50 rounded transition-colors"
                    title="Remove row"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Add Row Button */}
          <button
            onClick={handleAddRow}
            className="px-4 py-2 text-sm bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          >
            + Add Row
          </button>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

