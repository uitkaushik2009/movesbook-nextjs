'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  Dumbbell,
  BarChart3,
  Calendar,
  Settings,
  Eye,
  EyeOff,
  UserCircle,
  Plus,
  Target,
  TrendingUp,
  ChevronRight,
  ChevronDown,
  Building2,
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
import { useLanguage } from '@/contexts/LanguageContext';

export default function ClubDashboard() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { t } = useLanguage();

  // All useState hooks must be declared before any early returns
  const [showAdBanner, setShowAdBanner] = useState(true);
  const [showPersonalBanner, setShowPersonalBanner] = useState(true);
  const [showLeftSidebar, setShowLeftSidebar] = useState(true);
  const [showRightSidebar, setShowRightSidebar] = useState(true);
  const [showToolbar, setShowToolbar] = useState(true);
  const [clubs, setClubs] = useState<any[]>([]);
  const [selectedClubId, setSelectedClubId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'my-page' | 'my-entity'>('my-page');
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [activeRightTab, setActiveRightTab] = useState<'actions-planner' | 'chat-panel'>('actions-planner');
  const [expandedActionsPlanner, setExpandedActionsPlanner] = useState(true);

  // All function definitions and useEffect hooks must also be before any early returns
  const loadClubs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/clubs/my-clubs', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setClubs(data.clubs || []);
      }
    } catch (error) {
      console.error('Error loading clubs:', error);
    }
  };

  const handleClubSelect = (clubId: string) => {
    localStorage.setItem('selectedClub', clubId);
    window.location.href = `/my-club?clubId=${clubId}`;
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('selectedClub');
      if (saved) setSelectedClubId(saved);
    }
  }, []);

  useEffect(() => {
    if (user && user.userType !== 'CLUB_TRAINER') {
      router.push('/my-page');
    }
  }, [user, router]);

  useEffect(() => {
    if (user && user.userType === 'CLUB_TRAINER') {
      loadClubs();
    }
  }, [user]);

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  // Don't render if not authenticated
  if (loading || !user) {
    return null;
  }

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
                entities={clubs}
                selectedEntityId={selectedClubId}
                onEntitySelect={handleClubSelect}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                onMyPageClick={() => setActiveTab('my-page')}
                onMyClubClick={() => {
                  setActiveTab('my-entity');
                  if (selectedClubId) {
                    window.location.href = `/my-club?clubId=${selectedClubId}`;
                  } else if (clubs.length > 0) {
                    window.location.href = `/my-club?clubId=${clubs[0].id}`;
                  }
                }}
              />
            </div>
          )}

          <div className="flex-1 min-w-0 flex flex-col px-4">
            {activeTab === 'my-page' ? (
              <div className="bg-white rounded-lg shadow-sm border p-6 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Club Management Dashboard</h2>
                  <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-all duration-200">
                    Create New Club
                  </button>
                </div>

                {clubs.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <Building2 className="w-20 h-20 mx-auto mb-6 opacity-60" />
                      <p className="text-2xl font-bold mb-2">No Clubs Yet</p>
                      <p className="text-lg mb-4">Create your first club to start managing members</p>
                      <button className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700">
                        Create Club
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {clubs.map((club) => (
                      <div
                        key={club.id}
                        onClick={() => handleClubSelect(club.id)}
                        className="p-6 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all duration-300 cursor-pointer"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl flex items-center justify-center">
                            <Building2 className="w-6 h-6 text-white" />
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        </div>
                        <h3 className="font-bold text-gray-900 text-lg mb-2">{club.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">{club.description || 'Club'}</p>
                        {club.location && <p className="text-xs text-gray-500 mb-4">{club.location}</p>}
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">{club.memberCount || 0} members</span>
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">Active</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border p-6 flex-1 flex flex-col">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">My Club Content</h2>
                <p className="text-gray-600">Select a club from the sidebar to view details.</p>
              </div>
            )}
          </div>

          {showRightSidebar && (
            <div className="w-80 flex-shrink-0">
              <div className="bg-white rounded-lg shadow-sm border p-4 h-full flex flex-col">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button 
                    onClick={() => setShowAddMemberModal(true)}
                    className="w-full flex items-center justify-between p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group"
                  >
                    <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">Add a Member</span>
                    <Users className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
                  </button>
                  <button className="w-full flex items-center justify-between p-4 border-2 border-dashed border-green-200 rounded-xl hover:border-green-300 hover:bg-green-50 transition-all duration-200 group">
                    <span className="text-sm font-medium text-gray-700 group-hover:text-green-700">Club Workout Plan</span>
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
          
          {/* Add Member Modal */}
          <AddMemberModal
            isOpen={showAddMemberModal}
            onClose={() => setShowAddMemberModal(false)}
            onAddNewUser={(data) => {
              console.log('Add new user with password:', data);
              // TODO: Call API to add new user with password
              setShowAddMemberModal(false);
            }}
            onAddExistingUser={(data) => {
              console.log('Add existing user:', data);
              // TODO: Call API to add existing user with username and password
              setShowAddMemberModal(false);
            }}
            entityType="club"
          />
        </div>
      </div>
      <SimpleFooter />
    </div>
  );
}

