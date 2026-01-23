'use client';

import React from 'react';
import { X, Printer } from 'lucide-react';
import { shouldShowDistance, getDistanceUnit, AEROBIC_SPORTS } from '@/constants/moveframe.constants';
import { useSportIconType } from '@/hooks/useSportIconType';
import { isImageIcon } from '@/utils/sportIcons';

interface WorkoutOverviewModalProps {
  workout: any;
  onClose: () => void;
}

export default function WorkoutOverviewModal({ workout, onClose }: WorkoutOverviewModalProps) {
  const iconType = useSportIconType();
  const useImageIcons = isImageIcon(iconType);
  const [showMovelaps, setShowMovelaps] = React.useState(true);
  
  // Parse the workoutData JSON
  const workoutData = workout.workoutData ? JSON.parse(workout.workoutData) : null;
  const workoutInfo = workoutData?.workout || {};
  const moveframes = workoutData?.moveframes || [];
  const sports = workoutData?.sports || [];

  // Calculate totals by sport
  const sportTotals: Record<string, { moveframes: number; movelaps: number; distance: number; duration: number; series: number; repetitions: number }> = {};
  
  moveframes.forEach((mf: any) => {
    const sport = mf.sport || 'Unknown';
    if (!sportTotals[sport]) {
      sportTotals[sport] = { moveframes: 0, movelaps: 0, distance: 0, duration: 0, series: 0, repetitions: 0 };
    }
    sportTotals[sport].moveframes++;
    sportTotals[sport].movelaps += mf.movelaps?.length || 0;
    
    // Check if this is a series-based sport (BODY_BUILDING, etc.)
    const isSeriesSport = !shouldShowDistance(sport);
    
    if (isSeriesSport) {
      // For series-based sports
      if (mf.manualMode) {
        // For manual input: use the repetitions field from moveframe
        const totalSeries = mf.repetitions || 0;
        sportTotals[sport].series += totalSeries;
        sportTotals[sport].repetitions += totalSeries;
      } else {
        // For standard mode: count movelaps as series
        sportTotals[sport].series += mf.movelaps?.length || 0;
        // Sum actual reps from all movelaps
        mf.movelaps?.forEach((ml: any) => {
          sportTotals[sport].repetitions += parseInt(ml.reps) || 0;
        });
      }
    } else {
      // For distance-based sports
      const aerobicSeriesMultiplier = AEROBIC_SPORTS.includes(sport as any) ? (mf.aerobicSeries || 1) : 1;
      mf.movelaps?.forEach((ml: any) => {
        sportTotals[sport].distance += (parseInt(ml.distance) || 0) * aerobicSeriesMultiplier;
        const durationValue = parseInt(ml.duration) || 0;
        sportTotals[sport].duration += durationValue * aerobicSeriesMultiplier;
      });
    }
  });
  
  // Calculate grand totals
  const grandTotals = Object.values(sportTotals).reduce((acc, sport) => ({
    moveframes: acc.moveframes + sport.moveframes,
    movelaps: acc.movelaps + sport.movelaps,
    distance: acc.distance + sport.distance,
    duration: acc.duration + sport.duration,
    series: acc.series + sport.series,
    repetitions: acc.repetitions + sport.repetitions
  }), { moveframes: 0, movelaps: 0, distance: 0, duration: 0, series: 0, repetitions: 0 });
  
  // Print handler
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Workout Overview: {workout.name || workoutInfo.name || 'Unnamed Workout'}
            </h2>
            {workoutInfo.code && (
              <p className="text-sm text-gray-600">Code: {workoutInfo.code}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2 text-sm font-semibold"
              title="Print this workout"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded-lg transition"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {/* Workout Annotations/Notes */}
          {workoutInfo.notes && (
            <div className="mb-4 p-4 bg-amber-50 border-2 border-amber-300 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-700">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
                <h3 className="text-base font-bold text-amber-900">Workout Annotations</h3>
              </div>
              <div 
                className="text-sm text-gray-800 bg-white border border-amber-200 rounded-lg p-3 whitespace-pre-wrap"
              >
                {workoutInfo.notes}
              </div>
            </div>
          )}

          {/* Workout Summary Table */}
          <div className="mb-4 p-3 bg-white border-2 border-gray-300 rounded-lg">
            <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
              Workout Summary
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-2 py-1.5 text-left font-semibold">Sport</th>
                    <th className="border border-gray-300 px-2 py-1.5 text-center font-semibold">Moveframes</th>
                    <th className="border border-gray-300 px-2 py-1.5 text-center font-semibold">Movelaps</th>
                    <th className="border border-gray-300 px-2 py-1.5 text-center font-semibold">Distance</th>
                    <th className="border border-gray-300 px-2 py-1.5 text-center font-semibold">Series</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(sportTotals).map(([sport, totals]) => {
                    const isSeriesSport = !shouldShowDistance(sport);
                    return (
                      <tr key={sport} className="hover:bg-blue-50">
                        <td className="border border-gray-300 px-2 py-1.5 font-medium">{sport.replace(/_/g, ' ')}</td>
                        <td className="border border-gray-300 px-2 py-1.5 text-center">{totals.moveframes}</td>
                        <td className="border border-gray-300 px-2 py-1.5 text-center">{totals.movelaps}</td>
                        <td className="border border-gray-300 px-2 py-1.5 text-center">
                          {shouldShowDistance(sport) && totals.distance > 0 
                            ? `${totals.distance}${getDistanceUnit(sport)}` 
                            : '-'}
                        </td>
                        <td className="border border-gray-300 px-2 py-1.5 text-center">
                          {totals.series > 0 || totals.repetitions > 0
                            ? `${totals.series || totals.repetitions} series`
                            : '-'}
                        </td>
                      </tr>
                    );
                  })}
                  <tr className="bg-blue-100 font-bold">
                    <td className="border border-gray-300 px-2 py-1.5">TOTAL</td>
                    <td className="border border-gray-300 px-2 py-1.5 text-center">{grandTotals.moveframes}</td>
                    <td className="border border-gray-300 px-2 py-1.5 text-center">{grandTotals.movelaps}</td>
                    <td className="border border-gray-300 px-2 py-1.5 text-center">
                      {grandTotals.distance > 0 ? `${grandTotals.distance}m` : '-'}
                    </td>
                    <td className="border border-gray-300 px-2 py-1.5 text-center">
                      {grandTotals.series > 0 || grandTotals.repetitions > 0
                        ? `${grandTotals.series || grandTotals.repetitions} series`
                        : '-'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Toggle for showing movelaps */}
          <div className="mb-3 flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showMovelaps}
                onChange={(e) => setShowMovelaps(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Show Movelaps Details</span>
            </label>
          </div>

          {/* Detailed Moveframes and Movelaps Table */}
          <div className="bg-white border-2 border-gray-300 rounded-lg p-3">
            <h3 className="text-sm font-bold text-gray-900 mb-3">Workout Details</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border border-gray-300 px-2 py-1.5 text-left font-semibold">MF</th>
                    <th className="border border-gray-300 px-2 py-1.5 text-left font-semibold">Sport</th>
                    <th className="border border-gray-300 px-2 py-1.5 text-left font-semibold">Name</th>
                    {showMovelaps && (
                      <>
                        <th className="border border-gray-300 px-2 py-1.5 text-center font-semibold">#</th>
                        <th className="border border-gray-300 px-2 py-1.5 text-center font-semibold">Distance</th>
                        <th className="border border-gray-300 px-2 py-1.5 text-center font-semibold">Series</th>
                        <th className="border border-gray-300 px-2 py-1.5 text-left font-semibold">Notes</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {moveframes.map((mf: any, mfIdx: number) => {
                    const movelapCount = mf.movelaps?.length || 0;
                    
                    if (!showMovelaps) {
                      return (
                        <tr key={mf.id} className="hover:bg-blue-50">
                          <td className="border border-gray-300 px-2 py-1.5 font-bold">{String.fromCharCode(65 + mfIdx)}</td>
                          <td className="border border-gray-300 px-2 py-1.5">{mf.sport?.replace(/_/g, ' ')}</td>
                          <td className="border border-gray-300 px-2 py-1.5">{mf.name || '-'}</td>
                        </tr>
                      );
                    }
                    
                    return mf.movelaps?.map((ml: any, mlIdx: number) => (
                      <tr key={`${mf.id}-${ml.id}`} className="hover:bg-blue-50">
                        {mlIdx === 0 && (
                          <>
                            <td rowSpan={movelapCount} className="border border-gray-300 px-2 py-1.5 font-bold bg-gray-50">
                              {String.fromCharCode(65 + mfIdx)}
                            </td>
                            <td rowSpan={movelapCount} className="border border-gray-300 px-2 py-1.5 bg-gray-50">
                              {mf.sport?.replace(/_/g, ' ')}
                            </td>
                            <td rowSpan={movelapCount} className="border border-gray-300 px-2 py-1.5 bg-gray-50">
                              {mf.name || '-'}
                            </td>
                          </>
                        )}
                        <td className="border border-gray-300 px-2 py-1.5 text-center">{mlIdx + 1}</td>
                        <td className="border border-gray-300 px-2 py-1.5 text-center">
                          {shouldShowDistance(mf.sport) && ml.distance ? `${ml.distance}${getDistanceUnit(mf.sport)}` : '-'}
                        </td>
                        <td className="border border-gray-300 px-2 py-1.5 text-center">
                          {shouldShowDistance(mf.sport) 
                            ? (ml.duration ? `${ml.duration}s` : '-')
                            : '1 series'}
                        </td>
                        <td className="border border-gray-300 px-2 py-1.5 text-xs">{ml.notes || '-'}</td>
                      </tr>
                    )) || (
                      <tr key={mf.id} className="hover:bg-blue-50">
                        <td className="border border-gray-300 px-2 py-1.5 font-bold">{String.fromCharCode(65 + mfIdx)}</td>
                        <td className="border border-gray-300 px-2 py-1.5">{mf.sport?.replace(/_/g, ' ')}</td>
                        <td className="border border-gray-300 px-2 py-1.5" colSpan={5}>{mf.name || '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
