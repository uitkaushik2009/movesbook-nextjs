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
  const [shouldAutoPrint, setShouldAutoPrint] = React.useState(false);

  // Set auto-print flag when modal opens with autoPrint prop
  React.useEffect(() => {
    if (isOpen && autoPrint) {
      console.log('🖨️ Auto-print mode activated');
      setShouldAutoPrint(true);
    } else {
      setShouldAutoPrint(false);
    }
  }, [isOpen, autoPrint]);

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

    // Safe access - check if week and days exist
    if (!week || !week.days) {
      return { 
        sportTotals: [], 
        totalWorkouts: 0, 
        totalMoveframes: 0, 
        totalDistance: 0, 
        totalDuration: 0 
      };
    }

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

  const handlePrint = React.useCallback(() => {
    console.log('🖨️ handlePrint called');
    // Get the modal content
    const modalContent = document.querySelector('[role="dialog"]');
    if (!modalContent) {
      console.error('❌ Modal content not found');
      return;
    }
    console.log('✅ Modal content found, creating print window...');
    
    // Create a new window for printing
    const printWindow = window.open('', '', 'width=800,height=600');
    if (!printWindow) return;
    
    // Write the content
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Training Plan - Week ${week?.weekNumber || 'N/A'}</title>
        <style>
          @page {
            size: A4 landscape;
            margin: 2.5cm;
          }
          * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          body {
            font-family: system-ui, -apple-system, sans-serif;
            margin: 0;
            padding: 20px;
            background: white;
          }
          h1 {
            font-size: 18pt;
            text-align: center;
            margin-bottom: 10pt;
          }
          h2 {
            font-size: 14pt;
            text-align: center;
            margin: 10pt 0 8pt 0;
          }
          h3 {
            font-size: 11pt;
            margin: 8pt 0 6pt 0;
          }
          p {
            font-size: 10pt;
            margin: 0 0 6pt 0;
          }
          table {
            width: 100%;
            max-width: 900px;
            margin: 0 auto 12pt auto;
            border-collapse: collapse;
            font-size: 9pt;
          }
          th, td {
            padding: 4pt 5pt;
            border: 1px solid #999;
            text-align: left;
          }
          th {
            background: #f3f4f6;
            font-weight: bold;
          }
          .text-center {
            text-align: center;
          }
          .border-2 {
            border: 2px solid #ccc;
            padding: 10pt;
            margin-bottom: 10pt;
          }
          button {
            display: none;
          }
        </style>
      </head>
      <body>
        ${modalContent.innerHTML}
      </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    
    // Wait for content to load, then print
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  }, [week?.weekNumber]); // Safe optional chaining for dependency

  // Trigger auto-print after modal content is rendered
  React.useEffect(() => {
    if (shouldAutoPrint && isOpen) {
      console.log('📋 Triggering auto-print...');
      const timer = setTimeout(() => {
        handlePrint();
        // Close modal after print is triggered
        setTimeout(() => {
          onClose();
        }, 500);
      }, 500); // Give enough time for modal to render
      return () => clearTimeout(timer);
    }
  }, [shouldAutoPrint, isOpen, handlePrint, onClose]);

  // Get date range - safe access
  const startDate = week?.days?.[0] ? new Date(week.days[0].date) : null;
  const endDate = week?.days?.[week.days.length - 1] ? new Date(week.days[week.days.length - 1].date) : null;
  const dateRange = startDate && endDate 
    ? `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
    : '';

  // Early return check - must be after all hooks
  if (!isOpen || !week) return null;

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50 p-4 print:!p-0"
      style={{ 
        backgroundColor: shouldAutoPrint ? 'transparent' : 'rgba(0, 0, 0, 0.95)',
        visibility: shouldAutoPrint ? 'hidden' : 'visible',
        pointerEvents: shouldAutoPrint ? 'none' : 'auto'
      }}
      onClick={shouldAutoPrint ? undefined : onClose}
    >
      <div 
        role="dialog"
        aria-modal="true"
        className="bg-white rounded-lg shadow-2xl w-full max-w-[1000px] max-h-[90vh] overflow-hidden flex flex-col print:!max-w-full print:!max-h-none print:!rounded-none print:!shadow-none print:!overflow-visible print:!block"
        onClick={(e) => e.stopPropagation()}
        style={{ 
          visibility: shouldAutoPrint ? 'hidden' : 'visible'
        }}
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
        <div className="overflow-y-auto flex-1 p-3 print:!overflow-visible print:!h-auto print:!flex-none print:!p-0">
          {/* Document Header (Print & Screen) */}
          <div className="mb-3 pb-2 border-b border-gray-300 print-header">
            <div className="text-center mb-2">
              <h1 className="text-xl font-bold text-gray-900 mb-1">Training Plan - Week {week.weekNumber}</h1>
              <p className="text-sm text-gray-600">{dateRange}</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              <div>
                <span className="font-semibold text-gray-700">Athlete:</span>
                <span className="text-gray-600 ml-1">[Athlete Name]</span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Coach:</span>
                <span className="text-gray-600 ml-1">[Coach Name]</span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Period:</span>
                <span className="text-gray-600 ml-1">{week.period?.name || 'N/A'}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Generated:</span>
                <span className="text-gray-600 ml-1">{new Date().toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Sport Totals Summary Table */}
          <div className="mb-3 print-summary flex justify-center">
            <div className="w-full">
              <h2 className="text-base font-bold text-gray-900 mb-2 border-b border-gray-300 pb-1 text-center">Week Summary by Sport</h2>
              <table className="border-collapse border border-gray-300 text-sm mx-auto" style={{ width: 'auto', tableLayout: 'fixed' }}>
              <colgroup>
                <col style={{ width: '120px' }} />
                <col style={{ width: '60px' }} />
                <col style={{ width: '60px' }} />
                <col style={{ width: '80px' }} />
                <col style={{ width: '60px' }} />
              </colgroup>
              <thead className="bg-gray-200">
                <tr>
                  <th className="border border-gray-300 px-2 py-2 text-left font-semibold text-xs">Sport</th>
                  <th className="border border-gray-300 px-1 py-2 text-center font-semibold text-xs">Work</th>
                  <th className="border border-gray-300 px-1 py-2 text-center font-semibold text-xs">MF</th>
                  <th className="border border-gray-300 px-1 py-2 text-right font-semibold text-xs">Dist(m)</th>
                  <th className="border border-gray-300 px-1 py-2 text-center font-semibold text-xs">Time</th>
                </tr>
              </thead>
              <tbody>
                {sportTotals.length > 0 ? (
                  <>
                    {sportTotals.map((sportData, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-2 py-2 font-medium text-xs truncate">
                          {sportData.sport.replace(/_/g, ' ')}
                        </td>
                        <td className="border border-gray-300 px-1 py-2 text-center text-xs">
                          {sportData.workoutCount}
                        </td>
                        <td className="border border-gray-300 px-1 py-2 text-center text-xs">
                          {sportData.moveframeCount}
                        </td>
                        <td className="border border-gray-300 px-1 py-2 text-right text-xs">
                          {sportData.distance.toLocaleString()}
                        </td>
                        <td className="border border-gray-300 px-1 py-2 text-center text-xs">
                          {formatTime(sportData.durationMinutes)}
                        </td>
                      </tr>
                    ))}
                    {/* Grand Total Row */}
                    <tr className="bg-gray-100 font-bold">
                      <td className="border border-gray-300 px-2 py-2 text-xs">TOTAL</td>
                      <td className="border border-gray-300 px-1 py-2 text-center text-xs">{totalWorkouts}</td>
                      <td className="border border-gray-300 px-1 py-2 text-center text-xs">{totalMoveframes}</td>
                      <td className="border border-gray-300 px-1 py-2 text-right text-xs">{totalDistance.toLocaleString()}</td>
                      <td className="border border-gray-300 px-1 py-2 text-center text-xs">{formatTime(totalDuration)}</td>
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
          </div>

          {/* Daily Workout Details */}
          <div className="space-y-2 print-daily-details">
            <h2 className="text-base font-bold text-gray-900 border-b border-gray-300 pb-1">Daily Workout Details</h2>
            
            {week.days.map((day: any, dayIndex: number) => (
              <div key={day.id} className="border-2 border-gray-400 rounded overflow-hidden print-day-section">
                <div className="px-2 py-1 print-day-header">
                  <h3 className="font-bold text-sm text-gray-900">
                    Day {dayIndex + 1}: {new Date(day.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                  </h3>
                </div>

                {day.workouts && day.workouts.length > 0 ? (
                  <div className="p-1 space-y-2 bg-gray-50">
                    {day.workouts.map((workout: any, workoutIndex: number) => (
                      <div key={workout.id} className="border border-gray-300 rounded bg-white">
                        <div className="px-2 py-1 flex items-center justify-between">
                          <span className="font-semibold text-xs text-gray-900">
                            Workout {workout.sessionNumber}: {workout.name}
                          </span>
                          <span className="text-xs text-gray-700 font-medium">{workout.code}</span>
                        </div>

                        {workout.moveframes && workout.moveframes.length > 0 ? (
                          <div className="overflow-x-auto">
                            <table className="text-xs border-collapse" style={{ width: 'auto', tableLayout: 'fixed' }}>
                              <colgroup>
                                <col style={{ width: '40px' }} />
                                <col style={{ width: '100px' }} />
                                <col style={{ width: '80px' }} />
                                <col style={{ width: '250px' }} />
                                <col style={{ width: '50px' }} />
                              </colgroup>
                              <thead className="bg-purple-200">
                                <tr>
                                  <th className="border border-gray-300 px-1 py-1 text-left font-semibold text-xs">MF</th>
                                  <th className="border border-gray-300 px-1 py-1 text-left font-semibold text-xs">Sport</th>
                                  <th className="border border-gray-300 px-1 py-1 text-left font-semibold text-xs">Type</th>
                                  <th className="border border-gray-300 px-1 py-1 text-left font-semibold text-xs">Description</th>
                                  <th className="border border-gray-300 px-1 py-1 text-center font-semibold text-xs">Laps</th>
                                </tr>
                              </thead>
                              <tbody>
                                {workout.moveframes.map((mf: any) => (
                                  <React.Fragment key={mf.id}>
                                    <tr className="hover:bg-gray-50">
                                      <td className="border border-gray-300 px-1 py-1 font-bold text-center bg-purple-50 text-xs">
                                        {mf.letter}
                                      </td>
                                      <td className="border border-gray-300 px-1 py-1 text-xs truncate">
                                        {mf.sport.replace(/_/g, ' ')}
                                      </td>
                                      <td className="border border-gray-300 px-1 py-1 text-xs">
                                        {mf.type}
                                      </td>
                                      <td className="border border-gray-300 px-1 py-1 text-xs">
                                        {mf.description}
                                      </td>
                                      <td className="border border-gray-300 px-1 py-1 text-center font-semibold text-xs">
                                        {mf.movelaps?.length || 0}
                                      </td>
                                    </tr>
                                    
                                    {mf.movelaps && mf.movelaps.length > 0 && (
                                      <tr>
                                        <td colSpan={5} className="border border-gray-300 p-0">
                                          <table className="text-xs bg-gray-50" style={{ width: 'auto', tableLayout: 'fixed' }}>
                                            <colgroup>
                                              <col style={{ width: '30px' }} />
                                              <col style={{ width: '60px' }} />
                                              <col style={{ width: '50px' }} />
                                              <col style={{ width: '60px' }} />
                                              <col style={{ width: '80px' }} />
                                              <col style={{ width: '70px' }} />
                                              <col style={{ width: '60px' }} />
                                              <col style={{ width: '60px' }} />
                                            </colgroup>
                                            <thead className="bg-gray-200">
                                              <tr>
                                                <th className="border border-gray-300 px-1 py-1 text-center font-semibold text-xs">#</th>
                                                <th className="border border-gray-300 px-1 py-1 text-center font-semibold text-xs">Dist</th>
                                                <th className="border border-gray-300 px-1 py-1 text-center font-semibold text-xs">Reps</th>
                                                <th className="border border-gray-300 px-1 py-1 text-center font-semibold text-xs">Speed</th>
                                                <th className="border border-gray-300 px-1 py-1 text-center font-semibold text-xs">Style</th>
                                                <th className="border border-gray-300 px-1 py-1 text-center font-semibold text-xs">Time</th>
                                                <th className="border border-gray-300 px-1 py-1 text-center font-semibold text-xs">Pace</th>
                                                <th className="border border-gray-300 px-1 py-1 text-center font-semibold text-xs">Pause</th>
                                              </tr>
                                            </thead>
                                            <tbody>
                                              {mf.movelaps.map((ml: any) => (
                                                <tr key={ml.id} className="bg-white hover:bg-gray-50">
                                                  <td className="border border-gray-300 px-1 py-1 text-center text-xs">
                                                    {ml.repetitionNumber}
                                                  </td>
                                                  <td className="border border-gray-300 px-1 py-1 text-center text-xs truncate">
                                                    {ml.distance || '—'}
                                                  </td>
                                                  <td className="border border-gray-300 px-1 py-1 text-center text-xs">
                                                    {ml.reps || '—'}
                                                  </td>
                                                  <td className="border border-gray-300 px-1 py-1 text-center text-xs">
                                                    {ml.speed || '—'}
                                                  </td>
                                                  <td className="border border-gray-300 px-1 py-1 text-center text-xs truncate">
                                                    {ml.style || '—'}
                                                  </td>
                                                  <td className="border border-gray-300 px-1 py-1 text-center text-xs">
                                                    {ml.time || '—'}
                                                  </td>
                                                  <td className="border border-gray-300 px-1 py-1 text-center text-xs">
                                                    {ml.pace || '—'}
                                                  </td>
                                                  <td className="border border-gray-300 px-1 py-1 text-center text-xs">
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

      {/* Print Styles - Show ONLY modal content */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 2.5cm;
          }
          
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          html, body {
            width: 100%;
            height: auto;
            margin: 0;
            padding: 0;
            background: white;
          }
          
          /* Hide EVERYTHING first */
          body,
          body * {
            visibility: hidden !important;
            display: none !important;
          }
          
          /* Show ONLY the modal backdrop and dialog */
          div.fixed.inset-0:has([role="dialog"]) {
            visibility: visible !important;
            display: block !important;
            position: static !important;
            background: white !important;
            padding: 0 !important;
          }
          
          /* Show the dialog */
          [role="dialog"] {
            visibility: visible !important;
            display: block !important;
            position: static !important;
            width: 100% !important;
            max-width: 100% !important;
            height: auto !important;
            max-height: none !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            overflow: visible !important;
            background: white !important;
          }
          
          /* Show ALL dialog children */
          [role="dialog"],
          [role="dialog"] *,
          [role="dialog"] > *,
          [role="dialog"] > * > *,
          [role="dialog"] > * > * > *,
          [role="dialog"] > * > * > * > * {
            visibility: visible !important;
            display: revert !important;
          }
          
          /* Hide buttons */
          [role="dialog"] button,
          [role="dialog"] .print\\:hidden {
            display: none !important;
            visibility: hidden !important;
          }
          
          /* Fix layout elements */
          [role="dialog"] .fixed,
          [role="dialog"] .absolute {
            position: static !important;
          }
          
          [role="dialog"] .overflow-y-auto,
          [role="dialog"] .overflow-x-auto,
          [role="dialog"] .overflow-hidden {
            overflow: visible !important;
            max-height: none !important;
          }
          
          [role="dialog"] .flex,
          [role="dialog"] .flex-col {
            display: block !important;
          }
          
          [role="dialog"] .flex-1 {
            height: auto !important;
            flex: none !important;
          }
          
          [role="dialog"] .rounded-lg {
            border-radius: 0 !important;
          }
          
          [role="dialog"] .shadow-2xl {
            box-shadow: none !important;
          }
          
          /* Typography */
          [role="dialog"] h1 {
            display: block !important;
            font-size: 18pt;
            margin-bottom: 10pt;
            text-align: center;
          }
          
          [role="dialog"] h2 {
            display: block !important;
            font-size: 14pt;
            margin: 10pt 0 8pt 0;
            text-align: center;
          }
          
          [role="dialog"] h3 {
            display: block !important;
            font-size: 11pt;
            margin: 8pt 0 6pt 0;
          }
          
          [role="dialog"] p {
            display: block !important;
            font-size: 10pt;
            margin: 0 0 6pt 0;
          }
          
          [role="dialog"] div {
            display: block !important;
          }
          
          [role="dialog"] span {
            display: inline !important;
          }
          
          /* Tables */
          [role="dialog"] table {
            display: table !important;
            width: 100% !important;
            max-width: 900px !important;
            margin-left: auto !important;
            margin-right: auto !important;
            margin-bottom: 12pt !important;
            border-collapse: collapse !important;
            font-size: 9pt !important;
          }
          
          [role="dialog"] thead {
            display: table-header-group !important;
          }
          
          [role="dialog"] tbody {
            display: table-row-group !important;
          }
          
          [role="dialog"] tr {
            display: table-row !important;
            page-break-inside: avoid;
          }
          
          [role="dialog"] th,
          [role="dialog"] td {
            display: table-cell !important;
            padding: 4pt 5pt !important;
            border: 1px solid #999 !important;
            font-size: 9pt !important;
          }
        }
      `}</style>
    </div>
  );
}
