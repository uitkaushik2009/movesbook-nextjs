'use client';

import { useState } from 'react';
import { Trophy, Award, TrendingUp, Calendar, Target, Star } from 'lucide-react';

interface Record {
  id: string;
  type: 'moveframe' | 'personal_record' | 'achievement';
  title: string;
  value: string;
  date: string;
  sport: string;
  improvement?: string;
}

const sampleRecords: Record[] = [
  {
    id: '1',
    type: 'personal_record',
    title: 'Fastest 5K Run',
    value: '21:45',
    date: '2024-12-10',
    sport: 'Running',
    improvement: '-1:20 from previous'
  },
  {
    id: '2',
    type: 'moveframe',
    title: 'Best Swim Interval',
    value: '400m x 10',
    date: '2024-12-08',
    sport: 'Swimming',
    improvement: '+2 reps from previous'
  },
  {
    id: '3',
    type: 'achievement',
    title: 'Monthly Consistency',
    value: '25/30 days',
    date: '2024-12-01',
    sport: 'Overall'
  },
  {
    id: '4',
    type: 'personal_record',
    title: 'Max Deadlift',
    value: '180kg',
    date: '2024-11-28',
    sport: 'Weight Training',
    improvement: '+5kg from previous'
  }
];

export default function MyBestSettings() {
  const [records, setRecords] = useState<Record[]>(sampleRecords);
  const [activeTab, setActiveTab] = useState<'all' | 'moveframe' | 'personal_record' | 'achievement'>('all');

  const getIcon = (type: string) => {
    switch (type) {
      case 'personal_record': return <Trophy className="w-5 h-5" />;
      case 'moveframe': return <Award className="w-5 h-5" />;
      case 'achievement': return <Star className="w-5 h-5" />;
      default: return <Target className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'personal_record': return 'bg-yellow-100 text-yellow-700';
      case 'moveframe': return 'bg-purple-100 text-purple-700';
      case 'achievement': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getTypeGradient = (type: string) => {
    switch (type) {
      case 'personal_record': return 'from-yellow-500 to-orange-500';
      case 'moveframe': return 'from-purple-500 to-pink-500';
      case 'achievement': return 'from-blue-500 to-cyan-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const filteredRecords = records.filter(record => 
    activeTab === 'all' || record.type === activeTab
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">My Best</h2>
        <div className="flex space-x-4">
          {[
            { id: 'all' as const, label: 'All Records' },
            { id: 'personal_record' as const, label: 'Personal Records' },
            { id: 'moveframe' as const, label: 'Best Moveframes' },
            { id: 'achievement' as const, label: 'Achievements' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-2xl font-semibold transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm">Personal Records</p>
              <p className="text-2xl font-bold">{records.filter(r => r.type === 'personal_record').length}</p>
            </div>
            <Trophy className="w-8 h-8 text-yellow-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Best Moveframes</p>
              <p className="text-2xl font-bold">{records.filter(r => r.type === 'moveframe').length}</p>
            </div>
            <Award className="w-8 h-8 text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Achievements</p>
              <p className="text-2xl font-bold">{records.filter(r => r.type === 'achievement').length}</p>
            </div>
            <Star className="w-8 h-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-emerald-500 text-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Total Records</p>
              <p className="text-2xl font-bold">{records.length}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-200" />
          </div>
        </div>
      </div>

      {/* Records List */}
      <div className="space-y-6">
        {filteredRecords.map((record) => (
          <div
            key={record.id}
            className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 group"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-xl ${getTypeColor(record.type)}`}>
                  {getIcon(record.type)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{record.title}</h3>
                  <p className="text-gray-600">{record.sport}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className="text-2xl font-bold text-gray-900">{record.value}</span>
                    {record.improvement && (
                      <span className="flex items-center space-x-1 text-green-600 font-semibold">
                        <TrendingUp className="w-4 h-4" />
                        <span>{record.improvement}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">
                  {new Date(record.date).toLocaleDateString()}
                </div>
                <button className="mt-2 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-4 py-2 rounded-xl font-semibold hover:from-cyan-600 hover:to-purple-600 transition-all duration-300">
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredRecords.length === 0 && (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-gradient-to-r from-cyan-100 to-purple-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Trophy className="w-10 h-10 text-cyan-500" />
          </div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-2">No records yet</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Your personal records and achievements will appear here as you track your workouts and progress.
          </p>
          <button className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-2xl font-semibold hover:from-cyan-600 hover:to-purple-600 transition-all duration-300">
            <Target className="w-5 h-5" />
            <span>Set New Goals</span>
          </button>
        </div>
      )}

      {/* Progress Tracking */}
      <div className="bg-gradient-to-r from-cyan-50 to-purple-50 rounded-2xl p-6 border border-cyan-200">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Progress Tracking</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-cyan-600" />
              Monthly Progress
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">New Records</span>
                <span className="font-semibold text-green-600">+3</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Workouts Completed</span>
                <span className="font-semibold text-cyan-600">18/20</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Consistency Rate</span>
                <span className="font-semibold text-purple-600">85%</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-purple-600" />
              Recent Improvements
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Running Pace</span>
                <span className="font-semibold text-green-600">+5%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Swim Distance</span>
                <span className="font-semibold text-green-600">+12%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Strength</span>
                <span className="font-semibold text-green-600">+8%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}