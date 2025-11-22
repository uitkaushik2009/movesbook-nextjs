import { Users, Plus, CheckCircle } from 'lucide-react';

interface RightSidebarProps {
  user: any;
  onAddMemberClick: () => void;
}

export default function RightSidebar({ user, onAddMemberClick }: RightSidebarProps) {
  return (
    <div className="w-80 flex-shrink-0">
      <div className="bg-white rounded-lg shadow-sm border p-4 h-full flex flex-col">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Actions
        </h3>
        
        <div className="space-y-3 flex-1">
          {/* Add Member Button - Only for admin users */}
          {(user?.userType === 'CLUB_TRAINER' || user?.userType === 'TEAM_MANAGER' || user?.userType === 'GROUP_ADMIN' || user?.userType === 'COACH') && (
            <button 
              onClick={onAddMemberClick}
              className="w-full flex items-center justify-between p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group"
            >
              <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">Add a Member</span>
              <Users className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
            </button>
          )}
          
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
  );
}

