'use client';

import { useState } from 'react';
import { 
  Home,
  Users,
  Building2,
  Trophy,
  Settings,
  Bell,
  Mail,
  Clock,
  Music,
  LayoutDashboard,
  ChevronDown,
  Plus,
  UserCircle,
  Eye,
  EyeOff,
  Twitter,
  Facebook,
  MessageSquare,
  ArrowLeft,
  ArrowRight,
  FileText,
  Newspaper,
  Link as LinkIcon,
  Package,
  Users2,
  Mailbox,
  UserPlus,
  Search
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';

interface DarkSidebarProps {
  userType: string;
  entities?: any[];
  selectedEntityId?: string | null;
  onEntitySelect?: (id: string) => void;
  onMyPageClick?: () => void;
  onMyClubClick?: () => void;
  onMyTeamClick?: () => void;
  onMyGroupClick?: () => void;
  onMyCoachingGroupClick?: () => void;
  activeTab?: 'my-page' | 'my-entity';
  onTabChange?: (tab: 'my-page' | 'my-entity') => void;
}

export default function DarkSidebar({
  userType,
  entities = [],
  selectedEntityId,
  onEntitySelect,
  onMyPageClick,
  onMyClubClick,
  onMyTeamClick,
  onMyGroupClick,
  onMyCoachingGroupClick,
  activeTab = 'my-page',
  onTabChange
}: DarkSidebarProps) {
  const { user } = useAuth();
  const router = useRouter();
  const { t } = useLanguage();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    clubAdminInfo: false,
    myClubs: false,
    myClub: false,
    mainToolbar: false,
    notifications: false,
    messages: false,
    bookings: false,
    music: false,
    myDashboard: false,
    friends: false
  });
  const [allowVisiting, setAllowVisiting] = useState(true);
  const [internalActiveTab, setInternalActiveTab] = useState<'my-page' | 'my-entity'>(activeTab);

  // Sync internal state with prop
  const currentTab = onTabChange ? activeTab : internalActiveTab;
  const setCurrentTab = onTabChange ? onTabChange : setInternalActiveTab;

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleMyPage = () => {
    router.push('/privacy');
  };

  const handleMyClub = () => {
    router.push('/privacy');
  };

  const handleMyTeam = () => {
    if (onMyTeamClick) {
      onMyTeamClick();
    } else if (selectedEntityId) {
      router.push(`/my-team?teamId=${selectedEntityId}`);
    } else if (entities.length > 0) {
      router.push(`/my-team?teamId=${entities[0].id}`);
    } else {
      router.push('/my-page');
    }
  };

  const handleMyGroup = () => {
    if (onMyGroupClick) {
      onMyGroupClick();
    } else if (selectedEntityId) {
      router.push(`/my-group?groupId=${selectedEntityId}`);
    } else if (entities.length > 0) {
      router.push(`/my-group?groupId=${entities[0].id}`);
    } else {
      router.push('/my-page');
    }
  };

  const handleMyCoachingGroup = () => {
    if (onMyCoachingGroupClick) {
      onMyCoachingGroupClick();
    } else if (selectedEntityId) {
      router.push(`/my-coaching-group?groupId=${selectedEntityId}`);
    } else if (entities.length > 0) {
      router.push(`/my-coaching-group?groupId=${entities[0].id}`);
    } else {
      router.push('/my-page');
    }
  };

  const handleMyPageTab = () => {
    setCurrentTab('my-page');
    if (onMyPageClick) {
      onMyPageClick();
    } else {
      router.push('/my-page');
    }
  };

  const handleMyEntityTab = () => {
    setCurrentTab('my-entity');
    if (userType === 'CLUB_TRAINER' && onMyClubClick) {
      onMyClubClick();
    } else if (userType === 'TEAM_MANAGER' && onMyTeamClick) {
      onMyTeamClick();
    } else if (userType === 'GROUP_ADMIN' && onMyGroupClick) {
      onMyGroupClick();
    } else if (userType === 'COACH' && onMyCoachingGroupClick) {
      onMyCoachingGroupClick();
    } else {
      // Default behavior - navigate to my-page
      router.push('/my-page');
    }
  };

  const getEntityLabel = () => {
    if (userType === 'CLUB_TRAINER') return t('sidebar_my_club');
    if (userType === 'TEAM_MANAGER') return t('sidebar_my_team');
    if (userType === 'GROUP_ADMIN') return t('sidebar_my_group');
    if (userType === 'COACH') return t('sidebar_my_coaching_group');
    // For athletes and other users, show "My Club" as default
    return t('sidebar_my_club');
  };

  return (
    <div className="w-full h-full bg-gray-900 text-white flex flex-col overflow-hidden" style={{ width: '320px' }}>
      {/* Tab Navigation - Always show both buttons */}
      <div className="flex bg-gray-900 border-b border-gray-700 flex-shrink-0">
        <button
          onClick={handleMyPageTab}
          className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
            currentTab === 'my-page'
              ? 'bg-gray-700 text-white border-b-2 border-yellow-400'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-750 hover:text-white'
          }`}
        >
          {t('sidebar_my_page')}
        </button>
        <button
          onClick={handleMyEntityTab}
          className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
            currentTab === 'my-entity'
              ? 'bg-gray-700 text-white border-b-2 border-yellow-400'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-750 hover:text-white'
          }`}
        >
          {getEntityLabel()}
        </button>
      </div>

      {/* Top Section - User Profile - No Scroll, Optimized */}
      <div className="bg-gray-800 p-3 flex-shrink-0">
        {/* Header Bar - Compact */}
        <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-700">
          <button className="text-white hover:text-yellow-400 transition-colors">
            <Plus className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-1.5">
            <span className="text-xs">{t('sidebar_status')}</span>
            <span className="text-xs text-green-400">{t('sidebar_online')}</span>
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
          </div>
          <button className="text-gray-400 hover:text-white transition-colors">
            <Settings className="w-4 h-4" />
          </button>
        </div>

        {/* Profile Identity - Compact */}
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
            <UserCircle className="w-5 h-5 text-gray-400" />
          </div>
          <span className="text-white text-sm font-medium truncate">{user?.name || 'User'}</span>
        </div>

        {/* Profile Picture - Smaller */}
        <div className="mb-2">
          <div className="w-20 h-20 bg-gray-700 rounded-lg mb-1 flex items-center justify-center">
            <UserCircle className="w-12 h-12 text-gray-500" />
          </div>
          <button className="text-white text-xs hover:text-yellow-400 transition-colors">
            {t('sidebar_change_photo')}
          </button>
        </div>

        {/* User Details - Compact Single Line */}
        <div className="space-y-1 mb-2 text-xs">
          <div className="flex items-center gap-1">
            <span className="text-gray-300">{t('sidebar_username')}:</span>
            <span className="text-yellow-400">{user?.username || 'N/A'}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-gray-300">{t('sidebar_age')}:</span>
            <span className="text-yellow-400">32</span>
            <span className="text-gray-300 ml-1">•</span>
            <span className="text-gray-300">American football</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-gray-300">{t('sidebar_city')}:</span>
            <span className="text-yellow-400">Turku</span>
            <span className="text-gray-300 ml-1">•</span>
            <span className="text-gray-300">Finland</span>
          </div>
        </div>

        {/* Privacy Setting - Compact */}
        <div className="flex items-center gap-1.5 mb-2">
          <input
            type="checkbox"
            checked={allowVisiting}
            onChange={(e) => setAllowVisiting(e.target.checked)}
            className="w-3 h-3 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
          />
          <span className="text-white text-xs">{t('sidebar_allow_visiting')}</span>
        </div>

        {/* Most used buttons - Compact */}
        <button className="w-full bg-red-600 hover:bg-red-700 text-white py-1.5 px-2 rounded mb-2 flex items-center justify-between transition-colors text-xs">
          <span>{t('sidebar_most_used_buttons')}</span>
          <Settings className="w-3 h-3" />
        </button>

        {/* Visitor Tracking - Compact */}
        <div className="space-y-1 mb-2">
          <div className="flex items-center gap-1.5 text-white text-xs">
            <UserCircle className="w-3 h-3 text-gray-400" />
            <ArrowLeft className="w-3 h-3 text-gray-400" />
            <span className="truncate">{t('sidebar_users_visited_my_pages')}</span>
          </div>
          <div className="flex items-center gap-1.5 text-white text-xs">
            <span>{t('sidebar_users_visited')}</span>
            <ArrowRight className="w-3 h-3 text-gray-400" />
            <UserCircle className="w-3 h-3 text-gray-400" />
          </div>
        </div>

        {/* Social Network Integration - Compact */}
        <div className="mb-2">
          <span className="text-white text-xs block mb-1">{t('sidebar_social_networks')}</span>
          <div className="flex items-center gap-2">
            <button className="text-blue-400 hover:text-blue-300 transition-colors">
              <Twitter className="w-4 h-4" />
            </button>
            <button className="text-blue-500 hover:text-blue-400 transition-colors">
              <Facebook className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Comments Section - Compact */}
        <div className="text-gray-500 text-xs">{t('sidebar_comments')}</div>
      </div>

      {/* Bottom Section - Navigation Menu */}
      <div className="bg-teal-900 flex-1 min-h-0" style={{ overflowY: 'visible', maxHeight: 'none' }}>
        {/* Conditional Menu Based on Active Tab */}
        {currentTab === 'my-page' ? (
          <>
            {/* My Page Menu Items */}
            <button className="w-full bg-teal-800 hover:bg-teal-700 text-white py-3 px-4 flex items-center justify-between transition-colors border-b border-teal-700">
              <div className="flex items-center gap-3">
                <Home className="w-5 h-5" />
                <span>{t('sidebar_dashboard')}</span>
              </div>
            </button>
          </>
        ) : (
          <>
            {/* My Club/Team/Group Menu Items */}
            {userType === 'CLUB_TRAINER' && (
              <>
                <button className="w-full bg-teal-800 hover:bg-teal-700 text-white py-3 px-4 flex items-center justify-between transition-colors border-b border-teal-700">
                  <div className="flex items-center gap-3">
                    <Building2 className="w-5 h-5" />
                    <span>{t('sidebar_club_management')}</span>
                  </div>
                </button>
                <button className="w-full bg-teal-800 hover:bg-teal-700 text-white py-3 px-4 flex items-center justify-between transition-colors border-b border-teal-700">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5" />
                    <span>{t('sidebar_members')}</span>
                  </div>
                </button>
              </>
            )}

            {userType === 'TEAM_MANAGER' && (
              <>
                <button className="w-full bg-teal-800 hover:bg-teal-700 text-white py-3 px-4 flex items-center justify-between transition-colors border-b border-teal-700">
                  <div className="flex items-center gap-3">
                    <Trophy className="w-5 h-5" />
                    <span>Team Management</span>
                  </div>
                </button>
                <button className="w-full bg-teal-800 hover:bg-teal-700 text-white py-3 px-4 flex items-center justify-between transition-colors border-b border-teal-700">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5" />
                    <span>Athletes</span>
                  </div>
                </button>
              </>
            )}

            {userType === 'GROUP_ADMIN' && (
              <>
                <button className="w-full bg-teal-800 hover:bg-teal-700 text-white py-3 px-4 flex items-center justify-between transition-colors border-b border-teal-700">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5" />
                    <span>Group Management</span>
                  </div>
                </button>
                <button className="w-full bg-teal-800 hover:bg-teal-700 text-white py-3 px-4 flex items-center justify-between transition-colors border-b border-teal-700">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5" />
                    <span>Members</span>
                  </div>
                </button>
              </>
            )}

            {userType === 'COACH' && (
              <>
                <button className="w-full bg-teal-800 hover:bg-teal-700 text-white py-3 px-4 flex items-center justify-between transition-colors border-b border-teal-700">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5" />
                    <span>Athlete Management</span>
                  </div>
                </button>
                <button className="w-full bg-teal-800 hover:bg-teal-700 text-white py-3 px-4 flex items-center justify-between transition-colors border-b border-teal-700">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5" />
                    <span>Athletes</span>
                  </div>
                </button>
              </>
            )}
          </>
        )}

        {/* Club admin info */}
        {userType === 'CLUB_TRAINER' && (
          <button
            onClick={() => toggleSection('clubAdminInfo')}
            className="w-full bg-teal-800 hover:bg-teal-700 text-white py-3 px-4 flex items-center justify-between transition-colors border-b border-teal-700"
          >
            <span>Club admin info</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.clubAdminInfo ? 'rotate-180' : ''}`} />
          </button>
        )}

        {/* My page for visitors */}
        <button className="w-full bg-teal-800 hover:bg-teal-700 text-white py-3 px-4 flex items-center justify-between transition-colors border-b border-teal-700">
          <span>{t('sidebar_my_page_visitors')}</span>
          <ChevronDown className="w-4 h-4" />
        </button>

        {/* My Club - Expandable for all users */}
        <button
          onClick={() => toggleSection('myClub')}
          className="w-full bg-teal-800 hover:bg-teal-700 text-white py-3 px-4 flex items-center justify-between transition-colors border-b border-teal-700"
        >
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5" />
            <span>My Club</span>
          </div>
          <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.myClub ? 'rotate-180' : ''}`} />
        </button>
        
        {/* Expanded My Club Submenu - Two submenus */}
        {expandedSections.myClub && (
          <div className="bg-gray-800 border-t border-gray-700">
            {/* First submenu - username (full name) Admin */}
            <button
              onClick={() => entities.length > 0 && onEntitySelect && onEntitySelect(entities[0].id)}
              className={`w-full text-left py-2.5 px-8 text-sm hover:bg-gray-700 transition-colors ${
                entities.length > 0 && selectedEntityId === entities[0].id ? 'bg-gray-700 border-l-2 border-yellow-400' : ''
              }`}
            >
              {entities.length > 0 && entities[0].admin ? (
                <>
                  <span className="text-white">{entities[0].admin.username}</span>
                  <span className="text-white"> ({entities[0].admin.name})</span>
                  <span className="text-yellow-400">Admin</span>
                </>
              ) : (
                <>
                  <span className="text-white">{user?.username || 'username'} ({user?.name || 'full name'})</span>
                  <span className="text-yellow-400">Admin</span>
                </>
              )}
            </button>
            {/* Second submenu - username (full name) Admin */}
            <button
              onClick={() => entities.length > 1 && onEntitySelect && onEntitySelect(entities[1].id)}
              className={`w-full text-left py-2.5 px-8 text-sm hover:bg-gray-700 transition-colors ${
                entities.length > 1 && selectedEntityId === entities[1].id ? 'bg-gray-700 border-l-2 border-yellow-400' : ''
              }`}
            >
              {entities.length > 1 && entities[1].admin ? (
                <>
                  <span className="text-white">{entities[1].admin.username}</span>
                  <span className="text-white"> ({entities[1].admin.name})</span>
                  <span className="text-yellow-400">Admin</span>
                </>
              ) : (
                <>
                  <span className="text-white">{user?.username || 'username'} ({user?.name || 'full name'})</span>
                  <span className="text-yellow-400">Admin</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* My clubs - Keep for other user types (teams, groups, coaching groups) */}
        {userType !== 'CLUB_TRAINER' && entities.length > 0 && (
          <button
            onClick={() => toggleSection('myClubs')}
            className="w-full bg-teal-800 hover:bg-teal-700 text-white py-3 px-4 flex items-center justify-between transition-colors border-b border-teal-700"
          >
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5" />
              <span>My {userType === 'TEAM_MANAGER' ? 'teams' : userType === 'GROUP_ADMIN' ? 'groups' : 'coaching groups'}</span>
            </div>
            <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.myClubs ? 'rotate-180' : ''}`} />
          </button>
        )}

        {/* Main Toolbar */}
        <button
          onClick={() => toggleSection('mainToolbar')}
          className="w-full bg-teal-800 hover:bg-teal-700 text-white py-3 px-4 flex items-center justify-between transition-colors border-b border-teal-700"
        >
          <div className="flex items-center gap-3">
            <LayoutDashboard className="w-5 h-5" />
            <span>{t('sidebar_main_toolbar')}</span>
          </div>
          <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.mainToolbar ? 'rotate-180' : ''}`} />
        </button>

        {/* Notifications */}
        <button
          onClick={() => toggleSection('notifications')}
          className="w-full bg-teal-800 hover:bg-teal-700 text-white py-3 px-4 flex items-center justify-between transition-colors border-b border-teal-700"
        >
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5" />
            <span>Notifications(0)</span>
          </div>
          <div className="flex items-center gap-2">
            <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.notifications ? 'rotate-180' : ''}`} />
            <Settings className="w-4 h-4 text-gray-400" />
          </div>
        </button>

        {/* By movesbook staff */}
        <button className="w-full bg-teal-800 hover:bg-teal-700 text-white py-3 px-4 flex items-center justify-between transition-colors border-b border-teal-700">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5" />
            <span>{t('sidebar_by_staff')}(0)</span>
          </div>
        </button>

        {/* Messages */}
        <button
          onClick={() => toggleSection('messages')}
          className="w-full bg-teal-800 hover:bg-teal-700 text-white py-3 px-4 flex items-center justify-between transition-colors border-b border-teal-700"
        >
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5" />
            <span>Messages</span>
          </div>
          <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.messages ? 'rotate-180' : ''}`} />
        </button>

        {/* My bookings */}
        <button
          onClick={() => toggleSection('bookings')}
          className="w-full bg-teal-800 hover:bg-teal-700 text-white py-3 px-4 flex items-center justify-between transition-colors border-b border-teal-700"
        >
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5" />
            <span>{t('sidebar_my_bookings')}</span>
          </div>
          <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.bookings ? 'rotate-180' : ''}`} />
        </button>

        {/* My Music */}
        <button
          onClick={() => toggleSection('music')}
          className="w-full bg-teal-800 hover:bg-teal-700 text-white py-3 px-4 flex items-center justify-between transition-colors border-b border-teal-700"
        >
          <div className="flex items-center gap-3">
            <Music className="w-5 h-5" />
            <span>{t('sidebar_my_music')}</span>
          </div>
          <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.music ? 'rotate-180' : ''}`} />
        </button>

        {/* My Dashboard */}
        <button className="w-full bg-teal-800 hover:bg-teal-700 text-white py-3 px-4 flex items-center justify-between transition-colors border-b border-teal-700">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="w-5 h-5" />
            <span>{t('sidebar_my_dashboard_menu')}</span>
          </div>
        </button>

        {/* Posts */}
        <button className="w-full bg-teal-800 hover:bg-teal-700 text-white py-3 px-4 flex items-center justify-between transition-colors border-b border-teal-700">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5" />
            <span>{t('sidebar_posts')}</span>
          </div>
        </button>

        {/* News */}
        <button className="w-full bg-teal-800 hover:bg-teal-700 text-white py-3 px-4 flex items-center justify-between transition-colors border-b border-teal-700">
          <div className="flex items-center gap-3">
            <Newspaper className="w-5 h-5" />
            <span>{t('sidebar_news')}</span>
          </div>
        </button>

        {/* Internet links */}
        <button className="w-full bg-teal-800 hover:bg-teal-700 text-white py-3 px-4 flex items-center justify-between transition-colors border-b border-teal-700">
          <div className="flex items-center gap-3">
            <LinkIcon className="w-5 h-5" />
            <span>{t('sidebar_internet_links')}</span>
          </div>
        </button>

        {/* Other Item */}
        <button className="w-full bg-teal-800 hover:bg-teal-700 text-white py-3 px-4 flex items-center justify-between transition-colors border-b border-teal-700">
          <div className="flex items-center gap-3">
            <Package className="w-5 h-5" />
            <span>{t('sidebar_other_item')}</span>
          </div>
        </button>

        {/* Communities */}
        <button className="w-full bg-teal-800 hover:bg-teal-700 text-white py-3 px-4 flex items-center justify-between transition-colors border-b border-teal-700">
          <div className="flex items-center gap-3">
            <Users2 className="w-5 h-5" />
            <span>{t('sidebar_communities')}</span>
          </div>
        </button>

        {/* FRIENDS - Expandable */}
        <button
          onClick={() => toggleSection('friends')}
          className="w-full bg-teal-800 hover:bg-teal-700 text-white py-3 px-4 flex items-center justify-between transition-colors border-b border-teal-700"
        >
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5" />
            <span>{t('sidebar_friends')}</span>
          </div>
          <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.friends ? 'rotate-180' : ''}`} />
        </button>

        {/* Expanded FRIENDS Submenu */}
        {expandedSections.friends && (
          <div className="bg-teal-950 border-t border-teal-800">
            <button className="w-full text-left py-2 px-8 text-sm text-gray-200 hover:bg-teal-900 transition-colors flex items-center gap-2">
              <Search className="w-4 h-4" />
              <span>friend search box</span>
            </button>
            <button className="w-full text-left py-2 px-8 text-sm text-gray-200 hover:bg-teal-900 transition-colors flex items-center gap-2">
              <Mailbox className="w-4 h-4" />
              <span>friend mail box</span>
            </button>
            <button className="w-full text-left py-2 px-8 text-sm text-gray-200 hover:bg-teal-900 transition-colors flex items-center gap-2">
              <UserCircle className="w-4 h-4" />
              <span>friend profile box</span>
            </button>
            <button className="w-full text-left py-2 px-8 text-sm text-gray-200 hover:bg-teal-900 transition-colors flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              <span>Find New Friends box</span>
            </button>
          </div>
        )}

        {/* Expanded sections content */}
        {expandedSections.myClubs && entities.length > 0 && (
          <div className="bg-teal-950 border-t border-teal-800">
            {entities.map((entity) => (
              <button
                key={entity.id}
                onClick={() => onEntitySelect && onEntitySelect(entity.id)}
                className="w-full text-left py-2 px-8 text-sm text-gray-200 hover:bg-teal-900 transition-colors"
              >
                {entity.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

