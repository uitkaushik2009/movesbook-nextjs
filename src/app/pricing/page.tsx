import ModernNavbar from '@/components/ModernNavbar';
import ModernFooter from '@/components/ModernFooter';
import Link from 'next/link';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-cyan-50">
      <ModernNavbar />
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-white rounded-2xl shadow-xl p-12">
            <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Pricing Plans</h1>
            <p className="text-lg text-gray-600 mb-8">
              Flexible pricing options coming soon. Stay tuned for our competitive plans!
            </p>
            <Link href="/" className="inline-block bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
      <ModernFooter />
    </div>
  );
}

