'use client';

import { useState, useEffect } from 'react';
import { Users, Plus, X, Search } from 'lucide-react';

interface Athlete {
  id: string;
  name: string;
  email: string;
  username: string;
}

interface AthleteSelectorProps {
  selectedAthleteId: string | null;
  onSelectAthlete: (athleteId: string | null) => void;
}

export default function AthleteSelector({ selectedAthleteId, onSelectAthlete }: AthleteSelectorProps) {
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [athleteEmail, setAthleteEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadAthletes();
  }, []);

  const loadAthletes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/coach/athletes', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAthletes(data.athletes || []);
      }
    } catch (error) {
      console.error('Error loading athletes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAthlete = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/coach/athletes', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ athleteEmail, notes })
      });

      if (response.ok) {
        const data = await response.json();
        setAthletes([...athletes, data.coachAthlete.athlete]);
        setShowAddModal(false);
        setAthleteEmail('');
        setNotes('');
        alert('Athlete added successfully!');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to add athlete');
      }
    } catch (error) {
      console.error('Error adding athlete:', error);
      alert('Failed to add athlete');
    } finally {
      setIsAdding(false);
    }
  };

  const filteredAthletes = athletes.filter(athlete =>
    athlete.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    athlete.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    athlete.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedAthlete = athletes.find(a => a.id === selectedAthleteId);

  return (
    <div className="bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center gap-4">
          {/* Title */}
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-gray-700">Athlete:</span>
          </div>

          {/* Dropdown */}
          <div className="flex-1 max-w-md">
            <select
              value={selectedAthleteId || ''}
              onChange={(e) => onSelectAthlete(e.target.value || null)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isLoading}
            >
              <option value="">My Personal Workouts</option>
              {filteredAthletes.map((athlete) => (
                <option key={athlete.id} value={athlete.id}>
                  {athlete.name} ({athlete.email})
                </option>
              ))}
            </select>
          </div>

          {/* Search */}
          {athletes.length > 0 && (
            <div className="flex-1 max-w-xs relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search athletes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}

          {/* Add Button */}
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Athlete</span>
          </button>
        </div>

        {/* Selected Athlete Info */}
        {selectedAthlete && (
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-900">
                  Viewing workouts for: <span className="font-bold">{selectedAthlete.name}</span>
                </p>
                <p className="text-xs text-blue-700">{selectedAthlete.email}</p>
              </div>
              <button
                onClick={() => onSelectAthlete(null)}
                className="text-blue-600 hover:text-blue-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Athlete Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Add New Athlete</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddAthlete} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Athlete Email *
                </label>
                <input
                  type="email"
                  value={athleteEmail}
                  onChange={(e) => setAthleteEmail(e.target.value)}
                  placeholder="athlete@example.com"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Enter the email address of an existing athlete
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any notes about this athlete..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAdding}
                  className={`flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium transition ${
                    isAdding ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
                  }`}
                >
                  {isAdding ? 'Adding...' : 'Add Athlete'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

