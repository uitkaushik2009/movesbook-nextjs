'use client';

import { useState } from 'react';
import ModernNavbar from '@/components/ModernNavbar';
import SimpleFooter from '@/components/SimpleFooter';
import { useAuth } from '@/hooks/useAuth';
import { 
  Shield, 
  Eye, 
  EyeOff, 
  Lock, 
  Globe, 
  User, 
  Mail, 
  Phone,
  MapPin,
  Calendar,
  Users,
  Settings
} from 'lucide-react';

export default function PrivacyPage() {
  const { user } = useAuth();
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'public',
    emailVisibility: true,
    phoneVisibility: false,
    locationVisibility: true,
    allowVisiting: true,
    showOnlineStatus: true,
    allowFriendRequests: true,
    allowMessages: true
  });

  const handleSettingChange = (key: string, value: any) => {
    setPrivacySettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="bg-gray-50 flex flex-col" style={{ minHeight: '100vh' }}>
      <ModernNavbar />

      <div className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6 pb-4 border-b">
            <Shield className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Privacy Settings</h1>
              <p className="text-gray-600 mt-1">Manage your privacy and visibility settings</p>
            </div>
          </div>

          {/* Profile Visibility */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Profile Visibility
            </h2>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="profileVisibility"
                  value="public"
                  checked={privacySettings.profileVisibility === 'public'}
                  onChange={(e) => handleSettingChange('profileVisibility', e.target.value)}
                  className="w-4 h-4 text-blue-600"
                />
                <Globe className="w-5 h-5 text-green-600" />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">Public</div>
                  <div className="text-sm text-gray-600">Anyone can view your profile</div>
                </div>
              </label>
              <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="profileVisibility"
                  value="friends"
                  checked={privacySettings.profileVisibility === 'friends'}
                  onChange={(e) => handleSettingChange('profileVisibility', e.target.value)}
                  className="w-4 h-4 text-blue-600"
                />
                <Users className="w-5 h-5 text-blue-600" />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">Friends Only</div>
                  <div className="text-sm text-gray-600">Only your friends can view your profile</div>
                </div>
              </label>
              <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="profileVisibility"
                  value="private"
                  checked={privacySettings.profileVisibility === 'private'}
                  onChange={(e) => handleSettingChange('profileVisibility', e.target.value)}
                  className="w-4 h-4 text-blue-600"
                />
                <Lock className="w-5 h-5 text-red-600" />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">Private</div>
                  <div className="text-sm text-gray-600">Only you can view your profile</div>
                </div>
              </label>
            </div>
          </div>

          {/* Contact Information Visibility */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Contact Information
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-600" />
                  <div>
                    <div className="font-medium text-gray-900">Email Address</div>
                    <div className="text-sm text-gray-600">Show your email to others</div>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={privacySettings.emailVisibility}
                    onChange={(e) => handleSettingChange('emailVisibility', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gray-600" />
                  <div>
                    <div className="font-medium text-gray-900">Phone Number</div>
                    <div className="text-sm text-gray-600">Show your phone number to others</div>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={privacySettings.phoneVisibility}
                    onChange={(e) => handleSettingChange('phoneVisibility', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-gray-600" />
                  <div>
                    <div className="font-medium text-gray-900">Location</div>
                    <div className="text-sm text-gray-600">Show your city and country</div>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={privacySettings.locationVisibility}
                    onChange={(e) => handleSettingChange('locationVisibility', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Activity & Interactions */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Activity & Interactions
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Eye className="w-5 h-5 text-gray-600" />
                  <div>
                    <div className="font-medium text-gray-900">Allow users to know I am visiting them</div>
                    <div className="text-sm text-gray-600">Show when you visit other users' profiles</div>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={privacySettings.allowVisiting}
                    onChange={(e) => handleSettingChange('allowVisiting', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-600" />
                  <div>
                    <div className="font-medium text-gray-900">Show Online Status</div>
                    <div className="text-sm text-gray-600">Display when you're online</div>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={privacySettings.showOnlineStatus}
                    onChange={(e) => handleSettingChange('showOnlineStatus', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-gray-600" />
                  <div>
                    <div className="font-medium text-gray-900">Allow Friend Requests</div>
                    <div className="text-sm text-gray-600">Let others send you friend requests</div>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={privacySettings.allowFriendRequests}
                    onChange={(e) => handleSettingChange('allowFriendRequests', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-600" />
                  <div>
                    <div className="font-medium text-gray-900">Allow Messages</div>
                    <div className="text-sm text-gray-600">Let others send you messages</div>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={privacySettings.allowMessages}
                    onChange={(e) => handleSettingChange('allowMessages', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end gap-4 pt-6 border-t">
            <button className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Save Changes
            </button>
          </div>
        </div>
      </div>

      <SimpleFooter />
    </div>
  );
}

