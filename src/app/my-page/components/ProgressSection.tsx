import { BarChart3, Target } from 'lucide-react';

export default function ProgressSection() {
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
    </div>
  );
}

