'use client';

import React, { useState } from 'react';
import { X, Info, ChevronDown, ChevronUp } from 'lucide-react';

interface WorkoutHierarchyGuideProps {
  onClose?: () => void;
}

export default function WorkoutHierarchyGuide({ onClose }: WorkoutHierarchyGuideProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>('workout');

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Info className="w-8 h-8" />
            <div>
              <h2 className="text-2xl font-bold">Workout Structure Guide</h2>
              <p className="text-sm text-blue-100">Understanding the hierarchy: Day → Workout → Moveframe → Movelap</p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          
          {/* Day Section */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div
              className="bg-gradient-to-r from-green-50 to-green-100 p-4 cursor-pointer hover:bg-green-100 transition-colors flex items-center justify-between"
              onClick={() => toggleSection('day')}
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">📅</span>
                <div>
                  <h3 className="text-xl font-bold text-green-900">DAY</h3>
                  <p className="text-sm text-green-700">The training day container</p>
                </div>
              </div>
              {expandedSection === 'day' ? <ChevronUp className="w-5 h-5 text-green-700" /> : <ChevronDown className="w-5 h-5 text-green-700" />}
            </div>
            {expandedSection === 'day' && (
              <div className="p-4 bg-white border-t border-green-200">
                <div className="space-y-3 text-sm">
                  <p className="font-medium text-gray-700">A Day represents one calendar date in your training plan.</p>
                  <div className="bg-green-50 p-3 rounded">
                    <p className="font-semibold text-green-900 mb-2">✔ Key Facts:</p>
                    <ul className="space-y-1 text-green-800">
                      <li>• Can contain <strong>max 3 workouts</strong> (morning, afternoon, evening)</li>
                      <li>• Each workout is independent</li>
                      <li>• Days are organized by weeks in your plan</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Workout Section */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 cursor-pointer hover:bg-blue-100 transition-colors flex items-center justify-between"
              onClick={() => toggleSection('workout')}
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">🏋️</span>
                <div>
                  <h3 className="text-xl font-bold text-blue-900">WORKOUT</h3>
                  <p className="text-sm text-blue-700">A full training session</p>
                </div>
              </div>
              {expandedSection === 'workout' ? <ChevronUp className="w-5 h-5 text-blue-700" /> : <ChevronDown className="w-5 h-5 text-blue-700" />}
            </div>
            {expandedSection === 'workout' && (
              <div className="p-4 bg-white border-t border-blue-200">
                <div className="space-y-3 text-sm">
                  <p className="font-medium text-gray-700">A Workout is the whole training session an athlete does at one time of the day.</p>
                  <div className="bg-blue-50 p-3 rounded">
                    <p className="font-semibold text-blue-900 mb-2">✔ Key Facts:</p>
                    <ul className="space-y-1 text-blue-800">
                      <li>• A day can have <strong>max 3 workouts</strong>: Workout #1 ○, Workout #2 □, Workout #3 △</li>
                      <li>• A workout can contain many different exercises (Moveframes)</li>
                      <li>• A workout can mix <strong>up to 4 sports</strong> (e.g., swim + run + bike + gym)</li>
                    </ul>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="font-semibold text-gray-900 mb-2">📋 Examples:</p>
                    <ul className="space-y-1 text-gray-700">
                      <li>• <strong>Workout 1</strong> → Warm-up + Swim sets + Run intervals</li>
                      <li>• <strong>Workout 2</strong> → Strength session</li>
                      <li>• <strong>Workout 3</strong> → Easy recovery jog</li>
                    </ul>
                  </div>
                  <p className="italic text-gray-600">💡 Think of a workout like: "The full training session for that part of the day."</p>
                </div>
              </div>
            )}
          </div>

          {/* Moveframe Section */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div
              className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 cursor-pointer hover:bg-purple-100 transition-colors flex items-center justify-between"
              onClick={() => toggleSection('moveframe')}
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">📋</span>
                <div>
                  <h3 className="text-xl font-bold text-purple-900">MOVEFRAME</h3>
                  <p className="text-sm text-purple-700">One block/set of exercise instructions</p>
                </div>
              </div>
              {expandedSection === 'moveframe' ? <ChevronUp className="w-5 h-5 text-purple-700" /> : <ChevronDown className="w-5 h-5 text-purple-700" />}
            </div>
            {expandedSection === 'moveframe' && (
              <div className="p-4 bg-white border-t border-purple-200">
                <div className="space-y-3 text-sm">
                  <p className="font-medium text-gray-700">A Moveframe is one block of exercises that belongs to a workout. It is the "heart" of the training session.</p>
                  <div className="bg-purple-50 p-3 rounded">
                    <p className="font-semibold text-purple-900 mb-2">✔ Moveframe Rules:</p>
                    <ul className="space-y-1 text-purple-800">
                      <li>• Each moveframe is tied to <strong>ONE sport only</strong></li>
                      <li>• A workout can have many moveframes (A, B, C, D, ...)</li>
                      <li>• Moveframes are ordered alphabetically: A, B, C... Z, then AA, AB, AC... if needed</li>
                      <li>• Contains description + parameters: meters, pace, style, reps, pause, speed, type, etc.</li>
                    </ul>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="font-semibold text-gray-900 mb-2">📋 Examples:</p>
                    <ul className="space-y-2 text-gray-700">
                      <li>
                        <strong>Moveframe A (swim):</strong><br />
                        100m Freestyle × 10, Speed A2, Pause 20"
                      </li>
                      <li>
                        <strong>Moveframe B (run):</strong><br />
                        400m × 6, Speed B1, Pause 1'30"
                      </li>
                      <li>
                        <strong>Moveframe C (gym):</strong><br />
                        Squat × 12 reps, Speed slow, Pause 45"
                      </li>
                    </ul>
                  </div>
                  <p className="italic text-gray-600">💡 Think of a moveframe like: "A set or group of repeated instructions."</p>
                </div>
              </div>
            )}
          </div>

          {/* Movelap Section */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div
              className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 cursor-pointer hover:bg-orange-100 transition-colors flex items-center justify-between"
              onClick={() => toggleSection('movelap')}
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">🔄</span>
                <div>
                  <h3 className="text-xl font-bold text-orange-900">MOVELAP (MICROLAP)</h3>
                  <p className="text-sm text-orange-700">A single repetition of the Moveframe</p>
                </div>
              </div>
              {expandedSection === 'movelap' ? <ChevronUp className="w-5 h-5 text-orange-700" /> : <ChevronDown className="w-5 h-5 text-orange-700" />}
            </div>
            {expandedSection === 'movelap' && (
              <div className="p-4 bg-white border-t border-orange-200">
                <div className="space-y-3 text-sm">
                  <p className="font-medium text-gray-700">A Movelap (also called microlap) is ONE SINGLE repetition of the Moveframe. Each Movelap is generated from the Moveframe.</p>
                  <div className="bg-orange-50 p-3 rounded">
                    <p className="font-semibold text-orange-900 mb-2">✔ Movelap Rules:</p>
                    <ul className="space-y-1 text-orange-800">
                      <li>• Every Movelap inherits the sport and type from its Moveframe</li>
                      <li>• Every Movelap uses the same MF code (A, B, ...)</li>
                      <li>• Movelaps can be: added, duplicated, edited, skipped, disabled, deleted, reordered</li>
                    </ul>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="font-semibold text-gray-900 mb-2">📋 Example:</p>
                    <div className="space-y-2 text-gray-700">
                      <p><strong>Moveframe:</strong> 400m × 6, Speed A2, Pause 1'30"</p>
                      <p><strong>Movelaps become:</strong></p>
                      <table className="w-full text-xs border border-gray-300">
                        <thead className="bg-gray-200">
                          <tr>
                            <th className="border border-gray-300 px-2 py-1">#</th>
                            <th className="border border-gray-300 px-2 py-1">Distance</th>
                            <th className="border border-gray-300 px-2 py-1">Speed</th>
                            <th className="border border-gray-300 px-2 py-1">Pause</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[1, 2, 3, 4, 5, 6].map((num) => (
                            <tr key={num} className={num % 2 === 0 ? 'bg-gray-50' : ''}>
                              <td className="border border-gray-300 px-2 py-1 text-center">{num}</td>
                              <td className="border border-gray-300 px-2 py-1 text-center">400m</td>
                              <td className="border border-gray-300 px-2 py-1 text-center">A2</td>
                              <td className="border border-gray-300 px-2 py-1 text-center">1'30"</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <p className="italic text-gray-600">💡 Think of a movelap like: "One repetition inside the exercise set."</p>
                </div>
              </div>
            )}
          </div>

          {/* Complete Example */}
          <div className="border-2 border-indigo-300 rounded-lg overflow-hidden bg-gradient-to-br from-indigo-50 to-purple-50">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <span>🧱</span>
                <span>Complete Example: Putting It All Together</span>
              </h3>
            </div>
            <div className="p-4 space-y-3 text-sm">
              <div className="bg-white p-3 rounded-lg border border-indigo-200">
                <p className="font-bold text-indigo-900 mb-2">📅 DAY: Monday</p>
                
                <div className="ml-4 space-y-3">
                  <div className="border-l-4 border-blue-400 pl-3">
                    <p className="font-semibold text-blue-900">○ Workout 1 (Swim)</p>
                    <div className="ml-4 mt-2 space-y-2">
                      <div className="border-l-4 border-purple-400 pl-3">
                        <p className="font-semibold text-purple-900">📋 Moveframe A: 100m freestyle × 10, A2, pause 20"</p>
                        <div className="ml-4 mt-1 text-xs text-gray-600">
                          <p>🔄 Movelap 1: 100m</p>
                          <p>🔄 Movelap 2: 100m</p>
                          <p className="text-gray-400">... (8 more)</p>
                          <p>🔄 Movelap 10: 100m</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-l-4 border-blue-400 pl-3">
                    <p className="font-semibold text-blue-900">□ Workout 2 (Gym)</p>
                    <div className="ml-4 mt-2">
                      <div className="border-l-4 border-purple-400 pl-3">
                        <p className="font-semibold text-purple-900">📋 Moveframe B: Squat × 12 reps, slow, pause 45"</p>
                        <div className="ml-4 mt-1 text-xs text-gray-600">
                          <p>🔄 Movelap 1: rep 1</p>
                          <p>🔄 Movelap 2: rep 2</p>
                          <p className="text-gray-400">... (10 more)</p>
                          <p>🔄 Movelap 12: rep 12</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-l-4 border-blue-400 pl-3">
                    <p className="font-semibold text-blue-900">△ Workout 3 (Run)</p>
                    <div className="ml-4 mt-2">
                      <div className="border-l-4 border-purple-400 pl-3">
                        <p className="font-semibold text-purple-900">📋 Moveframe C: 5km steady pace</p>
                        <div className="ml-4 mt-1 text-xs text-gray-600">
                          <p>🔄 Movelap 1: 5000m (single lap)</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-4 flex justify-end">
          {onClose && (
            <button
              onClick={onClose}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Got it!
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

