'use client';

import React, { useState } from 'react';
import { AlertCircle, RefreshCw, Settings } from 'lucide-react';

interface CircuitExercise {
  letter: string;
  name: string;
  color: string;
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
  const [plannerMode, setPlannerMode] = useState<'circuits' | 'fast' | 'ai'>('circuits');
  const [description, setDescription] = useState('');
  
  // Circuit settings
  const [exercises, setExercises] = useState<CircuitExercise[]>([
    { letter: 'A', name: '', color: '#FFD700' },
    { letter: 'B', name: '', color: '#FFD700' },
    { letter: 'C', name: '', color: '#FFD700' }
  ]);
  const [numCircuits, setNumCircuits] = useState(3);
  const [pauseCircuits, setPauseCircuits] = useState('4\'');
  
  // Station settings
  const [stationsPerCircuit, setStationsPerCircuit] = useState(6);
  const [pauseStations, setPauseStations] = useState('10"');
  
  // Series settings
  const [seriesMode, setSeriesMode] = useState<'series' | 'time'>('series');
  const [seriesPerCircuit, setSeriesPerCircuit] = useState(2);
  const [timePerCircuit, setTimePerCircuit] = useState('5\'00"');
  const [pauseSeries, setPauseSeries] = useState('2\'');
  
  // Execution settings
  const [executionOrder, setExecutionOrder] = useState<'vertical' | 'horizontal'>('vertical');
  const [executionPauseStations, setExecutionPauseStations] = useState('');
  
  // Template state
  const [showTemplate, setShowTemplate] = useState(false);
  const [circuitRows, setCircuitRows] = useState<CircuitRow[]>([]);
  
  const handleExerciseNameChange = (index: number, name: string) => {
    const newExercises = [...exercises];
    newExercises[index].name = name;
    setExercises(newExercises);
  };
  
  const generateCircuitTemplate = () => {
    if (!sectionId) {
      alert('Please select a workout section');
      return;
    }
    
    const rows: CircuitRow[] = [];
    for (let c = 0; c < exercises.length; c++) {
      const circuit = exercises[c];
      for (let s = 1; s <= seriesPerCircuit; s++) {
        for (let st = 1; st <= stationsPerCircuit; st++) {
          rows.push({
            circuit: circuit.letter,
            series: s,
            station: st,
            sector: '',
            exercise: '',
            rip: '',
            pause: ''
          });
        }
      }
    }
    
    setCircuitRows(rows);
    setShowTemplate(true);
  };
  
  const handleAddCircuit = () => {
    const nextLetter = String.fromCharCode(65 + exercises.length);
    setExercises([...exercises, { letter: nextLetter, name: '', color: '#FFD700' }]);
  };
  
  const handleBackToSettings = () => {
    setShowTemplate(false);
  };
  
  const handleSaveCircuit = () => {
    onCreateCircuit({ exercises, rows: circuitRows, description });
  };
  
  // Generate preview text
  const getPreviewText = () => {
    const orderText = executionOrder === 'vertical' ? 'vertically' : 'horizontally';
    const seriesAddedInfo = '1 serie added to the circuit B';
    return `${exercises.length} circuits of ${seriesPerCircuit} series each , with ${stationsPerCircuit} stations a circuit
Pause\\circ ${pauseCircuits} - Pause\\stations ${pauseStations} - Pause\\series ${pauseSeries} - execute serie ${orderText}
${seriesAddedInfo}`;
  };
  
