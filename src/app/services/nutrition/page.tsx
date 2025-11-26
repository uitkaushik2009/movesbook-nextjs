import ModernNavbar from '@/components/ModernNavbar';
import ModernFooter from '@/components/ModernFooter';
import Link from 'next/link';

export default function NutritionPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-cyan-50">
      <ModernNavbar />
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-white rounded-2xl shadow-xl p-12">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Nutrition Planning</h1>
            <p className="text-lg text-gray-600 mb-8">
              Personalized nutrition plans coming soon to help you achieve your fitness goals.
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

