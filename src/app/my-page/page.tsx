'use client';

<<<<<<< HEAD
import { useState, useEffect } from 'react';
=======
import { useState } from 'react';
>>>>>>> 21d778b56ceb678af8ea9a9eb545faff336aa642
import { 
  Calendar, 
  BarChart3, 
  Settings, 
  Dumbbell,
  Target,
  Award,
  Plus,
<<<<<<< HEAD
  CheckCircle,
  Eye,
  EyeOff,
  Users,
  Building2,
  X,
  ChevronRight,
  UserCircle,
  Home,
  Menu,
  Search,
  HelpCircle,
  Globe,
  Briefcase,
  Link as LinkIcon
} from 'lucide-react';
import AdvertisementCarousel from '@/components/AdvertisementCarousel';
import ModernNavbar from '@/components/ModernNavbar';
import DarkSidebar from '@/components/DarkSidebar';
import SimpleFooter from '@/components/SimpleFooter';
import AddMemberModal from '@/components/AddMemberModal';
import { useAuth } from '@/hooks/useAuth';
import Image from 'next/image';

export default function MyPage() {
  const [activeSection, setActiveSection] = useState<'workouts' | 'progress' | 'settings'>('workouts');
  const [showAdBanner, setShowAdBanner] = useState(true);
  const [showPersonalBanner, setShowPersonalBanner] = useState(true);
  const [showLeftSidebar, setShowLeftSidebar] = useState(true);
  const [showRightSidebar, setShowRightSidebar] = useState(true);
  const [showToolbar, setShowToolbar] = useState(true);
  const [selectedClub, setSelectedClub] = useState<string | null>(null);
  const [clubs, setClubs] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [coachingGroups, setCoachingGroups] = useState<any[]>([]);
  
  // For athletes - entities they belong to
  const [myCoaches, setMyCoaches] = useState<any[]>([]);
  const [myTeams, setMyTeams] = useState<any[]>([]);
  const [myClubs, setMyClubs] = useState<any[]>([]);
  const [myGroups, setMyGroups] = useState<any[]>([]);
  
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'my-page' | 'my-entity'>('my-page');
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);

  // Load functions - defined before useEffect
  const loadClubs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/clubs/my-clubs', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setClubs(data.clubs || []);
      }
    } catch (error) {
      console.error('Error loading clubs:', error);
    }
  };

  const loadGroups = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/groups/my-groups', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setGroups(data.groups || []);
      }
    } catch (error) {
      console.error('Error loading groups:', error);
    }
  };

  const loadTeams = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/teams/my-teams', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setTeams(data.teams || []);
      }
    } catch (error) {
      console.error('Error loading teams:', error);
    }
  };

  const loadCoachingGroups = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/coaching-groups/my-coaching-groups', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setCoachingGroups(data.coachingGroups || []);
      }
    } catch (error) {
      console.error('Error loading coaching groups:', error);
    }
  };

  // Load entities for athletes (where they are members)
  const loadMyCoaches = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/athletes/my-coaching-groups', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
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
        headers: {
          'Authorization': `Bearer ${token}`
        }
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
        headers: {
          'Authorization': `Bearer ${token}`
        }
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
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setMyGroups(data.groups || []);
      }
    } catch (error) {
      console.error('Error loading my groups:', error);
    }
  };

  // Load user's entities based on their type
  useEffect(() => {
    if (user) {
      if (user.userType === 'CLUB_TRAINER') {
        loadClubs();
      } else if (user.userType === 'GROUP_ADMIN') {
        loadGroups();
      } else if (user.userType === 'TEAM_MANAGER') {
        loadTeams();
      } else if (user.userType === 'COACH') {
        loadCoachingGroups();
      } else if (user.userType === 'ATHLETE') {
        // Load entities the athlete belongs to
        loadMyCoaches();
        loadMyTeams();
        loadMyClubs();
        loadMyGroups();
      }
    }
  }, [user]);

  // Store selected entity in session for persistence
  const storeSelectedEntity = (entityType: string, entityId: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`selected${entityType}`, entityId);
    }
  };

  const handleClubSelect = (clubId: string) => {
    setSelectedClub(clubId);
    storeSelectedEntity('Club', clubId);
    window.location.href = `/my-club?clubId=${clubId}`;
  };

  const handleGroupSelect = (groupId: string) => {
    storeSelectedEntity('Group', groupId);
    window.location.href = `/my-group?groupId=${groupId}`;
  };

  const handleTeamSelect = (teamId: string) => {
    storeSelectedEntity('Team', teamId);
    window.location.href = `/my-team?teamId=${teamId}`;
  };

  const handleCoachingGroupSelect = (groupId: string) => {
    storeSelectedEntity('CoachingGroup', groupId);
    window.location.href = `/my-coaching-group?groupId=${groupId}`;
  };

  // Handlers for athletes to view their entities (same pages, different context)
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
      {/* Modern Navbar */}
      <ModernNavbar />

      {/* Display Options Toolbar - Always visible but can be collapsed */}
      <div className={`bg-white border-b px-4 py-2 transition-all duration-300 ${showToolbar ? '' : 'overflow-hidden'}`}>
        <div className={`flex items-center justify-between flex-wrap gap-2 transition-all duration-300 ${showToolbar ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="flex items-center gap-4 flex-wrap">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={showAdBanner}
                onChange={(e) => setShowAdBanner(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="flex items-center gap-1">
                {showAdBanner ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                Advertising Banner
              </span>
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={showPersonalBanner}
                onChange={(e) => setShowPersonalBanner(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="flex items-center gap-1">
                {showPersonalBanner ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                Personal Banner & Picture
              </span>
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={showLeftSidebar}
                onChange={(e) => setShowLeftSidebar(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="flex items-center gap-1">
                {showLeftSidebar ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                Left Sidebar
              </span>
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={showRightSidebar}
                onChange={(e) => setShowRightSidebar(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="flex items-center gap-1">
                {showRightSidebar ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                Right Sidebar
              </span>
            </label>
          </div>
        </div>
        {/* Toggle button - always visible */}
        <div className="flex items-center justify-end py-1">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={showToolbar}
              onChange={(e) => setShowToolbar(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="flex items-center gap-1 text-gray-600">
              {showToolbar ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              <span className="font-medium">Display Options</span>
            </span>
          </label>
        </div>
      </div>

      <div className="flex-1 flex flex-col w-full py-6">
        {/* Advertisement Carousel - Top Section */}
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
=======
  CheckCircle
} from 'lucide-react';
import AdvertisementCarousel from '@/components/AdvertisementCarousel';
import TransitionMenuBar from '@/components/TransitionMenuBar';

export default function MyPage() {
  const [activeSection, setActiveSection] = useState<'workouts' | 'progress' | 'settings'>('workouts');

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Transition Menu Bar */}
      <TransitionMenuBar />

      <div className="flex-1 flex flex-col max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        {/* Advertisement Carousel - Top Section */}
        <div className="mb-6 flex-shrink-0">
          <AdvertisementCarousel />
        </div>

        {/* Main Content Area - Fills remaining space */}
        <div className="flex-1 flex gap-6 min-h-0">
          {/* Left Sidebar */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border p-4 h-full flex flex-col">
              <nav className="space-y-2 flex-1">
                <button
                  onClick={() => setActiveSection('workouts')}
                  className={`w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                    activeSection === 'workouts'
                      ? 'bg-blue-50 text-blue-700 border-2 border-blue-200 shadow-sm'
                      : 'text-gray-700 hover:bg-gray-50 hover:border-gray-200 border border-transparent'
                  }`}
                >
                  <Dumbbell className="w-4 h-4 mr-3" />
                  Workouts
                </button>
                
                <button
                  onClick={() => setActiveSection('progress')}
                  className={`w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                    activeSection === 'progress'
                      ? 'bg-blue-50 text-blue-700 border-2 border-blue-200 shadow-sm'
                      : 'text-gray-700 hover:bg-gray-50 hover:border-gray-200 border border-transparent'
                  }`}
                >
                  <BarChart3 className="w-4 h-4 mr-3" />
                  Progress & Analytics
                </button>
                
                <button
                  onClick={() => setActiveSection('settings')}
                  className={`w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                    activeSection === 'settings'
                      ? 'bg-blue-50 text-blue-700 border-2 border-blue-200 shadow-sm'
                      : 'text-gray-700 hover:bg-gray-50 hover:border-gray-200 border border-transparent'
                  }`}
                >
                  <Settings className="w-4 h-4 mr-3" />
                  Settings
                </button>
              </nav>

              {/* Quick Stats */}
              <div className="mt-6 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                <h3 className="text-xs font-semibold text-blue-800 uppercase tracking-wide mb-3">
                  Quick Stats
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">This Week</span>
                    <span className="font-bold text-blue-600">3/5</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Calories</span>
                    <span className="font-bold text-green-600">2,450</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Active Days</span>
                    <span className="font-bold text-purple-600">12</span>
>>>>>>> 21d778b56ceb678af8ea9a9eb545faff336aa642
                  </div>
                </div>
              </div>
            </div>
<<<<<<< HEAD
        )}

        {/* Main Content Area - Fills remaining space */}
        <div className="flex-1 flex gap-0">
          {/* Left Sidebar */}
          {showLeftSidebar && (
            <div className="w-80 flex-shrink-0 sticky top-0 self-start">
              <DarkSidebar
                userType={user?.userType || ''}
                entities={
                  user?.userType === 'CLUB_TRAINER' ? clubs :
                  user?.userType === 'TEAM_MANAGER' ? teams :
                  user?.userType === 'GROUP_ADMIN' ? groups :
                  user?.userType === 'COACH' ? coachingGroups : []
                }
                selectedEntityId={
                  user?.userType === 'CLUB_TRAINER' ? selectedClub :
                  user?.userType === 'TEAM_MANAGER' ? null :
                  user?.userType === 'GROUP_ADMIN' ? null :
                  user?.userType === 'COACH' ? null : null
                }
                onEntitySelect={(id) => {
                  if (user?.userType === 'CLUB_TRAINER') {
                    handleClubSelect(id);
                  } else if (user?.userType === 'TEAM_MANAGER') {
                    handleTeamSelect(id);
                  } else if (user?.userType === 'GROUP_ADMIN') {
                    handleGroupSelect(id);
                  } else if (user?.userType === 'COACH') {
                    handleCoachingGroupSelect(id);
                  }
                }}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                onMyPageClick={() => setActiveTab('my-page')}
                onMyClubClick={() => {
                  setActiveTab('my-entity');
                  if (selectedClub) {
                    window.location.href = `/my-club?clubId=${selectedClub}`;
                  } else if (clubs.length > 0) {
                    window.location.href = `/my-club?clubId=${clubs[0].id}`;
                  }
                }}
                onMyTeamClick={() => {
                  setActiveTab('my-entity');
                  if (teams.length > 0) {
                    window.location.href = `/my-team?teamId=${teams[0].id}`;
                  }
                }}
                onMyGroupClick={() => {
                  setActiveTab('my-entity');
                  if (groups.length > 0) {
                    window.location.href = `/my-group?groupId=${groups[0].id}`;
                  }
                }}
                onMyCoachingGroupClick={() => {
                  setActiveTab('my-entity');
                  if (coachingGroups.length > 0) {
                    window.location.href = `/my-coaching-group?groupId=${coachingGroups[0].id}`;
                  }
                }}
              />
          </div>
          )}

          {/* Main Content - Stretched to fill remaining space */}
          <div className="flex-1 min-w-0 flex flex-col px-4">
=======
          </div>

          {/* Main Content - Stretched to fill remaining space */}
          <div className="flex-1 min-w-0 flex flex-col">
>>>>>>> 21d778b56ceb678af8ea9a9eb545faff336aa642
            {activeSection === 'workouts' && <WorkoutsSection />}
            {activeSection === 'progress' && <ProgressSection />}
            {activeSection === 'settings' && <SettingsSection />}
          </div>

          {/* Right Sidebar */}
<<<<<<< HEAD
          {showRightSidebar && (
=======
>>>>>>> 21d778b56ceb678af8ea9a9eb545faff336aa642
          <div className="w-80 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border p-4 h-full flex flex-col">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Actions
              </h3>
              
              <div className="space-y-3 flex-1">
<<<<<<< HEAD
                {/* Add Member Button - Only for admin users */}
                {(user?.userType === 'CLUB_TRAINER' || user?.userType === 'TEAM_MANAGER' || user?.userType === 'GROUP_ADMIN' || user?.userType === 'COACH') && (
                  <button 
                    onClick={() => setShowAddMemberModal(true)}
                    className="w-full flex items-center justify-between p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group"
                  >
                    <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">Add a Member</span>
                    <Users className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
                  </button>
                )}
                
=======
>>>>>>> 21d778b56ceb678af8ea9a9eb545faff336aa642
                <button className="w-full flex items-center justify-between p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group">
                  <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">Add New Workout</span>
                  <Plus className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
                </button>
                
                <button className="w-full flex items-center justify-between p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-green-300 hover:bg-green-50 transition-all duration-200 group">
                  <span className="text-sm font-medium text-gray-700 group-hover:text-green-700">Log Completed Workout</span>
                  <CheckCircle className="w-4 h-4 text-gray-400 group-hover:text-green-500" />
                </button>
              </div>

              {/* Recent Activities */}
              <div className="mt-6">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Recent Activities</h4>
                <div className="space-y-2">
                  <div className="text-xs text-gray-600 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    ✅ Completed Swim workout - 1500m
                  </div>
                  <div className="text-xs text-gray-600 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    📝 Added new running plan for next week
                  </div>
                  <div className="text-xs text-gray-600 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    🎯 Set new personal record in cycling
                  </div>
                </div>
              </div>
            </div>
          </div>
<<<<<<< HEAD
          )}
          
          {/* Add Member Modal */}
          <AddMemberModal
            isOpen={showAddMemberModal}
            onClose={() => setShowAddMemberModal(false)}
            onAddNewUser={(data) => {
              // Handle adding a new user (never registered)
              console.log('Add new user with password:', data);
              // TODO: Call API to add new user with password
              setShowAddMemberModal(false);
            }}
            onAddExistingUser={(data) => {
              // Handle adding existing Movesbook user
              console.log('Add existing user:', data);
              // TODO: Call API to add existing user with username and password
              setShowAddMemberModal(false);
            }}
            entityType={
              user?.userType === 'CLUB_TRAINER' ? 'club' :
              user?.userType === 'TEAM_MANAGER' ? 'team' :
              user?.userType === 'GROUP_ADMIN' ? 'group' :
              user?.userType === 'COACH' ? 'coaching-group' : 'club'
            }
          />
=======
>>>>>>> 21d778b56ceb678af8ea9a9eb545faff336aa642
        </div>
      </div>
    </div>
  );
}

// Sub-components updated for full height
function WorkoutsSection() {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 flex-1 flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">My Workouts</h2>
        <div className="flex space-x-3">
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg">
            Add Workout
          </button>
        </div>
      </div>

      {/* Workout Grid - Full height */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl text-white shadow-lg">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium opacity-90">Current Week</h3>
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

      {/* Recent Workouts List - Takes remaining space */}
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Workouts</h3>
        <div className="space-y-4 h-full overflow-y-auto">
          {[1, 2, 3, 4, 5].map((item) => (
            <div key={item} className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all duration-200">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Dumbbell className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Morning Swim Session #{item}</h4>
                  <p className="text-sm text-gray-500">1500m • 45min • Completed</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">Mon, Dec {10 + item}</p>
                <p className="text-xs text-gray-500">{item} days ago</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProgressSection() {
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
            <Target className="w-16 h-16 mx-auto mb-4 opacity-60" />
            <p className="text-lg font-medium">Goals Overview</p>
            <p className="text-sm mt-2">Track your fitness goals</p>
          </div>
        </div>
      </div>
<<<<<<< HEAD
      <SimpleFooter />
=======
>>>>>>> 21d778b56ceb678af8ea9a9eb545faff336aa642
    </div>
  );
}

function SettingsSection() {
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
        <div className="p-6 border-2 border-gray-200 rounded-xl hover:border-purple-300 transition-all duration-200">
          <h3 className="font-semibold text-gray-900 mb-3 text-lg">Notification Settings</h3>
          <p className="text-gray-600">Configure how and when you receive notifications</p>
        </div>
      </div>
    </div>
  );
}