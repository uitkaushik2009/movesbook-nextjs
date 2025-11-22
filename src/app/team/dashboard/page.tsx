'use client';

import { useState } from 'react';
import AdvertisementCarousel from '@/components/AdvertisementCarousel';
import ModernNavbar from '@/components/ModernNavbar';
import DarkSidebar from '@/components/DarkSidebar';
import SimpleFooter from '@/components/SimpleFooter';
import AddMemberModal from '@/components/AddMemberModal';
import DisplayOptionsToolbar from '@/app/my-page/components/DisplayOptionsToolbar';
import PersonalBanner from '@/app/my-page/components/PersonalBanner';
import RightSidebar from '@/components/dashboard/RightSidebar';
import TeamGrid from './components/TeamGrid';
import { useTeamDashboard } from './hooks/useTeamDashboard';

export default function TeamDashboard() {
  const {
    user,
    loading,
    teams,
    selectedTeamId,
    activeTab,
    setActiveTab,
    handleTeamSelect
  } = useTeamDashboard();

  const [showAdBanner, setShowAdBanner] = useState(true);
  const [showPersonalBanner, setShowPersonalBanner] = useState(true);
  const [showLeftSidebar, setShowLeftSidebar] = useState(true);
  const [showRightSidebar, setShowRightSidebar] = useState(true);
  const [showToolbar, setShowToolbar] = useState(true);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);

  // Don't render if not authenticated
  if (loading || !user) {
    return null;
  }

  return (
    <div className="bg-gray-50 flex flex-col" style={{ minHeight: '100vh' }}>
      <ModernNavbar />

      <DisplayOptionsToolbar
        showAdBanner={showAdBanner}
        showPersonalBanner={showPersonalBanner}
        showLeftSidebar={showLeftSidebar}
        showRightSidebar={showRightSidebar}
        showToolbar={showToolbar}
        onToggleAdBanner={setShowAdBanner}
        onTogglePersonalBanner={setShowPersonalBanner}
        onToggleLeftSidebar={setShowLeftSidebar}
        onToggleRightSidebar={setShowRightSidebar}
        onToggleToolbar={setShowToolbar}
      />

      <div className="flex-1 flex flex-col w-full py-6">
        {showAdBanner && (
          <div className="mb-6 flex-shrink-0 px-4">
            <AdvertisementCarousel />
          </div>
        )}

        {showPersonalBanner && <PersonalBanner user={user} />}

        <div className="flex-1 flex gap-0">
          {showLeftSidebar && (
            <div className="w-80 flex-shrink-0 sticky top-0 self-start">
              <DarkSidebar
                userType={user?.userType || ''}
                entities={teams}
                selectedEntityId={selectedTeamId}
                onEntitySelect={handleTeamSelect}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                onMyPageClick={() => setActiveTab('my-page')}
                onMyTeamClick={() => {
                  setActiveTab('my-entity');
                  if (selectedTeamId) {
                    window.location.href = `/my-team?teamId=${selectedTeamId}`;
                  } else if (teams.length > 0) {
                    window.location.href = `/my-team?teamId=${teams[0].id}`;
                  }
                }}
              />
            </div>
          )}

          <div className="flex-1 min-w-0 flex flex-col px-4">
            <TeamGrid
              teams={teams}
              onTeamSelect={handleTeamSelect}
              onCreateTeam={() => console.log('Create team')}
            />
          </div>

          {showRightSidebar && (
            <RightSidebar
              onAddMember={() => setShowAddMemberModal(true)}
              workoutPlanLabel="Team Workout Plan"
            />
          )}
          
          <AddMemberModal
            isOpen={showAddMemberModal}
            onClose={() => setShowAddMemberModal(false)}
            onAddNewUser={(data) => {
              console.log('Add new user with password:', data);
              setShowAddMemberModal(false);
            }}
            onAddExistingUser={(data) => {
              console.log('Add existing user:', data);
              setShowAddMemberModal(false);
            }}
            entityType="team"
          />
        </div>
      </div>
      <SimpleFooter />
    </div>
  );
}

