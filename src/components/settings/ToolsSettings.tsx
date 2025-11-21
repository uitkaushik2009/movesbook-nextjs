'use client';

import { useState } from 'react';
import { Plus, Edit3, Trash2, ArrowUpDown, GripVertical, Save } from 'lucide-react';

interface Period {
  id: string;
  title: string;
  description: string;
  color: string;
}

interface WorkoutSection {
  id: string;
  title: string;
  description: string;
  color: string;
}

interface Sport {
  id: string;
  name: string;
  icon: string;
  order: number;
}

const defaultSports: Sport[] = [
  { id: '1', name: 'Swim', icon: '🏊', order: 1 },
  { id: '2', name: 'Run', icon: '🏃', order: 2 },
  { id: '3', name: 'Bike', icon: '🚴', order: 3 },
  { id: '4', name: 'Weights', icon: '🏋️', order: 4 },
  { id: '5', name: 'Rowing', icon: '🚣', order: 5 },
  { id: '6', name: 'Yoga', icon: '🧘', order: 6 },
  { id: '7', name: 'Stretching', icon: '🤸', order: 7 },
  { id: '8', name: 'Pilates', icon: '💪', order: 8 },
];

export default function ToolsSettings() {
  const [activeTab, setActiveTab] = useState<'periods' | 'sections' | 'sports' | 'tools'>('periods');
  const [periods, setPeriods] = useState<Period[]>([]);
  const [sections, setSections] = useState<WorkoutSection[]>([]);
  const [sports, setSports] = useState<Sport[]>(defaultSports);
  const [newItem, setNewItem] = useState({ title: '', description: '', color: '#3b82f6' });
  const [editingItem, setEditingItem] = useState<Period | WorkoutSection | null>(null);
  const [sortOrder, setSortOrder] = useState<'a-z' | 'z-a'>('a-z');

  const addItem = () => {
    if (newItem.title.trim()) {
      const item = {
        id: Date.now().toString(),
        title: newItem.title,
        description: newItem.description,
        color: newItem.color
      };
      
      if (activeTab === 'periods') {
        setPeriods(prev => [...prev, item as Period]);
      } else {
        setSections(prev => [...prev, item as WorkoutSection]);
      }
      
      setNewItem({ title: '', description: '', color: '#3b82f6' });
    }
  };

  const deleteItem = (id: string) => {
    if (activeTab === 'periods') {
      setPeriods(prev => prev.filter(item => item.id !== id));
    } else {
      setSections(prev => prev.filter(item => item.id !== id));
    }
  };

  const updateItem = (updatedItem: Period | WorkoutSection) => {
    if (activeTab === 'periods') {
      setPeriods(prev => prev.map(item => item.id === updatedItem.id ? updatedItem as Period : item));
    } else {
      setSections(prev => prev.map(item => item.id === updatedItem.id ? updatedItem as WorkoutSection : item));
    }
    setEditingItem(null);
  };

  const sortItems = (items: any[]) => {
    return [...items].sort((a, b) => {
      if (sortOrder === 'a-z') {
        return a.title.localeCompare(b.title);
      } else {
        return b.title.localeCompare(a.title);
      }
    });
  };

  const moveSport = (fromIndex: number, toIndex: number) => {
    const newSports = [...sports];
    const [movedSport] = newSports.splice(fromIndex, 1);
    newSports.splice(toIndex, 0, movedSport);
    setSports(newSports.map((sport, index) => ({ ...sport, order: index + 1 })));
  };

  const getDisplayedSports = () => {
    const mainSports = sports.slice(0, 5);
    const otherSports = sports.slice(5);
    return { mainSports, otherSports };
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">Tools Settings</h2>
        <div className="flex space-x-4">
          {['periods', 'sections', 'sports', 'tools'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-6 py-3 rounded-2xl font-semibold transition-all duration-300 capitalize ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'periods' && (
        <div className="space-y-6">
          {/* Add New Period */}
          <div className="bg-gradient-to-r from-cyan-50 to-purple-50 rounded-2xl p-6 border border-cyan-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Add New Period</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Title (max 30 characters)"
                maxLength={30}
                value={newItem.title}
                onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                className="px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <input
                type="text"
                placeholder="Description (max 255 characters)"
                maxLength={255}
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                className="px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <div className="flex space-x-4">
                <input
                  type="color"
                  value={newItem.color}
                  onChange={(e) => setNewItem({ ...newItem, color: e.target.value })}
                  className="w-16 h-12 border border-gray-300 rounded-2xl cursor-pointer"
                />
                <button
                  onClick={addItem}
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-2xl font-semibold hover:from-cyan-600 hover:to-purple-600 transition-all duration-300 flex items-center justify-center"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Periods List */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Periods ({periods.length})</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => setSortOrder(sortOrder === 'a-z' ? 'z-a' : 'a-z')}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  <ArrowUpDown className="w-4 h-4" />
                  <span>Sort {sortOrder === 'a-z' ? 'A-Z' : 'Z-A'}</span>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {sortItems(periods).map((period) => (
                <div key={period.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                  <div className="flex items-center space-x-4">
                    <div 
                      className="w-8 h-8 rounded-lg"
                      style={{ backgroundColor: period.color }}
                    />
                    <div>
                      <h4 className="font-semibold text-gray-900">{period.title}</h4>
                      <p className="text-sm text-gray-600">{period.description}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setEditingItem(period)}
                      className="p-2 bg-cyan-100 text-cyan-700 rounded-lg hover:bg-cyan-200 transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteItem(period.id)}
                      className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              
              {periods.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <p>No periods created yet. Add your first period above.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'sections' && (
        <div className="space-y-6">
          {/* Add New Section - Similar to periods */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 border border-green-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Add New Workout Section</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Title (max 30 characters)"
                maxLength={30}
                value={newItem.title}
                onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                className="px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <input
                type="text"
                placeholder="Description (max 255 characters)"
                maxLength={255}
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                className="px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <div className="flex space-x-4">
                <input
                  type="color"
                  value={newItem.color}
                  onChange={(e) => setNewItem({ ...newItem, color: e.target.value })}
                  className="w-16 h-12 border border-gray-300 rounded-2xl cursor-pointer"
                />
                <button
                  onClick={addItem}
                  className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-2xl font-semibold hover:from-green-600 hover:to-blue-600 transition-all duration-300 flex items-center justify-center"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Sections List - Similar to periods */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Workout Sections ({sections.length})</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => setSortOrder(sortOrder === 'a-z' ? 'z-a' : 'a-z')}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  <ArrowUpDown className="w-4 h-4" />
                  <span>Sort {sortOrder === 'a-z' ? 'A-Z' : 'Z-A'}</span>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {sortItems(sections).map((section) => (
                <div key={section.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                  <div className="flex items-center space-x-4">
                    <div 
                      className="w-8 h-8 rounded-lg"
                      style={{ backgroundColor: section.color }}
                    />
                    <div>
                      <h4 className="font-semibold text-gray-900">{section.title}</h4>
                      <p className="text-sm text-gray-600">{section.description}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setEditingItem(section)}
                      className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteItem(section.id)}
                      className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              
              {sections.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <p>No workout sections created yet. Add your first section above.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'sports' && (
        <div className="space-y-8">
          {/* Main Sports (First 5) */}
          <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-6 border border-orange-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Main Sports (First 5)</h3>
            <p className="text-gray-600 mb-6">Drag to reorder your main sports. These will be displayed immediately when creating workouts.</p>
            
            <div className="space-y-3">
              {getDisplayedSports().mainSports.map((sport, index) => (
                <div
                  key={sport.id}
                  className="flex items-center justify-between p-4 bg-white rounded-2xl border-2 border-orange-200 shadow-sm"
                >
                  <div className="flex items-center space-x-4">
                    <GripVertical className="w-5 h-5 text-gray-400 cursor-grab" />
                    <span className="text-2xl">{sport.icon}</span>
                    <span className="font-semibold text-gray-900">{sport.name}</span>
                  </div>
                  <div className="text-sm text-gray-500">#{sport.order}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Other Sports */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Other Sports</h3>
            <p className="text-gray-600 mb-6">These sports will be available under "Other sports" when creating workouts.</p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {getDisplayedSports().otherSports.map((sport) => (
                <div
                  key={sport.id}
                  className="flex items-center space-x-3 p-4 bg-gray-50 rounded-2xl border border-gray-200"
                >
                  <span className="text-2xl">{sport.icon}</span>
                  <span className="font-semibold text-gray-900">{sport.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sport Preview */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Workout Creation Preview</h3>
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <div className="flex flex-wrap gap-2 mb-4">
                {getDisplayedSports().mainSports.map((sport) => (
                  <button
                    key={sport.id}
                    className="flex items-center space-x-2 px-4 py-2 bg-cyan-100 text-cyan-700 rounded-xl font-semibold hover:bg-cyan-200 transition-colors"
                  >
                    <span>{sport.icon}</span>
                    <span>{sport.name}</span>
                  </button>
                ))}
                <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors">
                  <span>⋯</span>
                  <span>Other sports</span>
                </button>
              </div>
              <p className="text-sm text-gray-500">This is how your sports will appear when creating new workouts.</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'tools' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tools & Machines */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Tools & Machines</h3>
              <p className="text-gray-600 mb-4">Manage your fitness equipment and training tools.</p>
              <button className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-3 rounded-2xl font-semibold hover:from-blue-600 hover:to-indigo-600 transition-all duration-300">
                Manage Tools
              </button>
            </div>

            {/* Data Bank Exercises */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Data Bank Exercises</h3>
              <p className="text-gray-600 mb-4">Access and manage your exercise library.</p>
              <button className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-2xl font-semibold hover:from-green-600 hover:to-emerald-600 transition-all duration-300">
                Exercise Library
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Edit {activeTab === 'periods' ? 'Period' : 'Section'}</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={editingItem.title}
                  onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  maxLength={30}
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  value={editingItem.description}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  maxLength={255}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Color</label>
                <input
                  type="color"
                  value={editingItem.color}
                  onChange={(e) => setEditingItem({ ...editingItem, color: e.target.value })}
                  className="w-full h-12 border border-gray-300 rounded-2xl cursor-pointer"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4 mt-8">
              <button
                onClick={() => setEditingItem(null)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-2xl font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => updateItem(editingItem)}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-2xl font-semibold hover:from-cyan-600 hover:to-purple-600 transition-all duration-300"
              >
                <Save className="w-5 h-5" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}