  if (showTemplate) {
    return (
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-300 rounded-lg p-3">
          <h3 className="font-semibold text-sm text-gray-900 mb-2">PREVIEW:</h3>
          <pre className="text-sm text-gray-800 whitespace-pre-wrap">{getPreviewText()}</pre>
        </div>
        
        <div className="flex gap-2">
          <button type="button" onClick={handleAddCircuit} className="px-4 py-2 bg-gray-700 text-white rounded text-sm font-medium hover:bg-gray-800">Add a circuit</button>
          <button type="button" className="px-4 py-2 bg-gray-700 text-white rounded text-sm font-medium hover:bg-gray-800">Add a station</button>
          <button type="button" className="px-4 py-2 bg-gray-700 text-white rounded text-sm font-medium hover:bg-gray-800">Add serie to a circuit</button>
          <button type="button" className="px-4 py-2 bg-red-600 text-white rounded text-sm font-medium hover:bg-red-700">Remove</button>
        </div>
        
        <div className="bg-white border border-gray-300 rounded-lg overflow-hidden">
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  <th className="px-2 py-2 text-center border-r border-gray-300 w-8"></th>
                  <th className="px-2 py-2 text-center border-r border-gray-300 font-semibold" colSpan={3}>Parameters of work</th>
                  <th className="px-2 py-2 text-center border-r border-gray-300 font-semibold" colSpan={2}>Exercises</th>
                  <th className="px-2 py-2 text-center font-semibold" colSpan={2}>Load of work</th>
                </tr>
                <tr className="border-t border-gray-300">
                  <th className="px-2 py-2 text-center border-r border-gray-300 w-8"><button className="w-6 h-6 rounded-full bg-red-500 text-white hover:bg-red-600">×</button></th>
                  <th className="px-2 py-2 text-center border-r border-gray-300 bg-gray-50">Circ</th>
                  <th className="px-2 py-2 text-center border-r border-gray-300 bg-gray-50">Series</th>
                  <th className="px-2 py-2 text-center border-r border-gray-300 bg-gray-50">Stations</th>
                  <th className="px-2 py-2 text-center border-r border-gray-300 bg-gray-50">Sectors</th>
                  <th className="px-2 py-2 text-center border-r border-gray-300 bg-gray-50">Exercise</th>
                  <th className="px-2 py-2 text-center border-r border-gray-300 bg-gray-50">Rip</th>
                  <th className="px-2 py-2 text-center bg-gray-50">Pause</th>
                </tr>
              </thead>
              <tbody>
                {circuitRows.map((row, index) => (
                  <tr key={index} className="border-t border-gray-200 hover:bg-gray-50">
                    <td className="px-2 py-2 text-center border-r border-gray-200">
                      {row.series === 1 && row.station === 1 && (<button className="w-6 h-6 rounded-full bg-red-500 text-white hover:bg-red-600 text-xs">×</button>)}
                    </td>
                    <td className="px-2 py-2 text-center border-r border-gray-200 font-semibold">{row.circuit}</td>
                    <td className="px-2 py-2 text-center border-r border-gray-200">{row.series}</td>
                    <td className="px-2 py-2 text-center border-r border-gray-200">{row.station}</td>
                    <td className="px-2 py-2 border-r border-gray-200">
                      <input type="text" value={row.sector} onChange={(e) => {
                        const newRows = [...circuitRows];
                        newRows[index].sector = e.target.value;
                        setCircuitRows(newRows);
                      }} className="w-full px-2 py-1 border border-gray-300 rounded text-sm" />
                    </td>
                    <td className="px-2 py-2 border-r border-gray-200">
                      <input type="text" value={row.exercise} onChange={(e) => {
                        const newRows = [...circuitRows];
                        newRows[index].exercise = e.target.value;
                        setCircuitRows(newRows);
                      }} className="w-full px-2 py-1 bg-green-100 border border-green-300 rounded text-sm" placeholder="Exercise..." />
                    </td>
                    <td className="px-2 py-2 border-r border-gray-200">
                      <select value={row.rip} onChange={(e) => {
                        const newRows = [...circuitRows];
                        newRows[index].rip = e.target.value;
                        setCircuitRows(newRows);
                      }} className="w-full px-2 py-1 border border-gray-300 rounded text-sm">
                        <option value=""></option>
                        <option value="reps">Reps</option>
                        <option value="time">Time</option>
                      </select>
                    </td>
                    <td className="px-2 py-2">
                      <select value={row.pause} onChange={(e) => {
                        const newRows = [...circuitRows];
                        newRows[index].pause = e.target.value;
                        setCircuitRows(newRows);
                      }} className="w-full px-2 py-1 border border-gray-300 rounded text-sm">
                        <option value=""></option>
                        <option value="set">Set time</option>
                        <option value="restart">Restart time</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-4 border-t">
          <button type="button" onClick={handleBackToSettings} className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors font-semibold">Back</button>
          <div className="flex gap-3">
            <button type="button" onClick={handleSaveCircuit} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold">Add Moveframe</button>
            <button type="button" className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"><RefreshCw className="w-4 h-4" />Reload exercises</button>
            <button type="button" className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"><Settings className="w-4 h-4" />Preferences</button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {/* Planner Mode Selection */}
      <div className="flex gap-2">
        <button type="button" onClick={() => setPlannerMode('circuits')} className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg border-2 transition-colors ${plannerMode === 'circuits' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'}`}>Circuits planner</button>
        <button type="button" onClick={() => setPlannerMode('fast')} className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg border-2 transition-colors ${plannerMode === 'fast' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'}`}>Fast planner of Moveframes</button>
        <button type="button" onClick={() => setPlannerMode('ai')} className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg border-2 transition-colors ${plannerMode === 'ai' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'}`}>Plan of Moveframes with AI</button>
      </div>
      
      {plannerMode === 'circuits' && (
        <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3 flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-yellow-800">⚠️ Here you can create sequences of exercises to be performed in circuits to be repeated</p>
        </div>
      )}
      
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Descriptions & instructions</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-green-50" rows={2} placeholder="Add circuit description and instructions..." />
      </div>
      
      {plannerMode === 'circuits' && (
        <div className="space-y-4">
          {/* Row 1: Circuits */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              {exercises.map((exercise) => (
                <div key={exercise.letter} className="flex items-center gap-2">
                  <div className="w-16 h-8 rounded flex items-center justify-center font-bold text-gray-900 border border-gray-400" style={{ backgroundColor: exercise.color }}>{exercise.letter}</div>
                  <input type="text" value={exercise.name} onChange={(e) => handleExerciseNameChange(exercises.findIndex(ex => ex.letter === exercise.letter), e.target.value)} className="flex-1 px-2 py-1 bg-yellow-100 border border-yellow-400 rounded focus:ring-2 focus:ring-blue-500 text-sm" placeholder="Exercise name..." />
                </div>
              ))}
            </div>
            
            <div className="flex items-start gap-2">
              <div className="flex-1 space-y-2">
                {exercises.map((exercise, idx) => (
                  <div key={exercise.letter} className="flex items-center gap-2">
                    <div className="w-16 h-8 rounded flex items-center justify-center font-bold text-gray-700 bg-gray-200 border border-gray-400">{exercise.letter}</div>
                    <div className="flex-1 h-8"></div>
                    {idx === 0 && (
                      <div className="absolute right-0 flex items-center gap-2 bg-yellow-400 rounded-full px-2 py-1">
                        <span className="text-xs font-medium">!</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700 whitespace-nowrap">No. Circuits</label>
                  <input type="number" value={numCircuits} onChange={(e) => setNumCircuits(parseInt(e.target.value) || 0)} min="1" className="w-16 px-2 py-1 border border-gray-300 rounded text-center focus:ring-2 focus:ring-blue-500 text-sm" />
                  <button type="button" className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600 text-lg">×</button>
                </div>
                <div className="flex items-center gap-2 mt-auto">
                  <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Pause\circuits</label>
                  <input type="text" value={pauseCircuits} onChange={(e) => setPauseCircuits(e.target.value)} className="w-16 px-2 py-1 border border-gray-300 rounded text-center focus:ring-2 focus:ring-blue-500 text-sm" placeholder="4'" />
                  <button type="button" className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600 text-lg">×</button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Row 2: Stations */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-gray-50 border border-gray-300 rounded">
              <div className="flex items-center gap-1 mb-3">
                <div className="w-10 h-10 rounded flex items-center justify-center font-bold bg-red-100 border border-red-300 text-sm">A</div>
                {[...Array(Math.min(stationsPerCircuit, 6))].map((_, i) => (
                  <div key={i} className="flex-1 h-4 bg-yellow-200 border border-yellow-400 rounded" />
                ))}
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Station\circuit</label>
                <div className="flex items-center gap-2">
                  <input type="number" value={stationsPerCircuit} onChange={(e) => setStationsPerCircuit(parseInt(e.target.value) || 0)} min="1" className="w-16 px-2 py-1 border border-gray-300 rounded text-center focus:ring-2 focus:ring-blue-500 text-sm" />
                  <button type="button" className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600 text-lg">×</button>
                </div>
              </div>
            </div>
            
            <div className="p-3 bg-gray-50 border border-gray-300 rounded">
              <div className="flex items-center gap-1 mb-3">
                <div className="w-10 h-10 rounded flex items-center justify-center font-bold bg-gray-200 border border-gray-400 text-sm">A</div>
                {[...Array(Math.min(stationsPerCircuit, 6))].map((_, i) => (
                  <div key={i} className="relative flex-1 h-4 bg-gray-300 border border-gray-400 rounded">
                    {i < 4 && <div className="absolute -right-1 top-0 bottom-0 flex items-center"><div className="w-2 h-2 rounded-full bg-yellow-400 border border-yellow-600"></div></div>}
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-end gap-2">
                <label className="text-sm font-medium text-gray-700">Pause\stations</label>
                <input type="text" value={pauseStations} onChange={(e) => setPauseStations(e.target.value)} className="w-16 px-2 py-1 border border-gray-300 rounded text-center focus:ring-2 focus:ring-blue-500 text-sm" placeholder='10"' />
                <button type="button" className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600 text-lg">×</button>
              </div>
            </div>
          </div>
          
          {/* Row 3: Series */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-gray-50 border border-gray-300 rounded">
              <div className="flex items-start gap-2 mb-3">
                <div className="w-8 h-8 rounded flex items-center justify-center font-bold bg-red-100 border border-red-300 text-xs">A</div>
                <div className="flex flex-col gap-1">
                  {[...Array(Math.min(seriesPerCircuit, 6))].map((_, i) => (
                    <div key={i} className="w-20 h-3 bg-gray-300 border border-gray-400 rounded" />
                  ))}
                </div>
                <div className="flex flex-col gap-1">
                  <div className="w-5 h-5 rounded-full bg-red-500 border border-red-700 flex items-center justify-center text-white text-xs">↓</div>
                  <div className="w-5 h-5 rounded-full bg-yellow-400 border border-yellow-600 flex items-center justify-center text-xs">!</div>
                  <div className="w-5 h-5 rounded-full bg-yellow-400 border border-yellow-600 flex items-center justify-center text-xs">!</div>
                  <div className="w-5 h-5 rounded-full bg-green-500 border border-green-700 flex items-center justify-center text-white text-xs">🔔</div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" checked={seriesMode === 'series'} onChange={() => setSeriesMode('series')} className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-gray-700">Set series\circuit</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" checked={seriesMode === 'time'} onChange={() => setSeriesMode('time')} className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-gray-700">Set time\circuit</span>
                  </label>
                </div>
                {seriesMode === 'series' ? (
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">Series\circuit</label>
                    <div className="flex items-center gap-2">
                      <input type="number" value={seriesPerCircuit} onChange={(e) => setSeriesPerCircuit(parseInt(e.target.value) || 0)} min="1" className="w-16 px-2 py-1 border border-gray-300 rounded text-center focus:ring-2 focus:ring-blue-500 text-sm" />
                      <button type="button" className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600 text-lg">×</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-center">
                    <input type="text" value={timePerCircuit} onChange={(e) => setTimePerCircuit(e.target.value)} className="w-24 px-2 py-2 border-2 border-blue-500 rounded text-center focus:ring-2 focus:ring-blue-500 font-mono text-lg" placeholder="5'00&quot;" />
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-3 bg-gray-50 border border-gray-300 rounded flex flex-col justify-end">
              <div className="flex items-center justify-end gap-2">
                <label className="text-sm font-medium text-gray-700">Pause among series</label>
                <input type="text" value={pauseSeries} onChange={(e) => setPauseSeries(e.target.value)} disabled={seriesMode === 'time'} className="w-16 px-2 py-1 border border-gray-300 rounded text-center focus:ring-2 focus:ring-blue-500 disabled:bg-gray-200 disabled:text-gray-400 text-sm" placeholder="2'" />
                <button type="button" className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600 text-lg">×</button>
              </div>
              {seriesMode === 'time' && <p className="text-xs text-gray-500 italic mt-1">Disabled when selected Time\circuit</p>}
            </div>
          </div>
          
          {/* Row 4: Execution */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-gray-50 border border-gray-300 rounded">
              <div className="flex items-start gap-2 mb-3">
                <div className="w-8 h-8 rounded flex items-center justify-center font-bold bg-red-100 border border-red-300 text-xs">A</div>
                <div className="flex flex-col gap-1">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex items-center gap-1">
                      <div className="w-20 h-3 bg-gray-300 border border-gray-400 rounded" />
                      <span className="text-xs text-orange-600">➤</span>
                    </div>
                  ))}
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="w-4 h-4 rounded-full bg-red-500 border border-red-700" />
                  <div className="w-0.5 h-16 bg-red-400" />
                  <div className="w-4 h-4 rounded-full bg-green-500 border border-green-700" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" checked={executionOrder === 'vertical'} onChange={() => setExecutionOrder('vertical')} className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">Execution vertically</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" checked={executionOrder === 'horizontal'} onChange={() => setExecutionOrder('horizontal')} className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">Execution orizzontally</span>
                </label>
                {executionOrder === 'horizontal' && <p className="text-xs text-gray-500 italic">(all series for station 1)</p>}
              </div>
            </div>
            
            <div className="p-3 bg-gray-50 border border-gray-300 rounded">
              <div className="mb-3">
                {['A', 'B', 'C'].slice(0, 3).map((letter) => (
                  <div key={letter} className="flex items-center gap-1 mb-1">
                    <div className="w-6 h-6 rounded flex items-center justify-center font-bold bg-red-100 border border-red-300 text-xs">{letter}</div>
                    {[...Array(3)].map((_, j) => (
                      <React.Fragment key={j}>
                        <div className="w-12 h-3 bg-gray-300 border border-gray-400 rounded relative">
                          <span className="absolute right-1 text-xs text-orange-600">➤</span>
                        </div>
                      </React.Fragment>
                    ))}
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-end gap-2">
                <label className="text-sm font-medium text-gray-700">Pause\stations</label>
                <input type="text" value={executionPauseStations} onChange={(e) => setExecutionPauseStations(e.target.value)} className="w-16 px-2 py-1 border border-gray-300 rounded text-center focus:ring-2 focus:ring-blue-500 text-sm" />
                <button type="button" className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600 text-lg">×</button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {plannerMode === 'fast' && (
        <div className="bg-blue-50 border border-blue-300 rounded-lg p-4">
          <p className="text-sm text-blue-800">Fast planner of Moveframes - Coming soon</p>
        </div>
      )}
      
      {plannerMode === 'ai' && (
        <div className="bg-purple-50 border border-purple-300 rounded-lg p-4">
          <p className="text-sm text-purple-800">Plan of Moveframes with AI - Coming soon</p>
        </div>
      )}
      
      <div className="flex items-center justify-between pt-4 border-t">
        <button type="button" onClick={onCancel} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
        <div className="flex gap-3">
          <button type="button" className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"><Settings className="w-4 h-4" />Preferences</button>
          <button type="button" onClick={generateCircuitTemplate} disabled={!sectionId || plannerMode !== 'circuits'} className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold">Create circuit</button>
        </div>
      </div>
    </div>
  );
}

