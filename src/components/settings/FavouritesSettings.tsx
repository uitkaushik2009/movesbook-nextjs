'use client';

import { useState } from 'react';
import { Star, StarOff, Calendar, Dumbbell, Users, Trash2, Plus } from 'lucide-react';

interface FavoriteItem {
  id: string;
  type: 'weekly_plan' | 'workout' | 'moveframe';
  name: string;
  description: string;
  lastUsed: string;
  isFavorite: boolean;
}

const sampleFavorites: FavoriteItem[] = [
  {
    id: '1',
    type: 'weekly_plan',
    name: 'Swim Training Week',
    description: 'Intensive swimming focus week',
    lastUsed: '2024-12-10',
    isFavorite: true
  },
  {
    id: '2',
    type: 'workout',
    name: 'Morning Run Session',
    description: '5K endurance run with intervals',
    lastUsed: '2024-12-11',
    isFavorite: true
  },
  {
    id: '3',
    type: 'moveframe',
    name: 'Swim 400m Intervals',
    description: 'Freestyle intervals with 30s rest',
    lastUsed: '2024-12-09',
    isFavorite: true
  },
  {
    id: '4',
    type: 'weekly_plan',
    name: 'Cross Training Week',
    description: 'Mixed discipline training',
    lastUsed: '2024-12-05',
    isFavorite: false
  }
];

export default function FavouritesSettings() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>(sampleFavorites);
  const [activeTab, setActiveTab] = useState<'all' | 'weekly_plan' | 'workout' | 'moveframe'>('all');

  const toggleFavorite = (id: string) => {
    setFavorites(prev => prev.map(item => 
      item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
    ));
  };

  const removeFavorite = (id: string) => {
    setFavorites(prev => prev.filter(item => item.id !== id));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'weekly_plan': return <Calendar className="w-5 h-5" />;
      case 'workout': return <Dumbbell className="w-5 h-5" />;
      case 'moveframe': return <Users className="w-5 h-5" />;
      default: return <Star className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'weekly_plan': return 'bg-blue-100 text-blue-700';
      case 'workout': return 'bg-green-100 text-green-700';
      case 'moveframe': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredFavorites = favorites.filter(item => 
    activeTab === 'all' || item.type === activeTab
  );

  const favoriteCounts = {
    all: favorites.filter(f => f.isFavorite).length,
    weekly_plan: favorites.filter(f => f.type === 'weekly_plan' && f.isFavorite).length,
    workout: favorites.filter(f => f.type === 'workout' && f.isFavorite).length,
    moveframe: favorites.filter(f => f.type === 'moveframe' && f.isFavorite).length,
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">Favourites</h2>
        <div className="flex space-x-4">
          {[
            { id: 'all' as const, label: 'All', count: favoriteCounts.all },
            { id: 'weekly_plan' as const, label: 'Weekly Plans', count: favoriteCounts.weekly_plan },
            { id: 'workout' as const, label: 'Workouts', count: favoriteCounts.workout },
            { id: 'moveframe' as const, label: 'Moveframes', count: favoriteCounts.moveframe },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-2xl font-semibold transition-all duration-300 flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span>{tab.label}</span>
              <span className="bg-white bg-opacity-20 px-2 py-1 rounded-full text-sm">
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Favorites Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFavorites.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl border-2 border-gray-200 p-6 hover:shadow-lg transition-all duration-300 group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl ${getTypeColor(item.type)}`}>
                {getIcon(item.type)}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => toggleFavorite(item.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    item.isFavorite
                      ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                      : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                  }`}
                >
                  {item.isFavorite ? (
                    <Star className="w-4 h-4 fill-current" />
                  ) : (
                    <StarOff className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={() => removeFavorite(item.id)}
                  className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.name}</h3>
            <p className="text-gray-600 text-sm mb-4">{item.description}</p>
            
            <div className="flex justify-between items-center text-xs text-gray-500">
              <span>Last used: {new Date(item.lastUsed).toLocaleDateString()}</span>
              <span className="capitalize">{item.type.replace('_', ' ')}</span>
            </div>

            <button className="w-full mt-4 bg-gradient-to-r from-cyan-500 to-purple-500 text-white py-2 rounded-xl font-semibold hover:from-cyan-600 hover:to-purple-600 transition-all duration-300 opacity-0 group-hover:opacity-100">
              Use This
            </button>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredFavorites.length === 0 && (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-gradient-to-r from-cyan-100 to-purple-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Star className="w-10 h-10 text-cyan-500" />
          </div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-2">No favorites yet</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Start marking your favorite weekly plans, workouts, and moveframes to access them quickly here.
          </p>
          <button className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-2xl font-semibold hover:from-cyan-600 hover:to-purple-600 transition-all duration-300">
            <Plus className="w-5 h-5" />
            <span>Browse Templates</span>
          </button>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-cyan-50 to-purple-50 rounded-2xl p-6 border border-cyan-200">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 bg-white rounded-2xl border border-gray-200 hover:shadow-lg transition-all duration-300 text-left">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-3">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-1">Browse Weekly Plans</h4>
            <p className="text-sm text-gray-600">Explore pre-made training schedules</p>
          </button>
          
          <button className="p-4 bg-white rounded-2xl border border-gray-200 hover:shadow-lg transition-all duration-300 text-left">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-3">
              <Dumbbell className="w-6 h-6 text-green-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-1">Workout Templates</h4>
            <p className="text-sm text-gray-600">Find ready-to-use workout sessions</p>
          </button>
          
          <button className="p-4 bg-white rounded-2xl border border-gray-200 hover:shadow-lg transition-all duration-300 text-left">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-3">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-1">Moveframe Library</h4>
            <p className="text-sm text-gray-600">Browse exercise combinations</p>
          </button>
        </div>
      </div>
    </div>
  );
}