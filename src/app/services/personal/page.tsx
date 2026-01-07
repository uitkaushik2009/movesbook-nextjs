import ModernNavbar from '@/components/ModernNavbar';
import ModernFooter from '@/components/ModernFooter';
import Link from 'next/link';

export default function PersonalPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-cyan-50">
      <ModernNavbar />
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-white rounded-2xl shadow-xl p-12">
            <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Personal Training</h1>
            <p className="text-lg text-gray-600 mb-8">
              Customized personal training programs coming soon just for you.
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

