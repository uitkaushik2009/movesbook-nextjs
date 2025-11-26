import ModernNavbar from '@/components/ModernNavbar';
import ModernFooter from '@/components/ModernFooter';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50">
      <ModernNavbar />
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-12">
            <div className="text-center mb-12">
              <div className="w-24 h-24 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-4xl font-bold text-gray-800 mb-4">About Movesbook</h1>
              <p className="text-xl text-gray-600">
                Your Complete Workout Management Platform
              </p>
            </div>

            <div className="space-y-6 text-gray-700">
              <section>
                <h2 className="text-2xl font-semibold text-gray-800 mb-3">Our Mission</h2>
                <p className="leading-relaxed">
                  Movesbook is dedicated to helping athletes, coaches, teams, and clubs manage their fitness journeys 
                  with powerful workout planning, tracking, and collaboration tools.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-800 mb-3">What We Offer</h2>
                <ul className="space-y-2 list-disc list-inside">
                  <li>Comprehensive workout planning and management</li>
                  <li>Multi-sport support (Swimming, Cycling, Running, and more)</li>
                  <li>Team and group collaboration features</li>
                  <li>Coach-athlete relationship management</li>
                  <li>Performance tracking and analytics</li>
                  <li>Multi-language support for global reach</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-800 mb-3">Our Vision</h2>
                <p className="leading-relaxed">
                  We envision a world where fitness management is seamless, collaborative, and accessible to everyone, 
                  from individual athletes to professional sports organizations.
                </p>
              </section>
            </div>

            <div className="mt-12 text-center">
              <Link 
                href="/"
                className="inline-block bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
      <ModernFooter />
    </div>
  );
}

