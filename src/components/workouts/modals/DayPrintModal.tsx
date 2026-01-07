'use client';

import React, { useEffect } from 'react';
import { X, Printer, FileDown } from 'lucide-react';

interface DayPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  day: any;
  autoPrint?: boolean;
}

export default function DayPrintModal({
  isOpen,
  onClose,
  day,
  autoPrint = false
}: DayPrintModalProps) {
  useEffect(() => {
    if (isOpen && autoPrint) {
      // Small delay to ensure content is rendered
      const timer = setTimeout(() => {
        window.print();
        // Close modal after print dialog opens
        setTimeout(() => {
          onClose();
        }, 100);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoPrint, onClose]);

  if (!isOpen || !day) return null;

  const dayDate = new Date(day.date).toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <>
      {/* Print Styles */}
      <style>{`
        @media screen {
          .print-modal {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.95);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            padding: 20px;
          }
          .print-modal.auto-print {
            opacity: 0;
            pointer-events: none;
          }
          .print-content {
            background: white;
            border-radius: 8px;
            max-width: 1000px;
            width: 100%;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
          }
        }
      `}</style>

      {/* Modal */}
      <div className={`print-modal ${autoPrint ? 'auto-print' : ''}`} role="dialog" aria-modal="true">
        <div className="print-content">
          {/* Header - Hide on print */}
          <div className="no-print sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-lg">
            <h3 className="text-lg font-bold text-gray-900">Print Preview</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                <Printer className="w-4 h-4" />
                Print
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm font-medium"
              >
                <FileDown className="w-4 h-4" />
                Save as PDF
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Printable Content */}
          <div className="p-6">
            <h1 className="text-3xl font-bold text-blue-600 border-b-2 border-blue-600 pb-2 mb-4">
              📅 {dayDate}
            </h1>
            
            {day.period && (
              <p className="mb-2">
                <strong className="text-gray-700">Period:</strong>{' '}
                <span className="text-gray-900">{day.period.name}</span>
              </p>
            )}
            
            {day.notes && (
              <div className="mb-4">
                <strong className="text-gray-700">Notes:</strong>{' '}
                <span className="text-gray-900" dangerouslySetInnerHTML={{ __html: day.notes }} />
              </div>
            )}

            {day.workouts && day.workouts.length > 0 ? (
              day.workouts.map((workout: any, idx: number) => (
                <div key={workout.id} className="workout-box border-2 border-gray-200 rounded-lg p-4 mb-4">
                  <h2 className="text-xl font-bold text-green-600 mb-3">
                    🏋️ Workout {idx + 1}: {workout.name || 'Unnamed Workout'}
                  </h2>
                  
                  {workout.moveframes && workout.moveframes.length > 0 ? (
                    workout.moveframes.map((mf: any) => (
                      <div key={mf.id} className="moveframe-item bg-gray-50 border-l-4 border-blue-500 p-3 mb-2">
                        <div className="sport-name font-bold text-gray-900">
                          {mf.sport}
                        </div>
                        {mf.description && (
                          <div 
                            className="description text-gray-600 mt-1"
                            dangerouslySetInnerHTML={{ __html: mf.description }}
                          />
                        )}
                        {mf.movelaps && mf.movelaps.length > 0 && (
                          <div className="text-xs text-gray-500 mt-1">
                            {mf.movelaps.length} repetition(s)
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">No moveframes in this workout</p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-500 italic py-8 text-center">
                No workouts planned for this day.
              </p>
            )}

            {/* Footer */}
            <div className="mt-8 pt-4 border-t border-gray-200 text-center text-xs text-gray-500">
              ✨ Generated by MovesBook
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

