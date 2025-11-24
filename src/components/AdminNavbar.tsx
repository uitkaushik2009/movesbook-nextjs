'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Home, 
  User, 
  Users, 
  Shield, 
  Search,
  Settings,
  Globe,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import Image from 'next/image';
import { useLanguage } from '@/contexts/LanguageContext';

interface AdminUser {
  id: string;
  email: string;
  name: string;
  userType: string;
}

export default function AdminNavbar() {
  const router = useRouter();
  const { t, currentLanguage, setLanguage, availableLanguages } = useLanguage();
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCategory, setSearchCategory] = useState('All Users');
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [lastLogin, setLastLogin] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const languageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Get admin user from localStorage
    const adminData = localStorage.getItem('adminUser');
    if (adminData) {
      const user = JSON.parse(adminData);
      setAdminUser(user);
      
      // Set last login time
      const now = new Date();
      const loginTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')} ${now.toLocaleDateString('en-US', { month: 'long' })}`;
      const timeAgo = '1 minute ago';
      setLastLogin(`${loginTime}\n${timeAgo}`);
    }
  }, []);

  // Close language dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (languageRef.current && !languageRef.current.contains(event.target as Node)) {
        setShowLanguageDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminUser');
    router.push('/');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Search:', searchQuery, 'in', searchCategory);
  };

  const currentLangDisplay = availableLanguages.find(l => l.code === currentLanguage)?.name || 'English';

  return (
    <div className="w-full">
      {/* Top Red Bar */}
      <div className="bg-gradient-to-r from-red-800 to-red-700 text-white">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            {/* Logo Section */}
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="bg-white px-2 sm:px-3 py-1 sm:py-2 rounded">
                <span className="text-red-800 font-bold text-xs sm:text-sm">Logo</span>
              </div>
              <div>
                <h1 className="text-xl sm:text-3xl font-bold">
                  <span className="text-yellow-400">Moves</span>
                  <span className="text-white">book</span>
                </h1>
                <p className="text-xs text-yellow-200 italic hidden sm:block">The Global Sport Network, Your Sport Network</p>
              </div>
            </div>

            {/* Admin Title */}
            <div className="hidden lg:block">
              <h2 className="text-2xl xl:text-3xl font-bold text-yellow-400">Admin</h2>
            </div>

            {/* User Info Section - Desktop */}
            {adminUser && (
              <div className="hidden md:flex items-center gap-2 lg:gap-4">
                <div className="text-right text-xs lg:text-sm">
                  <p className="font-semibold text-yellow-200 hidden lg:block">Current Operator</p>
                  <p className="font-bold text-sm lg:text-base">{adminUser.name} <span className="text-yellow-400">▼Admin</span></p>
                  <p className="text-xs text-yellow-200 whitespace-pre-line hidden lg:block">{lastLogin}</p>
                </div>
                <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gray-300 rounded border-2 border-white overflow-hidden">
                  {adminUser.name && (
                    <div className="w-full h-full flex items-center justify-center bg-blue-600 text-white text-xl lg:text-2xl font-bold">
                      {adminUser.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <Link
                  href="/settings"
                  className="p-2 hover:bg-red-600 rounded-lg transition"
                  title="Settings"
                >
                  <Settings className="w-5 h-5 lg:w-6 lg:h-6" />
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 hover:bg-red-600 rounded-lg transition"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5 lg:w-6 lg:h-6" />
                </button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-red-600 rounded-lg transition"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Menu Bar - Desktop */}
      <div className="hidden md:block bg-gray-700 text-white shadow-lg">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between flex-wrap">
            {/* Navigation Links */}
            <nav className="flex items-center flex-wrap">
              <Link 
                href="/admin/dashboard"
                className="flex items-center gap-2 px-3 lg:px-6 py-3 lg:py-4 hover:bg-gray-600 transition border-r border-gray-600 text-sm lg:text-base"
              >
                <Home className="w-4 h-4 lg:w-5 lg:h-5" />
                <span className="font-medium">Home</span>
              </Link>
              
              <Link 
                href="/admin/single-user"
                className="flex items-center gap-2 px-3 lg:px-6 py-3 lg:py-4 hover:bg-gray-600 transition border-r border-gray-600 text-sm lg:text-base"
              >
                <User className="w-4 h-4 lg:w-5 lg:h-5" />
                <span className="font-medium hidden lg:inline">Single User</span>
                <span className="font-medium lg:hidden">User</span>
              </Link>

              <Link 
                href="/admin/coaches"
                className="flex items-center gap-2 px-3 lg:px-6 py-3 lg:py-4 hover:bg-gray-600 transition border-r border-gray-600 text-sm lg:text-base"
              >
                <Shield className="w-4 h-4 lg:w-5 lg:h-5" />
                <span className="font-medium">Coaches</span>
              </Link>

              <Link 
                href="/admin/groups"
                className="flex items-center gap-2 px-3 lg:px-6 py-3 lg:py-4 hover:bg-gray-600 transition border-r border-gray-600 text-sm lg:text-base"
              >
                <Users className="w-4 h-4 lg:w-5 lg:h-5" />
                <span className="font-medium">Groups</span>
              </Link>

              <Link 
                href="/admin/teams"
                className="flex items-center gap-2 px-3 lg:px-6 py-3 lg:py-4 hover:bg-gray-600 transition border-r border-gray-600 text-sm lg:text-base"
              >
                <Users className="w-4 h-4 lg:w-5 lg:h-5" />
                <span className="font-medium">Teams</span>
              </Link>

              <Link 
                href="/settings"
                className="flex items-center gap-2 px-3 lg:px-6 py-3 lg:py-4 hover:bg-gray-600 transition border-r border-gray-600 text-sm lg:text-base"
              >
                <Settings className="w-4 h-4 lg:w-5 lg:h-5" />
                <span className="font-medium">Settings</span>
              </Link>

              {/* Language Dropdown */}
              <div className="relative" ref={languageRef}>
                <button
                  onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                  className="flex items-center gap-2 px-3 lg:px-6 py-3 lg:py-4 hover:bg-gray-600 transition border-r border-gray-600 text-sm lg:text-base"
                >
                  <Globe className="w-4 h-4 lg:w-5 lg:h-5" />
                  <span className="font-medium">{currentLangDisplay}</span>
                </button>

                {showLanguageDropdown && (
                  <div className="absolute top-full left-0 bg-white text-gray-900 shadow-2xl rounded-b-lg z-50 min-w-[200px]">
                    {availableLanguages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code);
                          setShowLanguageDropdown(false);
                        }}
                        className={`w-full text-left px-6 py-3 hover:bg-gray-100 transition text-sm ${
                          currentLanguage === lang.code ? 'bg-blue-50 text-blue-700 font-semibold' : ''
                        }`}
                      >
                        {lang.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </nav>

            {/* Search Bar - Desktop */}
            <div className="hidden xl:block">
              <form onSubmit={handleSearch} className="flex items-center gap-2">
                <span className="text-sm text-gray-300">Search in</span>
                <select
                  value={searchCategory}
                  onChange={(e) => setSearchCategory(e.target.value)}
                  className="bg-white text-gray-900 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option>All Users</option>
                  <option>Athletes</option>
                  <option>Coaches</option>
                  <option>Teams</option>
                  <option>Clubs</option>
                  <option>Groups</option>
                </select>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    className="bg-white text-gray-900 px-4 py-2 rounded pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <button 
                    type="submit"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-700 p-1 rounded hover:bg-gray-600 transition"
                  >
                    <Search className="w-4 h-4 text-white" />
                  </button>
                </div>
              </form>
            </div>

            {/* Search Toggle - Tablet */}
            <button
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              className="xl:hidden px-4 py-3 hover:bg-gray-600 transition"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>

          {/* Expandable Search Bar - Tablet */}
          {mobileSearchOpen && (
            <div className="xl:hidden border-t border-gray-600 py-3">
              <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <select
                  value={searchCategory}
                  onChange={(e) => setSearchCategory(e.target.value)}
                  className="bg-white text-gray-900 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option>All Users</option>
                  <option>Athletes</option>
                  <option>Coaches</option>
                  <option>Teams</option>
                  <option>Clubs</option>
                  <option>Groups</option>
                </select>
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    className="w-full bg-white text-gray-900 px-4 py-2 rounded pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button 
                    type="submit"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-700 p-1 rounded hover:bg-gray-600 transition"
                  >
                    <Search className="w-4 h-4 text-white" />
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-gray-700 text-white shadow-lg">
          <nav className="flex flex-col">
            <Link 
              href="/admin/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-6 py-4 hover:bg-gray-600 transition border-b border-gray-600"
            >
              <Home className="w-5 h-5" />
              <span className="font-medium">Home</span>
            </Link>
            
            <Link 
              href="/admin/single-user"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-6 py-4 hover:bg-gray-600 transition border-b border-gray-600"
            >
              <User className="w-5 h-5" />
              <span className="font-medium">Single User</span>
            </Link>

            <Link 
              href="/admin/coaches"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-6 py-4 hover:bg-gray-600 transition border-b border-gray-600"
            >
              <Shield className="w-5 h-5" />
              <span className="font-medium">Coaches</span>
            </Link>

            <Link 
              href="/admin/groups"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-6 py-4 hover:bg-gray-600 transition border-b border-gray-600"
            >
              <Users className="w-5 h-5" />
              <span className="font-medium">Groups</span>
            </Link>

            <Link 
              href="/admin/teams"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-6 py-4 hover:bg-gray-600 transition border-b border-gray-600"
            >
              <Users className="w-5 h-5" />
              <span className="font-medium">Teams</span>
            </Link>

            <Link 
              href="/settings"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-6 py-4 hover:bg-gray-600 transition border-b border-gray-600"
            >
              <Settings className="w-5 h-5" />
              <span className="font-medium">Settings</span>
            </Link>

            {/* Language Selection */}
            <div className="border-b border-gray-600">
              <div className="px-6 py-3 bg-gray-600 text-xs font-semibold uppercase text-gray-300">
                Language
              </div>
              {availableLanguages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left flex items-center gap-3 px-6 py-3 hover:bg-gray-600 transition ${
                    currentLanguage === lang.code ? 'bg-gray-600 text-yellow-400 font-semibold' : ''
                  }`}
                >
                  <Globe className="w-5 h-5" />
                  <span>{lang.name}</span>
                </button>
              ))}
            </div>

            {/* Mobile User Actions */}
            {adminUser && (
              <div className="border-b border-gray-600">
                <div className="px-6 py-3 bg-gray-600 text-xs font-semibold uppercase text-gray-300">
                  Account
                </div>
                <Link
                  href="/settings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-6 py-4 hover:bg-gray-600 transition"
                >
                  <Settings className="w-5 h-5" />
                  <span className="font-medium">Settings</span>
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left flex items-center gap-3 px-6 py-4 hover:bg-gray-600 transition text-red-300"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            )}

            {/* Mobile Search */}
            <div className="p-4">
              <form onSubmit={(e) => { handleSearch(e); setMobileMenuOpen(false); }} className="space-y-3">
                <select
                  value={searchCategory}
                  onChange={(e) => setSearchCategory(e.target.value)}
                  className="w-full bg-white text-gray-900 px-4 py-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option>All Users</option>
                  <option>Athletes</option>
                  <option>Coaches</option>
                  <option>Teams</option>
                  <option>Clubs</option>
                  <option>Groups</option>
                </select>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    className="w-full bg-white text-gray-900 px-4 py-3 rounded pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button 
                    type="submit"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-700 px-3 py-2 rounded hover:bg-gray-600 transition"
                  >
                    <Search className="w-4 h-4 text-white" />
                  </button>
                </div>
              </form>
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}

