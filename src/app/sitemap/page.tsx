import ModernNavbar from '@/components/ModernNavbar';
import ModernFooter from '@/components/ModernFooter';
import Link from 'next/link';

export default function SitemapPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-cyan-50">
      <ModernNavbar />
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-white rounded-2xl shadow-xl p-12">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Sitemap</h1>
            <p className="text-lg text-gray-600 mb-8">
              Sitemap page coming soon to help you navigate our website.
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

