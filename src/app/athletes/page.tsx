'use client';

import { Trophy } from 'lucide-react';
<<<<<<< HEAD
import ModernNavbar from '@/components/ModernNavbar';
import ModernFooter from '@/components/ModernFooter';

export default function AthletesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col">
      <ModernNavbar />
      <div className="flex-1 py-12 px-4">
=======

export default function AthletesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4">
>>>>>>> 21d778b56ceb678af8ea9a9eb545faff336aa642
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-2xl">
              <Trophy className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent mb-4">
            Athletes
          </h1>
          <p className="text-cyan-200 text-lg">
            Discover talented athletes from around the world
          </p>
        </div>
        
        <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-3xl p-8 border border-cyan-500 border-opacity-30">
          <p className="text-white text-center text-lg">
            Athletes page content coming soon...
          </p>
        </div>
      </div>
<<<<<<< HEAD
      </div>
      <ModernFooter />
=======
>>>>>>> 21d778b56ceb678af8ea9a9eb545faff336aa642
    </div>
  );
}

