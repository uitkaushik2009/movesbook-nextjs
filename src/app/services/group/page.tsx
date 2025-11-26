import ModernNavbar from '@/components/ModernNavbar';
import ModernFooter from '@/components/ModernFooter';
import Link from 'next/link';

export default function GroupTrainingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-cyan-50">
      <ModernNavbar />
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-white rounded-2xl shadow-xl p-12">
            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Group Training</h1>
            <p className="text-lg text-gray-600 mb-8">
              Join group training sessions - coming soon to help you train with others.
            </p>
            <Link href="/services" className="text-cyan-600 hover:text-cyan-700 font-semibold">
              ← Back to Services
            </Link>
          </div>
        </div>
      </div>
      <ModernFooter />
    </div>
  );
}

