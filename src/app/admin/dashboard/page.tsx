'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ModernNavbar from '@/components/ModernNavbar';
import ModernFooter from '@/components/ModernFooter';
import { 
  Users, 
  Activity, 
  DollarSign, 
  TrendingUp,
  Settings,
  LogOut,
  Shield
} from 'lucide-react';

export default function AdminDashboard() {
  const [adminUser, setAdminUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    // Check if admin is logged in
    const adminData = localStorage.getItem('adminUser');
    if (!adminData) {
      router.push('/admin/login');
      return;
    }
    setAdminUser(JSON.parse(adminData));
  }, [router]);

  if (!adminUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  const stats = [
    { icon: Users, label: 'Total Users', value: '2,847', change: '+12%' },
    { icon: Activity, label: 'Active Workouts', value: '156', change: '+8%' },
    { icon: DollarSign, label: 'Revenue', value: '$24.7K', change: '+23%' },
    { icon: TrendingUp, label: 'Growth', value: '89%', change: '+5%' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <ModernNavbar />
      
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <Shield className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                <p className="text-purple-100">Welcome back, {adminUser.name}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-green-500 text-sm font-semibold bg-green-50 px-2 py-1 rounded-full">
                    {stat.change}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                <p className="text-gray-600 text-sm">{stat.label}</p>
              </div>
            );
          })}
        </div>

        {/* Admin Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: Users, title: 'User Management', description: 'Manage all users, coaches, and teams', color: 'from-purple-500 to-pink-500' },
            { icon: Activity, title: 'Workout Analytics', description: 'View system-wide workout statistics', color: 'from-blue-500 to-cyan-500' },
            { icon: Settings, title: 'System Settings', description: 'Configure platform settings and features', color: 'from-green-500 to-teal-500' },
            { icon: DollarSign, title: 'Billing & Payments', description: 'Manage subscriptions and payments', color: 'from-orange-500 to-red-500' },
            { icon: Shield, title: 'Security', description: 'Monitor security and access controls', color: 'from-indigo-500 to-purple-500' },
            { icon: TrendingUp, title: 'Reports', description: 'Generate and view system reports', color: 'from-yellow-500 to-orange-500' },
          ].map((action, index) => {
            const Icon = action.icon;
            return (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group cursor-pointer">
                <div className={`w-16 h-16 bg-gradient-to-br ${action.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{action.title}</h3>
                <p className="text-gray-600">{action.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      <ModernFooter />
    </div>
  );
}