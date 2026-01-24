'use client';

import React, { useState } from 'react';
import { AlertCircle, RefreshCw, Settings, Clock, Play } from 'lucide-react';
import Image from 'next/image';
import CircuitExecutionPlayer from './CircuitExecutionPlayer';
import CircuitPlanner_OLD from './CircuitPlanner_OLD';

interface CircuitExercise {
  letter: string;
  name: string;
  isActive: boolean;
}

interface CircuitRow {
  circuit: string;
  series: number;
  station: number;
  sector: string;
  exercise: string;
  rip: string;
  pause: string;
}

interface BatteryCircuitPlannerProps {
  sectionId: string;
  sport: string;
  workout: any;
  day: any;
  onCreateCircuit: (data: any) => void;
  onCancel: () => void;
}

export default function BatteryCircuitPlanner({
  sectionId,
  sport,
  workout,
  day,
  onCreateCircuit,
  onCancel
}: BatteryCircuitPlannerProps) {
  const [description, setDescription] = useState('');
  const [showOldCircuitPlanner, setShowOldCircuitPlanner] = useState(false);
  
  // Circuit settings - All 9 circuits (A-I)
  const [circuits, setCircuits] = useState<CircuitExercise[]>([
    { letter: 'A', name: '', isActive: true },
    { letter: 'B', name: '', isActive: true },
    { letter: 'C', name: '', isActive: true },
    { letter: 'D', name: '', isActive: false },
    { letter: 'E', name: '', isActive: false },
    { letter: 'F', name: '', isActive: false },
    { letter: 'G', name: '', isActive: false },
    { letter: 'H', name: '', isActive: false },
    { letter: 'I', name: '', isActive: false }
  ]);
  
  const [numCircuits, setNumCircuits] = useState(3);
  const [pauseCircuits, setPauseCircuits] = useState(4); // in minutes
  
  // Station settings
  const [stationsPerCircuit, setStationsPerCircuit] = useState(5);
  const [pauseStations, setPauseStations] = useState(10); // in seconds
  
  // Series settings
  const [seriesMode, setSeriesMode] = useState<'series' | 'time'>('series');
  const [seriesPerCircuit, setSeriesPerCircuit] = useState(2);
  const [timePerCircuit, setTimePerCircuit] = useState(5); // in minutes
  const [pauseSeries, setPauseSeries] = useState(2); // in minutes
  
  // Execution settings
  const [executionOrder, setExecutionOrder] = useState<'vertical' | 'horizontal'>('vertical');
  const [executionPauseStations, setExecutionPauseStations] = useState('');
  
  // Execution player state
  const [showExecutionPlayer, setShowExecutionPlayer] = useState(false);
  
  // Toggle circuit active state
  const toggleCircuit = (index: number) => {
    const newCircuits = [...circuits];
    newCircuits[index].isActive = !newCircuits[index].isActive;
    setCircuits(newCircuits);
    
    // Update numCircuits count
    const activeCount = newCircuits.filter(c => c.isActive).length;
    setNumCircuits(activeCount);
  };
  
  // Handle numCircuits change to update active circuits
  const handleNumCircuitsChange = (value: number) => {
    setNumCircuits(value);
    const newCircuits = circuits.map((circuit, index) => ({
      ...circuit,
      isActive: index < value
    }));
    setCircuits(newCircuits);
  };
  
  const generateCircuitTemplate = () => {
    if (!sectionId) {
      alert('Please select a workout section');
      return;
    }
    
    // Pass current configuration to the old circuit planner
    setShowOldCircuitPlanner(true);
  };

  // If showing old circuit planner, render it instead of the first view
  if (showOldCircuitPlanner) {
    return (
      <CircuitPlanner_OLD
        sport={sport}
        initialConfig={{
          numCircuits,
          stationsPerCircuit,
          seriesMode: seriesMode === 'series' ? 'count' : 'time',
          seriesCount: seriesPerCircuit,
          pauseStations,
          pauseCircuits,
          pauseSeries,
          executionMode: executionOrder,
          startInTablePhase: true
        }}
        onSave={(data: any) => {
          // Pass the circuit data to the parent component
          onCreateCircuit({
            ...data,
            description,
            settings: {
              numCircuits,
              pauseCircuits,
              stationsPerCircuit,
              pauseStations,
              seriesMode,
              seriesPerCircuit,
              timePerCircuit,
              pauseSeries,
              executionOrder,
              executionPauseStations
            }
          });
          setShowOldCircuitPlanner(false);
        }}
        onCancel={() => setShowOldCircuitPlanner(false)}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Warning Message */}
      <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3 flex items-start gap-2">
        <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-yellow-800">⚠️ Here you can create sequences of exercises to be performed in circuits to be repeated</p>
      </div>
      
      {/* Descriptions & Instructions */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Descriptions & instructions</label>
        <textarea 
          value={description} 
          onChange={(e) => setDescription(e.target.value)} 
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-green-50" 
          rows={3} 
          placeholder="Add circuit description and instructions..." 
        />
      </div>
      
      <div className="space-y-4">
        {/* ROW 1: Circuit Letters (A-I) with No. Circuits and Pause\circuits */}
          <div className="grid grid-cols-2 gap-4">
            {/* Left: Circuit Letter Buttons WITHOUT pause indicators */}
            <div className="p-4 bg-gray-50 border-2 border-gray-300 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                {circuits.slice(0, 9).map((circuit, index) => (
                  <button
                    key={circuit.letter}
                    type="button"
                    onClick={() => toggleCircuit(index)}
                    className={`w-14 h-12 rounded flex items-center justify-center font-bold text-xl border-2 transition-all ${
                      circuit.isActive 
                        ? 'bg-yellow-400 border-yellow-600 text-black shadow-md' 
                        : 'bg-gray-200 border-gray-400 text-gray-600 hover:bg-gray-300'
                    }`}
                  >
                    {circuit.letter}
                  </button>
                ))}
              </div>
              
              {/* No. Circuits Control */}
              <div className="flex items-center justify-start gap-2">
                <label className="text-sm font-medium text-gray-700">No. Circuits</label>
                <select 
                  value={numCircuits} 
                  onChange={(e) => handleNumCircuitsChange(parseInt(e.target.value))}
                  className="w-16 px-2 py-1.5 border border-gray-400 rounded text-center focus:ring-2 focus:ring-blue-500 text-sm font-semibold bg-yellow-100"
                >
                  {[1,2,3,4,5,6,7,8,9].map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
                <button type="button" className="w-6 h-6 rounded-full bg-gray-300 hover:bg-gray-400 flex items-center justify-center text-gray-700 text-lg font-bold">×</button>
              </div>
            </div>
            
            {/* Right: Circuit Letters WITH pause indicators (timer icons) */}
            <div className="p-4 bg-gray-50 border-2 border-gray-300 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                {circuits.slice(0, 9).map((circuit, index) => (
                  <div key={`pause-${circuit.letter}`} className="relative">
                    <button
                      type="button"
                      onClick={() => toggleCircuit(index)}
                      className={`w-14 h-12 rounded flex items-center justify-center font-bold text-xl border-2 transition-all ${
                        circuit.isActive 
                          ? 'bg-yellow-400 border-yellow-600 text-black shadow-md' 
                          : 'bg-gray-200 border-gray-400 text-gray-600 hover:bg-gray-300'
                      }`}
                    >
                      {circuit.letter}
                    </button>
                    {/* Timer icon below active circuits */}
                    {circuit.isActive && (
                      <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2">
                        <div className="w-6 h-6 rounded-full bg-yellow-400 border-2 border-yellow-600 flex items-center justify-center shadow-sm">
                          <Image src="/timer.png" alt="timer" width={12} height={12} />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Pause\circuits Control */}
              <div className="flex items-center justify-end gap-2">
                <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Pause\circuits</label>
                <select 
                  value={pauseCircuits} 
                  onChange={(e) => setPauseCircuits(parseInt(e.target.value))}
                  className="w-16 px-2 py-1.5 border border-gray-400 rounded text-center focus:ring-2 focus:ring-blue-500 text-sm font-semibold"
                >
                  {[1,2,3,4,5,6,7,8,9,10].map(n => (
                    <option key={n} value={n}>{n}'</option>
                  ))}
                </select>
                <button type="button" className="w-6 h-6 rounded-full bg-gray-300 hover:bg-gray-400 flex items-center justify-center text-gray-700 text-lg font-bold">×</button>
              </div>
            </div>
          </div>
          
          {/* ROW 2: Stations Visualization */}
          <div className="grid grid-cols-2 gap-4">
            {/* Left: Station\circuit WITHOUT pause indicators */}
            <div className="p-4 bg-gray-50 border border-gray-300 rounded-lg">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-12 h-12 rounded flex items-center justify-center font-bold bg-yellow-400 border-2 border-yellow-600 text-black text-xl shadow-md">
                  A
                </div>
                {[...Array(stationsPerCircuit)].map((_, i) => (
                  <div key={i} className="flex-1 h-8 bg-cyan-500 border-2 border-cyan-700 rounded-md shadow-sm" />
                ))}
              </div>
              <div className="flex items-center justify-start gap-2 mt-4">
                <label className="text-sm font-medium text-gray-700">Station\circuit</label>
                <select 
                  value={stationsPerCircuit} 
                  onChange={(e) => setStationsPerCircuit(parseInt(e.target.value))}
                  className="w-16 px-2 py-1.5 border border-gray-400 rounded text-center focus:ring-2 focus:ring-blue-500 text-sm font-semibold"
                >
                  {[2,3,4,5,6,7,8,9].map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
                <button type="button" className="w-6 h-6 rounded-full bg-gray-300 hover:bg-gray-400 flex items-center justify-center text-gray-700 text-lg font-bold">×</button>
              </div>
            </div>
            
            {/* Right: Pause\stations WITH timer icons between stations */}
            <div className="p-4 bg-gray-50 border border-gray-300 rounded-lg">
              <div className="flex items-center gap-1 mb-4">
                <div className="w-12 h-12 rounded flex items-center justify-center font-bold bg-yellow-400 border-2 border-yellow-600 text-black text-xl shadow-md flex-shrink-0">
                  A
                </div>
                {[...Array(stationsPerCircuit)].map((_, i) => (
                  <React.Fragment key={i}>
                    <div className="flex-1 h-8 bg-cyan-500 border-2 border-cyan-700 rounded-md shadow-sm" />
                    {i < stationsPerCircuit - 1 && (
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-yellow-400 border-2 border-yellow-600 flex items-center justify-center shadow-md">
                        <Image src="/timer.png" alt="timer" width={16} height={16} />
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
              <div className="flex items-center justify-end gap-2 mt-4">
                <label className="text-sm font-medium text-gray-700">Pause\stations</label>
                <select 
                  value={pauseStations} 
                  onChange={(e) => setPauseStations(parseInt(e.target.value))}
                  className="w-20 px-2 py-1.5 border border-gray-400 rounded text-center focus:ring-2 focus:ring-blue-500 text-sm font-semibold"
                >
                  {[5,10,15,20,25,30,40,50,60].map(n => (
                    <option key={n} value={n}>{n}"</option>
                  ))}
                </select>
                <button type="button" className="w-6 h-6 rounded-full bg-gray-300 hover:bg-gray-400 flex items-center justify-center text-gray-700 text-lg font-bold">×</button>
              </div>
            </div>
          </div>
          
          {/* ROW 3: Series Visualization */}
          <div className="grid grid-cols-2 gap-4">
            {/* Left: Set series/time per circuit WITHOUT timer icon */}
            <div className="p-4 bg-gray-50 border border-gray-300 rounded-lg">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 rounded flex items-center justify-center font-bold bg-yellow-400 border-2 border-yellow-600 text-black text-2xl shadow-md flex-shrink-0">
                  A
                </div>
                <div className="flex-1 relative">
                  {/* Large dashed border visualization box WITHOUT timer icon - Screenshot 2 style */}
                  <div className="relative bg-white border-4 border-dashed border-gray-400 rounded-lg p-3 h-48 flex gap-2">
                    {/* Left side: Horizontal gray bars (stations) - THICKER */}
                    <div className="flex-1 flex flex-col justify-between py-2">
                      {[...Array(Math.min(seriesPerCircuit * 2, 8))].map((_, i) => (
                        <div key={i} className="h-3 bg-gray-300 border-2 border-gray-400 rounded-sm" />
                      ))}
                    </div>
                    
                    {/* Right side: Yellow vertical bar with RED ARROWS */}
                    <div className="relative w-10 bg-yellow-400 border-2 border-yellow-600 rounded flex flex-col justify-center items-center py-2">
                      {/* Red arrows pointing DOWN on the right outline */}
                      <div className="absolute right-0 top-8 w-4 h-4 flex items-center justify-center transform translate-x-1/2">
                        <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-red-600" />
                      </div>
                      <div className="absolute right-0 bottom-8 w-4 h-4 flex items-center justify-center transform translate-x-1/2">
                        <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-red-600" />
                      </div>
                      
                      {/* Red arrows pointing UP on the left outline */}
                      <div className="absolute left-0 top-8 w-4 h-4 flex items-center justify-center transform -translate-x-1/2">
                        <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[8px] border-b-red-600" />
                      </div>
                      <div className="absolute left-0 bottom-8 w-4 h-4 flex items-center justify-center transform -translate-x-1/2">
                        <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[8px] border-b-red-600" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer bg-white border border-gray-300 rounded px-3 py-2">
                    <input 
                      type="radio" 
                      checked={seriesMode === 'series'} 
                      onChange={() => setSeriesMode('series')} 
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm font-medium text-gray-700">Set series\circuit</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer bg-white border border-gray-300 rounded px-3 py-2">
                    <input 
                      type="radio" 
                      checked={seriesMode === 'time'} 
                      onChange={() => setSeriesMode('time')} 
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm font-medium text-gray-700">Set time\circuit</span>
                  </label>
                </div>
                
                <div className="flex items-center gap-2 bg-white border border-gray-300 rounded px-2 py-1">
                  {seriesMode === 'series' ? (
                    <select 
                      value={seriesPerCircuit} 
                      onChange={(e) => setSeriesPerCircuit(parseInt(e.target.value))}
                      className="w-16 px-2 py-1 border border-gray-400 rounded text-center focus:ring-2 focus:ring-blue-500 text-base font-bold"
                    >
                      {[1,2,3,4,5,6,7,8,9,10].map(n => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  ) : (
                    <select 
                      value={timePerCircuit} 
                      onChange={(e) => setTimePerCircuit(parseInt(e.target.value))}
                      className="w-16 px-2 py-1 border border-blue-500 rounded text-center focus:ring-2 focus:ring-blue-500 text-base font-bold bg-blue-50"
                    >
                      {[1,2,3,4,5,6,7,8,9,10].map(n => (
                        <option key={n} value={n}>{n}'</option>
                      ))}
                    </select>
                  )}
                  <button type="button" className="w-7 h-7 rounded-full bg-gray-300 hover:bg-gray-400 flex items-center justify-center text-gray-700 text-lg font-bold">×</button>
                </div>
              </div>
            </div>
            
            {/* Right: Pause among series WITH timer icon */}
            <div className="p-4 bg-gray-50 border border-gray-300 rounded-lg">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 rounded flex items-center justify-center font-bold bg-yellow-400 border-2 border-yellow-600 text-black text-2xl shadow-md flex-shrink-0">
                  A
                </div>
                <div className="flex-1 relative">
                  {/* Large dashed border visualization box WITH timer icon - Screenshot 3 style */}
                  <div className="relative bg-white border-4 border-dashed border-gray-400 rounded-lg p-3 h-48 flex gap-2">
                    {/* Left side: Horizontal gray bars (stations) - THICKER */}
                    <div className="flex-1 flex flex-col justify-between py-2">
                      {[...Array(Math.min(seriesPerCircuit * 2, 8))].map((_, i) => (
                        <div key={i} className="h-3 bg-gray-300 border-2 border-gray-400 rounded-sm" />
                      ))}
                    </div>
                    
                    {/* Right side: WHITE vertical bar with RED ARROWS */}
                    <div className="relative w-10 bg-white border-2 border-gray-400 rounded flex flex-col justify-end items-center py-2">
                      {/* Yellow circle at bottom WITH timer icon */}
                      <div className="relative">
                        <div className="w-7 h-7 rounded-full bg-yellow-400 border-2 border-yellow-600 shadow-sm flex items-center justify-center">
                          <Image src="/timer.png" alt="timer" width={14} height={14} />
                        </div>
                      </div>
                      
                      {/* Red arrows pointing DOWN on the right outline */}
                      <div className="absolute right-0 top-8 w-4 h-4 flex items-center justify-center transform translate-x-1/2">
                        <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-red-600" />
                      </div>
                      <div className="absolute right-0 bottom-8 w-4 h-4 flex items-center justify-center transform translate-x-1/2">
                        <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-red-600" />
                      </div>
                      
                      {/* Red arrows pointing UP on the left outline */}
                      <div className="absolute left-0 top-8 w-4 h-4 flex items-center justify-center transform -translate-x-1/2">
                        <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[8px] border-b-red-600" />
                      </div>
                      <div className="absolute left-0 bottom-8 w-4 h-4 flex items-center justify-center transform -translate-x-1/2">
                        <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[8px] border-b-red-600" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-end gap-3">
                <div className="bg-white border border-gray-300 rounded px-3 py-2">
                  <label className="text-sm font-medium text-gray-700">Pause among series</label>
                </div>
                <div className="flex items-center gap-2 bg-white border border-gray-300 rounded px-2 py-1">
                  <select 
                    value={pauseSeries} 
                    onChange={(e) => setPauseSeries(parseInt(e.target.value))}
                    disabled={seriesMode === 'time'}
                    className="w-16 px-2 py-1 border border-gray-400 rounded text-center focus:ring-2 focus:ring-blue-500 disabled:bg-gray-200 disabled:text-gray-400 disabled:border-gray-300 text-base font-semibold"
                  >
                    {[1,2,3,4,5,6,7,8,9,10].map(n => (
                      <option key={n} value={n}>{n}'</option>
                    ))}
                  </select>
                  <button type="button" disabled={seriesMode === 'time'} className="w-7 h-7 rounded-full bg-gray-300 hover:bg-gray-400 flex items-center justify-center text-gray-700 text-lg font-bold disabled:opacity-50">×</button>
                </div>
              </div>
            </div>
          </div>
          
          {/* ROW 4: Execution Order Visualization */}
          <div className="grid grid-cols-2 gap-4">
            {/* Left: Execution vertically WITHOUT pause indicators */}
            <div className="p-4 bg-gray-50 border border-gray-300 rounded-lg">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 rounded flex items-center justify-center font-bold bg-yellow-400 border-2 border-yellow-600 text-black text-xl shadow-md flex-shrink-0">
                  A
                </div>
                <div className="flex-1 relative">
                  {/* Vertical execution visualization - simple bars */}
                  <div className="space-y-1.5">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="flex-1 h-4 bg-cyan-400 border-2 border-cyan-600 rounded-sm" />
                        <span className="text-orange-500 font-bold text-base">→</span>
                        {/* Red circle next to first arrow or invisible spacer */}
                        {i === 0 ? (
                          <div className="w-6 h-6 rounded-full bg-red-500 border-2 border-red-700 shadow-sm ml-1" />
                        ) : i === 5 ? (
                          <div className="w-6 h-6 rounded-full bg-green-500 border-2 border-green-700 shadow-sm ml-1" />
                        ) : (
                          <div className="w-6 h-6 ml-1" />
                        )}
                      </div>
                    ))}
                  </div>
                  {/* Vertical line connecting red and green circles */}
                  <div className="absolute right-3 top-8 bottom-8">
                    <div className="w-0.5 bg-gray-400 h-full" />
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    checked={executionOrder === 'vertical'} 
                    onChange={() => setExecutionOrder('vertical')} 
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Execution vertically
                    <span className="text-xs text-gray-500 ml-1">(1 serie for station)</span>
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    checked={executionOrder === 'horizontal'} 
                    onChange={() => setExecutionOrder('horizontal')} 
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Execution horizontally
                    <span className="text-xs text-gray-500 ml-1">(all series for station)</span>
                  </span>
                </label>
              </div>
            </div>
            
            {/* Right: Horizontal execution with A, B, C circuits */}
            <div className="p-4 bg-gray-50 border border-gray-300 rounded-lg">
              <div className="space-y-2 mb-4">
                {['A', 'B', 'C'].map((letter) => (
                  <div key={letter} className="flex items-center gap-1">
                    <div className="w-10 h-10 rounded flex items-center justify-center font-bold bg-yellow-400 border-2 border-yellow-600 text-black text-base shadow-md flex-shrink-0">
                      {letter}
                    </div>
                    {[...Array(3)].map((_, j) => (
                      <React.Fragment key={j}>
                        <div className="flex-1 h-5 bg-cyan-400 border-2 border-cyan-600 rounded-sm" />
                        {j < 2 && <span className="text-orange-500 font-bold text-base">→</span>}
                      </React.Fragment>
                    ))}
                  </div>
                ))}
              </div>
              
              <div className="flex items-center justify-end gap-2 mt-4">
                <label className="text-sm font-medium text-gray-700">Pause\stations</label>
                <select 
                  value={executionPauseStations || ''} 
                  onChange={(e) => setExecutionPauseStations(e.target.value)}
                  className="w-20 px-2 py-1.5 border border-gray-400 rounded text-center focus:ring-2 focus:ring-blue-500 text-sm font-semibold"
                >
                  <option value=""></option>
                  {[5,10,15,20,25,30,40,50,60].map(n => (
                    <option key={n} value={n}>{n}"</option>
                  ))}
                </select>
                <button type="button" className="w-6 h-6 rounded-full bg-gray-300 hover:bg-gray-400 flex items-center justify-center text-gray-700 text-lg font-bold">×</button>
              </div>
            </div>
          </div>
        </div>
      
      <div className="flex items-center justify-between pt-4 border-t">
        <button type="button" onClick={onCancel} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
        <div className="flex gap-3">
          <button type="button" className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"><Settings className="w-4 h-4" />Preferences</button>
          <button 
            type="button" 
            onClick={generateCircuitTemplate} 
            disabled={!sectionId}
            className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
          >
            Create circuit
          </button>
        </div>
      </div>
    </div>
  );
}

