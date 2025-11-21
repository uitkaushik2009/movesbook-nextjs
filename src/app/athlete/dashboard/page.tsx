'use client';

import { useState, useEffect } from 'react';
import { 
  Calendar, 
  BarChart3, 
  Settings, 
  Dumbbell,
  Target,
  Award,
  Plus,
  CheckCircle,
  Eye,
  EyeOff,
  Users,
  Building2,
  ChevronRight,
  ChevronDown,
  UserCircle,
  Activity,
  TrendingUp,
  Home,
  Menu,
  HelpCircle
} from 'lucide-react';
import AdvertisementCarousel from '@/components/AdvertisementCarousel';
import ModernNavbar from '@/components/ModernNavbar';
import DarkSidebar from '@/components/DarkSidebar';
import SimpleFooter from '@/components/SimpleFooter';
import AddMemberModal from '@/components/AddMemberModal';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

export default function AthleteDashboard() {
  const [activeSection, setActiveSection] = useState<'overview' | 'workouts' | 'progress' | 'settings'>('overview');
  const [showAdBanner, setShowAdBanner] = useState(true);
  const [showPersonalBanner, setShowPersonalBanner] = useState(true);
  const [showLeftSidebar, setShowLeftSidebar] = useState(true);
  const [showRightSidebar, setShowRightSidebar] = useState(true);
  const [showToolbar, setShowToolbar] = useState(true);
  const [activeRightTab, setActiveRightTab] = useState<'actions-planner' | 'chat-panel'>('actions-planner');
  const [expandedActionsPlanner, setExpandedActionsPlanner] = useState(true);
  
  // Entities athlete belongs to
  const [myCoaches, setMyCoaches] = useState<any[]>([]);
  const [myTeams, setMyTeams] = useState<any[]>([]);
  const [myClubs, setMyClubs] = useState<any[]>([]);
  const [myGroups, setMyGroups] = useState<any[]>([]);
  
  const { user } = useAuth();
  const router = useRouter();

  // Redirect if not athlete
  useEffect(() => {
    if (user && user.userType !== 'ATHLETE') {
      router.push('/my-page');
    }
  }, [user, router]);

  // Load entities the athlete belongs to
  useEffect(() => {
    if (user && user.userType === 'ATHLETE') {
      loadMyCoaches();
      loadMyTeams();
      loadMyClubs();
      loadMyGroups();
    }
  }, [user]);

  const loadMyCoaches = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/athletes/my-coaching-groups', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setMyCoaches(data.coachingGroups || []);
      }
    } catch (error) {
      console.error('Error loading my coaches:', error);
    }
  };

  const loadMyTeams = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/athletes/my-teams', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setMyTeams(data.teams || []);
      }
    } catch (error) {
      console.error('Error loading my teams:', error);
    }
  };

  const loadMyClubs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/athletes/my-clubs', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setMyClubs(data.clubs || []);
      }
    } catch (error) {
      console.error('Error loading my clubs:', error);
    }
  };

  const loadMyGroups = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/athletes/my-groups', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setMyGroups(data.groups || []);
      }
    } catch (error) {
      console.error('Error loading my groups:', error);
    }
  };

  const storeSelectedEntity = (entityType: string, entityId: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`selected${entityType}`, entityId);
    }
  };

  const handleMyCoachingGroupSelect = (groupId: string) => {
    storeSelectedEntity('CoachingGroup', groupId);
    window.location.href = `/my-coaching-group?groupId=${groupId}`;
  };

  const handleMyTeamSelect = (teamId: string) => {
    storeSelectedEntity('Team', teamId);
    window.location.href = `/my-team?teamId=${teamId}`;
  };

  const handleMyClubSelect = (clubId: string) => {
    storeSelectedEntity('Club', clubId);
    window.location.href = `/my-club?clubId=${clubId}`;
  };

  const handleMyGroupSelect = (groupId: string) => {
    storeSelectedEntity('Group', groupId);
    window.location.href = `/my-group?groupId=${groupId}`;
  };

  return (
    <div className="bg-gray-50 flex flex-col" style={{ minHeight: '100vh' }}>
      <ModernNavbar />

      {/* Display Options Toolbar */}
      <div className={`bg-white border-b px-4 py-2 transition-all duration-300 ${showToolbar ? '' : 'overflow-hidden'}`}>
        <div className={`flex items-center justify-between flex-wrap gap-2 transition-all duration-300 ${showToolbar ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="flex items-center gap-4 flex-wrap">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={showAdBanner} onChange={(e) => setShowAdBanner(e.target.checked)} className="w-4 h-4" />
              <span className="flex items-center gap-1">
                {showAdBanner ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                Advertising Banner
              </span>
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={showPersonalBanner} onChange={(e) => setShowPersonalBanner(e.target.checked)} className="w-4 h-4" />
              <span className="flex items-center gap-1">
                {showPersonalBanner ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                Personal Banner & Picture
              </span>
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={showLeftSidebar} onChange={(e) => setShowLeftSidebar(e.target.checked)} className="w-4 h-4" />
              <span className="flex items-center gap-1">
                {showLeftSidebar ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                Left Sidebar
              </span>
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={showRightSidebar} onChange={(e) => setShowRightSidebar(e.target.checked)} className="w-4 h-4" />
              <span className="flex items-center gap-1">
                {showRightSidebar ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                Right Sidebar
              </span>
            </label>
          </div>
        </div>
        <div className="flex items-center justify-end py-1">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={showToolbar} onChange={(e) => setShowToolbar(e.target.checked)} className="w-4 h-4" />
            <span className="flex items-center gap-1 text-gray-600">
              {showToolbar ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              <span className="font-medium">Display Options</span>
            </span>
          </label>
        </div>
      </div>

      <div className="flex-1 flex flex-col w-full py-6">
        {showAdBanner && (
          <div className="mb-6 flex-shrink-0 px-4">
            <AdvertisementCarousel />
          </div>
        )}

        {/* Personal Banner - Horizontal Navigation Bar */}
        {showPersonalBanner && (
          <div className="mb-6 flex-shrink-0 px-4">
            <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg">
              <div className="flex items-center justify-between px-4 py-3 text-sm">
                {/* Left side - Profile Picture, FAQ and Most used buttons */}
                <div className="flex items-center gap-4">
                  {/* Profile Picture */}
                  <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                    {user ? (
                      <UserCircle className="w-8 h-8 text-lime-400" />
                    ) : (
                      <UserCircle className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <div className="flex items-center gap-6">
                    <button className="text-lime-400 hover:text-lime-300 transition-colors flex items-center gap-2">
                      <HelpCircle className="w-4 h-4" />
                      <span>FAQ Suggest Movesbook</span>
                    </button>
                    <button className="text-lime-400 hover:text-lime-300 transition-colors flex items-center gap-2">
                      <span>Most used buttons</span>
                      <Settings className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>

                {/* Center - Navigation items */}
                <div className="flex items-center gap-4">
                  <button className="text-gray-300 hover:text-white transition-colors flex items-center gap-2">
                    <Home className="w-4 h-4" />
                    <span>Home</span>
                  </button>
                  <button className="text-gray-300 hover:text-white transition-colors flex items-center gap-2">
                    <Menu className="w-4 h-4" />
                    <span>Overview</span>
                  </button>
                  <button className="text-gray-300 hover:text-white transition-colors">
                    <span>Myworkout Section</span>
                  </button>
                  <button className="text-gray-300 hover:text-white transition-colors">
                    <span>My Social Activities</span>
                  </button>
                  <button className="text-gray-300 hover:text-white transition-colors">
                    <span>My Social Area</span>
                  </button>
                  <button className="text-gray-300 hover:text-white transition-colors">
                    <span>My Internet Links</span>
                  </button>
                  <button className="text-gray-300 hover:text-white transition-colors">
                    <span>Socials</span>
                  </button>
                  <button className="text-gray-300 hover:text-white transition-colors">
                    <span>My Desk</span>
                  </button>
                </div>

                {/* Right side - Search button */}
                <div className="flex items-center">
                  <button className="bg-red-700 hover:bg-red-800 text-lime-400 px-4 py-2 rounded transition-colors flex items-center gap-2">
                    <span>Search in the Network</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 flex gap-0">
          {showLeftSidebar && (
            <div className="w-80 flex-shrink-0 sticky top-0 self-start">
              <DarkSidebar
                userType={user?.userType || ''}
                entities={[]}
                onMyPageClick={() => router.push('/my-page')}
              />
            </div>
          )}

          <div className="flex-1 min-w-0 flex flex-col px-4">
            {activeSection === 'overview' && <AthleteOverview />}
            {activeSection === 'workouts' && <AthleteWorkouts />}
            {activeSection === 'progress' && <AthleteProgress />}
            {activeSection === 'settings' && <AthleteSettings />}
          </div>

          {showRightSidebar && (
            <div className="w-80 flex-shrink-0">
              <div className="bg-white rounded-lg shadow-sm border p-4 h-full flex flex-col">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button className="w-full flex items-center justify-between p-4 border-2 border-dashed border-green-200 rounded-xl hover:border-green-300 hover:bg-green-50 transition-all duration-200 group">
                    <span className="text-sm font-medium text-gray-700 group-hover:text-green-700">Athlete Workout Plan</span>
                    <Target className="w-4 h-4 text-gray-400 group-hover:text-green-500" />
                  </button>
                </div>

                {/* Actions Planner and Chat Panel Tabs */}
                <div className="mt-6">
                  <div className="flex border-b border-gray-200 mb-4">
                    <button
                      onClick={() => setActiveRightTab('actions-planner')}
                      className={`flex-1 py-2 px-4 text-sm font-medium transition-colors ${
                        activeRightTab === 'actions-planner'
                          ? 'bg-gray-100 text-gray-900 border-b-2 border-blue-600'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Actions planner
                    </button>
                    <button
                      onClick={() => setActiveRightTab('chat-panel')}
                      className={`flex-1 py-2 px-4 text-sm font-medium transition-colors ${
                        activeRightTab === 'chat-panel'
                          ? 'bg-gray-100 text-gray-900 border-b-2 border-blue-600'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Chat panel
                    </button>
                  </div>

                  {/* Actions Planner Content */}
                  {activeRightTab === 'actions-planner' && (
                    <div className="space-y-1">
                      <button className="w-full flex items-center justify-between py-2 px-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                        <span>Timeline of all users</span>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </button>
                      <button className="w-full flex items-center justify-between py-2 px-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                        <span>Timeline of an user</span>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </button>
                      <button className="w-full flex items-center justify-between py-2 px-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                        <span>Actions planned</span>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </button>
                      <button className="w-full flex items-center justify-between py-2 px-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                        <span>Users of the action planner</span>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </button>
                      <button 
                        onClick={() => setExpandedActionsPlanner(!expandedActionsPlanner)}
                        className="w-full flex items-center justify-between py-2 px-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <span>Settings</span>
                        {expandedActionsPlanner ? (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                      {expandedActionsPlanner && (
                        <div className="ml-4 space-y-1">
                          <button className="w-full flex items-center justify-between py-2 px-3 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                            <span>Preset timelines</span>
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                          </button>
                          <button className="w-full flex items-center justify-between py-2 px-3 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                            <span>Actions settings</span>
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                          </button>
                          <button className="w-full flex items-center justify-between py-2 px-3 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                            <span>Action settings by MB</span>
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Chat Panel Content */}
                  {activeRightTab === 'chat-panel' && (
                    <div className="text-sm text-gray-600 py-4">
                      Chat panel content will be displayed here.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <SimpleFooter />
    </div>
  );
}

function AthleteOverview() {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 flex-1 flex flex-col">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Activity Overview</h2>
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl text-white shadow-lg">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium opacity-90">This Week</h3>
            <Calendar className="w-5 h-5 opacity-90" />
          </div>
          <p className="text-3xl font-bold mt-3">3 workouts</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl text-white shadow-lg">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium opacity-90">This Month</h3>
            <Target className="w-5 h-5 opacity-90" />
          </div>
          <p className="text-3xl font-bold mt-3">12 workouts</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl text-white shadow-lg">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium opacity-90">Completion Rate</h3>
            <Award className="w-5 h-5 opacity-90" />
          </div>
          <p className="text-3xl font-bold mt-3">85%</p>
        </div>
      </div>
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity Feed</h3>
        <div className="space-y-4">
          {[1, 2, 3].map((item) => (
            <div key={item} className="p-4 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-gray-900">Workout Session #{item}</h4>
                  <p className="text-sm text-gray-500">Completed on {new Date().toLocaleDateString()}</p>
                </div>
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AthleteWorkouts() {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 flex-1 flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">My Workouts</h2>
        <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg">
          Add Workout
        </button>
      </div>
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Workout Plans</h3>
        <div className="space-y-4">
          {[1, 2, 3].map((item) => (
            <div key={item} className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all duration-200">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Dumbbell className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Training Plan #{item}</h4>
                  <p className="text-sm text-gray-500">Active • 5 workouts scheduled</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">Progress: 60%</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AthleteProgress() {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 flex-1 flex flex-col">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Progress & Analytics</h2>
      <div className="grid grid-cols-2 gap-6 flex-1">
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center p-8">
          <div className="text-center text-gray-500">
            <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-60" />
            <p className="text-lg font-medium">Progress Chart</p>
            <p className="text-sm mt-2">Your workout progress over time</p>
          </div>
        </div>
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center p-8">
          <div className="text-center text-gray-500">
            <TrendingUp className="w-16 h-16 mx-auto mb-4 opacity-60" />
            <p className="text-lg font-medium">Performance Trends</p>
            <p className="text-sm mt-2">Track your improvements</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function AthleteSettings() {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 flex-1 flex flex-col">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Settings</h2>
      <div className="space-y-4 flex-1">
        <div className="p-6 border-2 border-gray-200 rounded-xl hover:border-blue-300 transition-all duration-200">
          <h3 className="font-semibold text-gray-900 mb-3 text-lg">Profile Settings</h3>
          <p className="text-gray-600">Manage your personal information and preferences</p>
        </div>
        <div className="p-6 border-2 border-gray-200 rounded-xl hover:border-green-300 transition-all duration-200">
          <h3 className="font-semibold text-gray-900 mb-3 text-lg">Workout Preferences</h3>
          <p className="text-gray-600">Customize your workout experience and default settings</p>
        </div>
      </div>
      <SimpleFooter />
    </div>
  );
}

