export default function SettingsSection() {
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

