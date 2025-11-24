'use client';

import { useState, useEffect } from 'react';
import { Trophy, TrendingUp, Calendar, Award, Plus, Edit2, Trash2, ChevronRight, Target, Zap, Medal, Star } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface PersonalRecord {
  id: string;
  exerciseName: string;
  recordType: 'Weight' | 'Reps' | 'Time' | 'Distance';
  value: number;
  unit: string;
  dateAchieved: string;
  notes: string;
  previousRecord?: number;
  improvement?: number;
  sport: string;
}

interface PerformanceMilestone {
  id: string;
  title: string;
  sport: string;
  category: string;
  value: number;
  unit: string;
  dateAchieved: string;
  description: string;
  difficulty: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  isVerified: boolean;
}

export default function MyBestSettings() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'records' | 'milestones'>('records');
  
  // Personal Records State
  const [personalRecords, setPersonalRecords] = useState<PersonalRecord[]>([]);
  const [showRecordDialog, setShowRecordDialog] = useState(false);
  const [editingRecord, setEditingRecord] = useState<PersonalRecord | null>(null);
  
  // Milestones State
  const [milestones, setMilestones] = useState<PerformanceMilestone[]>([]);
  const [showMilestoneDialog, setShowMilestoneDialog] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<PerformanceMilestone | null>(null);
  
  // Filter State
  const [sportFilter, setSportFilter] = useState('all');
  const [recordTypeFilter, setRecordTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'date' | 'value' | 'name'>('date');

  // Load data from localStorage
  useEffect(() => {
    // Load Personal Records
    const savedRecords = localStorage.getItem('personalRecords');
    if (savedRecords) {
      try {
        setPersonalRecords(JSON.parse(savedRecords));
      } catch (e) {
        console.error('Failed to load personal records');
      }
    } else {
      // Default records
      setPersonalRecords([
        {
          id: '1',
          exerciseName: 'Bench Press',
          recordType: 'Weight',
          value: 100,
          unit: 'kg',
          dateAchieved: '2025-11-20',
          notes: 'Personal best! Felt strong today.',
          previousRecord: 95,
          improvement: 5,
          sport: 'Weightlifting'
        },
        {
          id: '2',
          exerciseName: '5K Run',
          recordType: 'Time',
          value: 22.5,
          unit: 'minutes',
          dateAchieved: '2025-11-15',
          notes: 'Perfect weather conditions',
          previousRecord: 24,
          improvement: -1.5,
          sport: 'Running'
        },
        {
          id: '3',
          exerciseName: 'Pull-ups',
          recordType: 'Reps',
          value: 25,
          unit: 'reps',
          dateAchieved: '2025-11-10',
          notes: 'Consecutive pull-ups without rest',
          previousRecord: 20,
          improvement: 5,
          sport: 'Calisthenics'
        }
      ]);
    }

    // Load Milestones
    const savedMilestones = localStorage.getItem('performanceMilestones');
    if (savedMilestones) {
      try {
        setMilestones(JSON.parse(savedMilestones));
      } catch (e) {
        console.error('Failed to load milestones');
      }
    } else {
      // Default milestones
      setMilestones([
        {
          id: '1',
          title: '100kg Bench Press Club',
          sport: 'Weightlifting',
          category: 'Strength',
          value: 100,
          unit: 'kg',
          dateAchieved: '2025-11-20',
          description: 'Achieved 100kg bench press for the first time',
          difficulty: 'Gold',
          isVerified: true
        },
        {
          id: '2',
          title: 'Sub-20 Minute 5K',
          sport: 'Running',
          category: 'Endurance',
          value: 19.5,
          unit: 'minutes',
          dateAchieved: '2025-10-15',
          description: 'Broke the 20-minute barrier in 5K run',
          difficulty: 'Platinum',
          isVerified: true
        },
        {
          id: '3',
          title: 'First Marathon Completed',
          sport: 'Running',
          category: 'Achievement',
          value: 42.195,
          unit: 'km',
          dateAchieved: '2025-09-01',
          description: 'Completed first full marathon',
          difficulty: 'Gold',
          isVerified: true
        }
      ]);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (personalRecords.length > 0) {
      localStorage.setItem('personalRecords', JSON.stringify(personalRecords));
    }
  }, [personalRecords]);

  useEffect(() => {
    if (milestones.length > 0) {
      localStorage.setItem('performanceMilestones', JSON.stringify(milestones));
    }
  }, [milestones]);

  // Helper functions
  const getAllSports = () => {
    if (activeTab === 'records') {
      return Array.from(new Set(personalRecords.map(r => r.sport)));
    } else {
      return Array.from(new Set(milestones.map(m => m.sport)));
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getImprovementColor = (improvement: number) => {
    if (improvement > 0) return 'text-green-600';
    if (improvement < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Bronze': return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'Silver': return 'bg-gray-200 text-gray-700 border-gray-400';
      case 'Gold': return 'bg-yellow-100 text-yellow-700 border-yellow-400';
      case 'Platinum': return 'bg-purple-100 text-purple-700 border-purple-400';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'Bronze': return '🥉';
      case 'Silver': return '🥈';
      case 'Gold': return '🥇';
      case 'Platinum': return '💎';
      default: return '🏆';
    }
  };

  // Statistics calculations
  const getTotalRecords = () => personalRecords.length;
  const getAverageImprovement = () => {
    const improvements = personalRecords.filter(r => r.improvement).map(r => r.improvement!);
    if (improvements.length === 0) return 0;
    return (improvements.reduce((a, b) => a + b, 0) / improvements.length).toFixed(1);
  };
  const getRecentRecords = () => personalRecords.filter(r => {
    const date = new Date(r.dateAchieved);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return date >= thirtyDaysAgo;
  }).length;

  const getTotalMilestones = () => milestones.length;
  const getPlatinumCount = () => milestones.filter(m => m.difficulty === 'Platinum').length;
  const getGoldCount = () => milestones.filter(m => m.difficulty === 'Gold').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">My Best</h2>
        <p className="text-gray-600">Track your personal records and celebrate your achievements</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <Trophy className="w-8 h-8 mb-3 opacity-80" />
          <div className="text-3xl font-bold mb-1">{getTotalRecords()}</div>
          <div className="text-sm opacity-90">Personal Records</div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <TrendingUp className="w-8 h-8 mb-3 opacity-80" />
          <div className="text-3xl font-bold mb-1">{getAverageImprovement()}%</div>
          <div className="text-sm opacity-90">Avg Improvement</div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <Zap className="w-8 h-8 mb-3 opacity-80" />
          <div className="text-3xl font-bold mb-1">{getRecentRecords()}</div>
          <div className="text-sm opacity-90">Recent (30 days)</div>
        </div>
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-6 text-white">
          <Award className="w-8 h-8 mb-3 opacity-80" />
          <div className="text-3xl font-bold mb-1">{getTotalMilestones()}</div>
          <div className="text-sm opacity-90">Milestones Achieved</div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('records')}
          className={`px-6 py-3 font-semibold transition ${
            activeTab === 'records'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Target className="w-4 h-4 inline mr-2" />
          Personal Records ({personalRecords.length})
        </button>
        <button
          onClick={() => setActiveTab('milestones')}
          className={`px-6 py-3 font-semibold transition ${
            activeTab === 'milestones'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Medal className="w-4 h-4 inline mr-2" />
          Milestones ({milestones.length})
        </button>
      </div>

      {/* Action Bar */}
      <div className="flex justify-between items-center">
        <div className="flex gap-3">
          <button
            onClick={() => {
              if (activeTab === 'records') {
                setEditingRecord({
                  id: '',
                  exerciseName: '',
                  recordType: 'Weight',
                  value: 0,
                  unit: '',
                  dateAchieved: new Date().toISOString().split('T')[0],
                  notes: '',
                  sport: ''
                });
                setShowRecordDialog(true);
              } else {
                setEditingMilestone({
                  id: '',
                  title: '',
                  sport: '',
                  category: '',
                  value: 0,
                  unit: '',
                  dateAchieved: new Date().toISOString().split('T')[0],
                  description: '',
                  difficulty: 'Bronze',
                  isVerified: false
                });
                setShowMilestoneDialog(true);
              }
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Plus className="w-4 h-4" />
            Add {activeTab === 'records' ? 'Record' : 'Milestone'}
          </button>
        </div>
        <div className="flex gap-3 items-center">
          <select
            value={sportFilter}
            onChange={(e) => setSportFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Sports</option>
            {getAllSports().map(sport => (
              <option key={sport} value={sport}>{sport}</option>
            ))}
          </select>
          {activeTab === 'records' && (
            <select
              value={recordTypeFilter}
              onChange={(e) => setRecordTypeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="Weight">Weight</option>
              <option value="Reps">Reps</option>
              <option value="Time">Time</option>
              <option value="Distance">Distance</option>
            </select>
          )}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="date">Recent First</option>
            <option value="value">Best First</option>
            <option value="name">Name</option>
          </select>
        </div>
      </div>

      {/* Personal Records Tab */}
      {activeTab === 'records' && (
        <div className="grid grid-cols-1 gap-4">
          {personalRecords
            .filter(record => 
              (sportFilter === 'all' || record.sport === sportFilter) &&
              (recordTypeFilter === 'all' || record.recordType === recordTypeFilter)
            )
            .sort((a, b) => {
              if (sortBy === 'date') return new Date(b.dateAchieved).getTime() - new Date(a.dateAchieved).getTime();
              if (sortBy === 'value') return b.value - a.value;
              if (sortBy === 'name') return a.exerciseName.localeCompare(b.exerciseName);
              return 0;
            })
            .map((record) => (
              <div
                key={record.id}
                className="bg-white rounded-xl border-2 border-gray-200 p-6 hover:border-blue-300 hover:shadow-lg transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <Trophy className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-xl text-gray-900">{record.exerciseName}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span className="px-2 py-0.5 bg-gray-100 rounded">{record.sport}</span>
                          <span>•</span>
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(record.dateAchieved)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
                        <div className="text-xs text-blue-600 font-semibold mb-1">{record.recordType}</div>
                        <div className="text-2xl font-bold text-blue-900">
                          {record.value} <span className="text-sm font-normal">{record.unit}</span>
                        </div>
                      </div>
                      
                      {record.previousRecord && (
                        <>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="text-xs text-gray-600 font-semibold mb-1">Previous</div>
                            <div className="text-2xl font-bold text-gray-700">
                              {record.previousRecord} <span className="text-sm font-normal">{record.unit}</span>
                            </div>
                          </div>
                          
                          <div className={`bg-green-50 rounded-lg p-4 ${record.improvement && record.improvement < 0 ? 'bg-red-50' : ''}`}>
                            <div className="text-xs text-gray-600 font-semibold mb-1">Improvement</div>
                            <div className={`text-2xl font-bold ${getImprovementColor(record.improvement || 0)}`}>
                              {record.improvement && record.improvement > 0 ? '+' : ''}
                              {record.improvement} {record.unit}
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {record.notes && (
                      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
                        <p className="text-sm text-gray-700 italic">&ldquo;{record.notes}&rdquo;</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => {
                        setEditingRecord(record);
                        setShowRecordDialog(true);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Delete this personal record?')) {
                          setPersonalRecords(personalRecords.filter(r => r.id !== record.id));
                        }
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Milestones Tab */}
      {activeTab === 'milestones' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {milestones
            .filter(milestone => sportFilter === 'all' || milestone.sport === sportFilter)
            .sort((a, b) => {
              if (sortBy === 'date') return new Date(b.dateAchieved).getTime() - new Date(a.dateAchieved).getTime();
              if (sortBy === 'value') return b.value - a.value;
              if (sortBy === 'name') return a.title.localeCompare(b.title);
              return 0;
            })
            .map((milestone) => (
              <div
                key={milestone.id}
                className={`bg-white rounded-xl border-3 p-6 hover:shadow-xl transition ${getDifficultyColor(milestone.difficulty)} border-2`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-4xl">{getDifficultyIcon(milestone.difficulty)}</div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">{milestone.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span className="px-2 py-0.5 bg-gray-100 rounded">{milestone.sport}</span>
                        <span>•</span>
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded">{milestone.category}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingMilestone(milestone);
                        setShowMilestoneDialog(true);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Delete this milestone?')) {
                          setMilestones(milestones.filter(m => m.id !== milestone.id));
                        }
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-gray-700 mb-4 text-sm">{milestone.description}</p>

                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Achievement Value</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {milestone.value} <span className="text-sm font-normal text-gray-600">{milestone.unit}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500 mb-1">Date Achieved</div>
                    <div className="font-semibold text-gray-900">{formatDate(milestone.dateAchieved)}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(milestone.difficulty)}`}>
                      {milestone.difficulty}
                    </span>
                    {milestone.isVerified && (
                      <span className="flex items-center gap-1 text-green-600 text-xs font-semibold">
                        <Award className="w-3 h-3" />
                        Verified
                      </span>
                    )}
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-semibold flex items-center gap-1">
                    View Details
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Empty State */}
      {((activeTab === 'records' && personalRecords.filter(r => 
          (sportFilter === 'all' || r.sport === sportFilter) &&
          (recordTypeFilter === 'all' || r.recordType === recordTypeFilter)
        ).length === 0) ||
        (activeTab === 'milestones' && milestones.filter(m => 
          sportFilter === 'all' || m.sport === sportFilter
        ).length === 0)) && (
        <div className="text-center py-16 bg-gray-50 rounded-xl">
          <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 text-lg mb-2">No {activeTab === 'records' ? 'records' : 'milestones'} found</p>
          <p className="text-gray-500 text-sm">
            {sportFilter !== 'all' || recordTypeFilter !== 'all' 
              ? 'Try adjusting your filters' 
              : `Start tracking your ${activeTab === 'records' ? 'personal records' : 'achievements'}!`}
          </p>
        </div>
      )}

      {/* Personal Record Dialog */}
      {showRecordDialog && editingRecord && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold mb-6">
              {editingRecord.id ? 'Edit Personal Record' : 'Add Personal Record'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Exercise Name</label>
                <input
                  type="text"
                  value={editingRecord.exerciseName}
                  onChange={(e) => setEditingRecord({ ...editingRecord, exerciseName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Bench Press"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Sport</label>
                  <input
                    type="text"
                    value={editingRecord.sport}
                    onChange={(e) => setEditingRecord({ ...editingRecord, sport: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Weightlifting"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Record Type</label>
                  <select
                    value={editingRecord.recordType}
                    onChange={(e) => setEditingRecord({ ...editingRecord, recordType: e.target.value as any })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Weight">Weight</option>
                    <option value="Reps">Reps</option>
                    <option value="Time">Time</option>
                    <option value="Distance">Distance</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Value</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editingRecord.value}
                    onChange={(e) => setEditingRecord({ ...editingRecord, value: parseFloat(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Unit</label>
                  <input
                    type="text"
                    value={editingRecord.unit}
                    onChange={(e) => setEditingRecord({ ...editingRecord, unit: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., kg, reps, minutes"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Date Achieved</label>
                <input
                  type="date"
                  value={editingRecord.dateAchieved}
                  onChange={(e) => setEditingRecord({ ...editingRecord, dateAchieved: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Previous Record (optional)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editingRecord.previousRecord || ''}
                    onChange={(e) => setEditingRecord({ ...editingRecord, previousRecord: e.target.value ? parseFloat(e.target.value) : undefined })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Previous best"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Improvement (optional)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editingRecord.improvement || ''}
                    onChange={(e) => setEditingRecord({ ...editingRecord, improvement: e.target.value ? parseFloat(e.target.value) : undefined })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Difference"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Notes</label>
                <textarea
                  value={editingRecord.notes}
                  onChange={(e) => setEditingRecord({ ...editingRecord, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="How did it feel? Conditions? Any notes..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => {
                  if (!editingRecord.exerciseName || !editingRecord.sport || !editingRecord.value) {
                    alert('Please fill in all required fields');
                    return;
                  }
                  if (editingRecord.id) {
                    setPersonalRecords(personalRecords.map(r => r.id === editingRecord.id ? editingRecord : r));
                  } else {
                    setPersonalRecords([...personalRecords, { ...editingRecord, id: Date.now().toString() }]);
                  }
                  setShowRecordDialog(false);
                  setEditingRecord(null);
                }}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
              >
                {editingRecord.id ? 'Save Changes' : 'Add Record'}
              </button>
              <button
                onClick={() => {
                  setShowRecordDialog(false);
                  setEditingRecord(null);
                }}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Milestone Dialog */}
      {showMilestoneDialog && editingMilestone && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold mb-6">
              {editingMilestone.id ? 'Edit Milestone' : 'Add Milestone'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Milestone Title</label>
                <input
                  type="text"
                  value={editingMilestone.title}
                  onChange={(e) => setEditingMilestone({ ...editingMilestone, title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 100kg Bench Press Club"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  value={editingMilestone.description}
                  onChange={(e) => setEditingMilestone({ ...editingMilestone, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe this achievement..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Sport</label>
                  <input
                    type="text"
                    value={editingMilestone.sport}
                    onChange={(e) => setEditingMilestone({ ...editingMilestone, sport: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Weightlifting"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                  <input
                    type="text"
                    value={editingMilestone.category}
                    onChange={(e) => setEditingMilestone({ ...editingMilestone, category: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Strength, Endurance"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Value</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editingMilestone.value}
                    onChange={(e) => setEditingMilestone({ ...editingMilestone, value: parseFloat(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Unit</label>
                  <input
                    type="text"
                    value={editingMilestone.unit}
                    onChange={(e) => setEditingMilestone({ ...editingMilestone, unit: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., kg, minutes, km"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Date Achieved</label>
                  <input
                    type="date"
                    value={editingMilestone.dateAchieved}
                    onChange={(e) => setEditingMilestone({ ...editingMilestone, dateAchieved: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Difficulty</label>
                  <select
                    value={editingMilestone.difficulty}
                    onChange={(e) => setEditingMilestone({ ...editingMilestone, difficulty: e.target.value as any })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Bronze">🥉 Bronze</option>
                    <option value="Silver">🥈 Silver</option>
                    <option value="Gold">🥇 Gold</option>
                    <option value="Platinum">💎 Platinum</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="verified"
                  checked={editingMilestone.isVerified}
                  onChange={(e) => setEditingMilestone({ ...editingMilestone, isVerified: e.target.checked })}
                  className="w-5 h-5 text-blue-600"
                />
                <label htmlFor="verified" className="text-sm font-semibold text-gray-700">
                  Verified Achievement
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => {
                  if (!editingMilestone.title || !editingMilestone.sport) {
                    alert('Please fill in all required fields');
                    return;
                  }
                  if (editingMilestone.id) {
                    setMilestones(milestones.map(m => m.id === editingMilestone.id ? editingMilestone : m));
                  } else {
                    setMilestones([...milestones, { ...editingMilestone, id: Date.now().toString() }]);
                  }
                  setShowMilestoneDialog(false);
                  setEditingMilestone(null);
                }}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
              >
                {editingMilestone.id ? 'Save Changes' : 'Add Milestone'}
              </button>
              <button
                onClick={() => {
                  setShowMilestoneDialog(false);
                  setEditingMilestone(null);
                }}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
