import React from 'react';
import { X } from 'lucide-react';
import { getSportIcon, isImageIcon } from '@/utils/sportIcons';
import { useSportIconType } from '@/hooks/useSportIconType';

interface WeekTotalsModalProps {
  isOpen: boolean;
  week: any;
  onClose: () => void;
  autoPrint?: boolean;
}

export default function WeekTotalsModal({ isOpen, week, onClose, autoPrint = false }: WeekTotalsModalProps) {
  const iconType = useSportIconType();
  const useImageIcons = isImageIcon(iconType);

  // Auto-trigger print if autoPrint is true
  React.useEffect(() => {
    if (isOpen && autoPrint) {
      // Small delay to ensure modal is rendered (off-screen)
      const timer = setTimeout(() => {
        window.print();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoPrint]);

  if (!isOpen || !week) return null;

  // Format duration as HH:MM
  const formatTime = (minutes: number): string => {
    if (minutes === 0) return '0:00';
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}`;
    }
    return `0:${mins.toString().padStart(2, '0')}`;
  };

  // Calculate totals by sport
  const calculateWeekTotals = () => {
    const sportMap = new Map<string, { 
      distance: number; 
      durationMinutes: number; 
      moveframeCount: number;
      workoutCount: number;
    }>();

    let totalWorkouts = 0;
    let totalMoveframes = 0;
    let totalDistance = 0;
    let totalDuration = 0;

    week.days.forEach((day: any) => {
      day.workouts.forEach((workout: any) => {
        totalWorkouts++;
        
        (workout.sports || []).forEach((ws: any) => {
          if (!sportMap.has(ws.sport)) {
            sportMap.set(ws.sport, { 
              distance: 0, 
              durationMinutes: 0, 
              moveframeCount: 0,
              workoutCount: 0
            });
          }
        });

        (workout.moveframes || []).forEach((mf: any) => {
          const sport = mf.sport || 'UNKNOWN';
          const currentTotals = sportMap.get(sport) || { 
            distance: 0, 
            durationMinutes: 0, 
            moveframeCount: 0,
            workoutCount: 0
          };

          totalMoveframes++;
          currentTotals.moveframeCount += 1;

          (mf.movelaps || []).forEach((lap: any) => {
            const distance = parseInt(lap.distance) || 0;
            const duration = parseFloat(lap.time) || 0;
            
            currentTotals.distance += distance;
            currentTotals.durationMinutes += duration;
            totalDistance += distance;
            totalDuration += duration;
          });

          sportMap.set(sport, currentTotals);
        });
      });
    });

    const sportTotals = Array.from(sportMap.entries())
      .map(([sport, totals]) => ({
        sport,
        ...totals,
      }))
      .sort((a, b) => b.distance - a.distance);

    return { 
      sportTotals, 
      totalWorkouts, 
      totalMoveframes, 
      totalDistance, 
      totalDuration 
    };
  };

  const { sportTotals, totalWorkouts, totalMoveframes, totalDistance, totalDuration } = calculateWeekTotals();

  const handlePrint = () => {
    window.print();
  };

  // Get date range
  const startDate = week.days[0] ? new Date(week.days[0].date) : null;
  const endDate = week.days[week.days.length - 1] ? new Date(week.days[week.days.length - 1].date) : null;
  const dateRange = startDate && endDate 
    ? `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
    : '';

  return (
    <div 
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="bg-white rounded-lg shadow-2xl w-full max-w-[95vw] max-h-[95vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header (Screen Only) */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-4 flex items-center justify-between print:hidden">
          <h2 className="text-xl font-bold">Week {week.weekNumber} - Overview & Print Preview</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-white text-indigo-600 rounded-lg hover:bg-gray-100 transition-colors font-medium text-sm flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
              Print
            </button>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
              aria-label="Close"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 p-6">
          {/* Document Header (Print & Screen) */}
          <div className="mb-6 pb-4 border-b-2 border-gray-300 print-header">
            <div className="text-center mb-4">
              <h1 className="text-3xl font-bold text-gray-900 mb-1">Training Plan - Week {week.weekNumber}</h1>
              <p className="text-lg text-gray-600">{dateRange}</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-semibold text-gray-700">Athlete:</span>
                <p className="text-gray-600">[Athlete Name]</p>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Coach:</span>
                <p className="text-gray-600">[Coach Name]</p>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Period:</span>
                <p className="text-gray-600">{week.period?.name || 'N/A'}</p>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Generated:</span>
                <p className="text-gray-600">{new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Sport Totals Summary Table */}
          <div className="mb-6 print-summary">
            <h2 className="text-xl font-bold text-gray-900 mb-3 border-b border-gray-300 pb-2">Week Summary by Sport</h2>
            <table className="w-full border-collapse border border-gray-300 text-sm">
              <thead className="bg-gray-200">
                <tr>
                  <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Sport</th>
                  <th className="border border-gray-300 px-3 py-2 text-center font-semibold">Workouts</th>
                  <th className="border border-gray-300 px-3 py-2 text-center font-semibold">Moveframes</th>
                  <th className="border border-gray-300 px-3 py-2 text-right font-semibold">Distance (m)</th>
                  <th className="border border-gray-300 px-3 py-2 text-center font-semibold">Duration</th>
                </tr>
              </thead>
              <tbody>
                {sportTotals.length > 0 ? (
                  <>
                    {sportTotals.map((sportData, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-3 py-2 font-medium">
                          {sportData.sport.replace(/_/g, ' ')}
                        </td>
                        <td className="border border-gray-300 px-3 py-2 text-center">
                          {sportData.workoutCount}
                        </td>
                        <td className="border border-gray-300 px-3 py-2 text-center">
                          {sportData.moveframeCount}
                        </td>
                        <td className="border border-gray-300 px-3 py-2 text-right">
                          {sportData.distance.toLocaleString()}
                        </td>
                        <td className="border border-gray-300 px-3 py-2 text-center">
                          {formatTime(sportData.durationMinutes)}
                        </td>
                      </tr>
                    ))}
                    {/* Grand Total Row */}
                    <tr className="bg-gray-100 font-bold">
                      <td className="border border-gray-300 px-3 py-2">TOTAL</td>
                      <td className="border border-gray-300 px-3 py-2 text-center">{totalWorkouts}</td>
                      <td className="border border-gray-300 px-3 py-2 text-center">{totalMoveframes}</td>
                      <td className="border border-gray-300 px-3 py-2 text-right">{totalDistance.toLocaleString()}</td>
                      <td className="border border-gray-300 px-3 py-2 text-center">{formatTime(totalDuration)}</td>
                    </tr>
                  </>
                ) : (
                  <tr>
                    <td colSpan={5} className="border border-gray-300 px-3 py-3 text-center text-gray-500">
                      No data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Daily Workout Details */}
          <div className="space-y-6 print-daily-details">
            <h2 className="text-xl font-bold text-gray-900 border-b border-gray-300 pb-2">Daily Workout Details</h2>
            
            {week.days.map((day: any, dayIndex: number) => (
              <div key={day.id} className="border-2 border-gray-400 rounded overflow-hidden print-day-section">
                <div className="bg-blue-600 text-white px-4 py-2 print-day-header">
                  <h3 className="font-bold text-lg">
                    Day {dayIndex + 1}: {new Date(day.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                  </h3>
                </div>

                {day.workouts && day.workouts.length > 0 ? (
                  <div className="p-2 space-y-4 bg-gray-50">
                    {day.workouts.map((workout: any, workoutIndex: number) => (
                      <div key={workout.id} className="border border-gray-300 rounded bg-white">
                        <div className="bg-purple-600 text-white px-3 py-2 flex items-center justify-between">
                          <span className="font-semibold">
                            Workout {workout.sessionNumber}: {workout.name}
                          </span>
                          <span className="text-sm bg-purple-700 px-2 py-1 rounded">{workout.code}</span>
                        </div>

                        {workout.moveframes && workout.moveframes.length > 0 ? (
                          <div className="overflow-x-auto">
                            <table className="w-full text-xs border-collapse">
                              <thead className="bg-purple-200">
                                <tr>
                                  <th className="border border-gray-300 px-2 py-1.5 text-left font-semibold">MF</th>
                                  <th className="border border-gray-300 px-2 py-1.5 text-left font-semibold">Sport</th>
                                  <th className="border border-gray-300 px-2 py-1.5 text-left font-semibold">Type</th>
                                  <th className="border border-gray-300 px-2 py-1.5 text-left font-semibold">Description</th>
                                  <th className="border border-gray-300 px-2 py-1.5 text-center font-semibold">Laps</th>
                                </tr>
                              </thead>
                              <tbody>
                                {workout.moveframes.map((mf: any) => (
                                  <React.Fragment key={mf.id}>
                                    <tr className="hover:bg-gray-50">
                                      <td className="border border-gray-300 px-2 py-1.5 font-bold text-center bg-purple-50">
                                        {mf.letter}
                                      </td>
                                      <td className="border border-gray-300 px-2 py-1.5">
                                        {mf.sport.replace(/_/g, ' ')}
                                      </td>
                                      <td className="border border-gray-300 px-2 py-1.5">
                                        {mf.type}
                                      </td>
                                      <td className="border border-gray-300 px-2 py-1.5">
                                        {mf.description}
                                      </td>
                                      <td className="border border-gray-300 px-2 py-1.5 text-center font-semibold">
                                        {mf.movelaps?.length || 0}
                                      </td>
                                    </tr>
                                    
                                    {mf.movelaps && mf.movelaps.length > 0 && (
                                      <tr>
                                        <td colSpan={5} className="border border-gray-300 p-0">
                                          <table className="w-full text-xs bg-gray-50">
                                            <thead className="bg-gray-200">
                                              <tr>
                                                <th className="border border-gray-300 px-2 py-1 text-center font-semibold">#</th>
                                                <th className="border border-gray-300 px-2 py-1 text-center font-semibold">Distance</th>
                                                <th className="border border-gray-300 px-2 py-1 text-center font-semibold">Reps</th>
                                                <th className="border border-gray-300 px-2 py-1 text-center font-semibold">Speed</th>
                                                <th className="border border-gray-300 px-2 py-1 text-center font-semibold">Style</th>
                                                <th className="border border-gray-300 px-2 py-1 text-center font-semibold">Time</th>
                                                <th className="border border-gray-300 px-2 py-1 text-center font-semibold">Pace</th>
                                                <th className="border border-gray-300 px-2 py-1 text-center font-semibold">Pause</th>
                                              </tr>
                                            </thead>
                                            <tbody>
                                              {mf.movelaps.map((ml: any) => (
                                                <tr key={ml.id} className="bg-white hover:bg-gray-50">
                                                  <td className="border border-gray-300 px-2 py-1 text-center">
                                                    {ml.repetitionNumber}
                                                  </td>
                                                  <td className="border border-gray-300 px-2 py-1 text-center">
                                                    {ml.distance || '—'}
                                                  </td>
                                                  <td className="border border-gray-300 px-2 py-1 text-center">
                                                    {ml.reps || '—'}
                                                  </td>
                                                  <td className="border border-gray-300 px-2 py-1 text-center">
                                                    {ml.speed || '—'}
                                                  </td>
                                                  <td className="border border-gray-300 px-2 py-1 text-center">
                                                    {ml.style || '—'}
                                                  </td>
                                                  <td className="border border-gray-300 px-2 py-1 text-center">
                                                    {ml.time || '—'}
                                                  </td>
                                                  <td className="border border-gray-300 px-2 py-1 text-center">
                                                    {ml.pace || '—'}
                                                  </td>
                                                  <td className="border border-gray-300 px-2 py-1 text-center">
                                                    {ml.pause || '—'}
                                                  </td>
                                                </tr>
                                              ))}
                                            </tbody>
                                          </table>
                                        </td>
                                      </tr>
                                    )}
                                  </React.Fragment>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="p-3 text-center text-gray-500 text-sm">No moveframes</div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-gray-500">No workouts scheduled</div>
                )}
              </div>
            ))}
          </div>

          {/* Document Footer */}
          <div className="mt-8 pt-4 border-t-2 border-gray-300 text-sm text-gray-600 print-footer">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="font-semibold text-gray-700">Notes:</p>
                <p>{week.notes || 'No notes for this week'}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-700">Contact:</p>
                <p>Coach: [Email/Phone]</p>
              </div>
              <div>
                <p className="font-semibold text-gray-700">Generated by:</p>
                <p>MovesBook Training System</p>
                <p className="text-xs text-gray-500">{new Date().toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer (Screen Only) */}
        <div className="flex justify-end gap-3 p-4 border-t border-gray-200 bg-gray-50 print:hidden">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            Print Week
          </button>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 1.5cm;
          }
          
          /* Hide buttons */
          .print\\:hidden {
            display: none !important;
          }
          
          /* Make everything visible and remove constraints */
          html, body {
            width: 100%;
            height: auto;
            overflow: visible !important;
            margin: 0;
            padding: 0;
          }
          
          /* Show modal statically */
          div[role="dialog"] {
            position: static !important;
            display: block !important;
            width: 100% !important;
            height: auto !important;
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
            overflow: visible !important;
          }
          
          /* Remove all size restrictions from modal */
          div[role="dialog"] * {
            max-width: 100% !important;
            max-height: none !important;
            overflow: visible !important;
          }
          
          /* Specific overrides for modal container */
          .max-w-\\[95vw\\] {
            max-width: 100% !important;
          }
          
          .max-h-\\[95vh\\] {
            max-height: none !important;
            height: auto !important;
          }
          
          .overflow-hidden {
            overflow: visible !important;
          }
          
          .overflow-y-auto {
            overflow: visible !important;
            height: auto !important;
          }
          
          .flex-1 {
            flex: none !important;
            height: auto !important;
          }
          
          /* Preserve colors */
          * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          
          /* Font sizes */
          table {
            font-size: 8pt;
          }
          
          th, td {
            font-size: 8pt;
          }
          
          h1 {
            font-size: 16pt;
          }
          
          h2 {
            font-size: 12pt;
          }
          
          h3 {
            font-size: 10pt;
          }
        }
      `}</style>
    </div>
  );
}
