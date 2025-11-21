'use client';

import { useState } from 'react';
import { X, UserPlus, UserCheck, ArrowRight, Eye, EyeOff } from 'lucide-react';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddNewUser?: (data: { password: string; username?: string; name?: string; email?: string }) => void;
  onAddExistingUser?: (data: { username: string; password: string }) => void;
  entityType?: 'club' | 'team' | 'group' | 'coaching-group';
}

export default function AddMemberModal({
  isOpen,
  onClose,
  onAddNewUser,
  onAddExistingUser,
  entityType = 'club'
}: AddMemberModalProps) {
  const [activeOption, setActiveOption] = useState<'new' | 'existing' | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  
  // Form states for existing user
  const [existingUsername, setExistingUsername] = useState('');
  const [existingPassword, setExistingPassword] = useState('');
  
  // Form states for new user
  const [newUsername, setNewUsername] = useState('');
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');

  if (!isOpen) return null;

  const handleAddNewUser = () => {
    setActiveOption('new');
  };

  const handleAddExistingUser = () => {
    setActiveOption('existing');
  };

  const handleCancel = () => {
    setActiveOption(null);
    setExistingUsername('');
    setExistingPassword('');
    setNewUsername('');
    setNewName('');
    setNewEmail('');
    setNewPassword('');
    setShowPassword(false);
    onClose();
  };

  const handleSubmitExistingUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (existingUsername && existingPassword && onAddExistingUser) {
      onAddExistingUser({ username: existingUsername, password: existingPassword });
      handleCancel();
    }
  };

  const handleSubmitNewUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword && onAddNewUser) {
      onAddNewUser({ 
        password: newPassword,
        username: newUsername || undefined,
        name: newName || undefined,
        email: newEmail || undefined
      });
      handleCancel();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* Dark Red Banner */}
        <div className="bg-red-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-white font-bold text-lg">Add a new member</h2>
          <ArrowRight className="w-5 h-5 text-white" />
        </div>

        {/* Initial Buttons Section */}
        {!activeOption && (
          <div className="p-6 space-y-3">
            <button
              onClick={handleAddNewUser}
              className="w-full bg-gray-800 hover:bg-gray-700 text-white py-4 px-6 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <UserPlus className="w-5 h-5" />
              <span>Add a member never registered</span>
            </button>

            <button
              onClick={handleAddExistingUser}
              className="w-full bg-gray-800 hover:bg-gray-700 text-white py-4 px-6 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <UserCheck className="w-5 h-5" />
              <span>Add a user of Movesbook</span>
            </button>

            <button
              onClick={handleCancel}
              className="w-full bg-gray-800 hover:bg-gray-700 text-white py-4 px-6 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Form for Existing User */}
        {activeOption === 'existing' && (
          <form onSubmit={handleSubmitExistingUser} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                value={existingUsername}
                onChange={(e) => setExistingUsername(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Type his/her username"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={existingPassword}
                  onChange={(e) => setExistingPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                  placeholder="Type his/her password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
              >
                OK
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Form for New User */}
        {activeOption === 'new' && (
          <form onSubmit={handleSubmitNewUser} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                  placeholder="Type password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
              >
                OK
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

