import { Trophy, ChevronRight } from 'lucide-react';
import EntityGrid from '@/components/dashboard/EntityGrid';

interface Team {
  id: string;
  name: string;
  description?: string | null;
  sport?: string | null;
  memberCount?: number;
}

interface TeamGridProps {
  teams: Team[];
  onTeamSelect: (id: string) => void;
  onCreateTeam?: () => void;
}

export default function TeamGrid({ teams, onTeamSelect, onCreateTeam }: TeamGridProps) {
  return (
    <EntityGrid
      entities={teams}
      onEntitySelect={onTeamSelect}
      emptyState={{
        icon: Trophy,
        title: 'No Teams Yet',
        description: 'Create your first team to start managing athletes',
        buttonLabel: 'Create Team',
        onButtonClick: onCreateTeam || (() => {})
      }}
      createButtonLabel="Create New Team"
      onCreateClick={onCreateTeam}
      renderEntityCard={(team) => (
        <>
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
          <h3 className="font-bold text-gray-900 text-lg mb-2">{team.name}</h3>
          <p className="text-sm text-gray-600 mb-2">{team.description || 'Team'}</p>
          {team.sport && <p className="text-xs text-gray-500 mb-4">{team.sport}</p>}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">{team.memberCount || 0} athletes</span>
            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">Active</span>
          </div>
        </>
      )}
    />
  );
}

