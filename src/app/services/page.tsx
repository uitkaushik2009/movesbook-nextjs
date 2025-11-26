import ModernNavbar from '@/components/ModernNavbar';
import ModernFooter from '@/components/ModernFooter';
import Link from 'next/link';

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <ModernNavbar />
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white rounded-2xl shadow-xl p-12">
            <div className="mb-8">
              <div className="w-24 h-24 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h1 className="text-4xl font-bold text-gray-800 mb-4">
                Services Coming Soon
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                We're working hard to bring you amazing services. Stay tuned!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <Link href="/services/nutrition" className="p-4 bg-cyan-50 rounded-lg hover:bg-cyan-100 transition">
                <h3 className="font-semibold text-cyan-800">Nutrition Planning</h3>
              </Link>
              <Link href="/services/coaching" className="p-4 bg-cyan-50 rounded-lg hover:bg-cyan-100 transition">
                <h3 className="font-semibold text-cyan-800">Personal Coaching</h3>
              </Link>
              <Link href="/services/group" className="p-4 bg-cyan-50 rounded-lg hover:bg-cyan-100 transition">
                <h3 className="font-semibold text-cyan-800">Group Training</h3>
              </Link>
              <Link href="/services/workouts" className="p-4 bg-cyan-50 rounded-lg hover:bg-cyan-100 transition">
                <h3 className="font-semibold text-cyan-800">Workout Plans</h3>
              </Link>
            </div>

            <Link 
              href="/"
              className="inline-block bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
      <ModernFooter />
    </div>
  );
}

