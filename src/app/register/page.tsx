'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
<<<<<<< HEAD
=======
import { useAuth } from '@/hooks/useAuth';
>>>>>>> 21d778b56ceb678af8ea9a9eb545faff336aa642

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
<<<<<<< HEAD
    userType: 'athlete' as 'athlete' | 'coach' | 'team' | 'club' | 'group'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();
=======
    userType: 'athlete' as 'athlete' | 'coach' | 'team' | 'club'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { login } = useAuth();
>>>>>>> 21d778b56ceb678af8ea9a9eb545faff336aa642

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          username: formData.username,
          email: formData.email,
          password: formData.password,
          userType: formData.userType
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

<<<<<<< HEAD
      // Show success message
      setSuccess(true);
      
      // Redirect to login modal after 2 seconds
      setTimeout(() => {
        router.push('/?showLogin=true');
      }, 2000);
=======
      // Store token and user data
      login(data.token, data.user);
      
      // Redirect to homepage with auth success parameter
      router.push('/?fromAuth=true');
>>>>>>> 21d778b56ceb678af8ea9a9eb545faff336aa642

    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/');
  };

  const handleLoginClick = () => {
    router.push('/?showLogin=true');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      {/* Background Image with Overlay */}
      <div className="fixed inset-0 z-0">
        <Image
          src="/images/licensed-image.jpg"
          alt="Workout Dashboard"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black bg-opacity-60"></div>
      </div>

      {/* Back Button */}
      <div className="absolute top-6 left-6 z-10">
        <button
          onClick={handleBack}
          className="flex items-center text-white hover:text-gray-200 transition-colors bg-white bg-opacity-10 backdrop-blur-sm px-4 py-2 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Home
        </button>
      </div>

      {/* Centered Transparent Form */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white bg-opacity-10 backdrop-blur-xl rounded-3xl shadow-2xl border border-cyan-500 border-opacity-30 p-8">
          {/* Logo and Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">MovesBook</h1>
            <p className="text-cyan-100 text-lg">Join our elite training community</p>
          </div>

          {error && (
            <div className="bg-red-500 bg-opacity-20 backdrop-blur-sm border border-red-400 border-opacity-30 text-red-200 px-4 py-3 rounded-xl mb-6">
              {error}
            </div>
          )}

<<<<<<< HEAD
          {success && (
            <div className="bg-green-500 bg-opacity-20 backdrop-blur-sm border border-green-400 border-opacity-30 text-green-200 px-4 py-3 rounded-xl mb-6">
              ✅ Registration successful! Redirecting to login...
            </div>
          )}

=======
>>>>>>> 21d778b56ceb678af8ea9a9eb545faff336aa642
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* User Type Selection */}
              <div>
                <label htmlFor="user-type" className="block text-sm font-medium text-white mb-2">
                  I am a: *
                </label>
                <select
                  id="user-type"
                  name="userType"
                  className="w-full px-4 py-3 bg-white bg-opacity-10 backdrop-blur-sm border border-cyan-500 border-opacity-30 rounded-xl text-white placeholder-cyan-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-200"
                  value={formData.userType}
                  onChange={(e) => setFormData({...formData, userType: e.target.value as any})}
                >
                  <option value="athlete" className="text-gray-800">Athlete</option>
                  <option value="coach" className="text-gray-800">Coach</option>
                  <option value="team" className="text-gray-800">Team Manager</option>
                  <option value="club" className="text-gray-800">Club Trainer</option>
<<<<<<< HEAD
                  <option value="group" className="text-gray-800">Group</option>
=======
>>>>>>> 21d778b56ceb678af8ea9a9eb545faff336aa642
                </select>
              </div>

              {/* Full Name Input */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-white mb-2">
                  Full Name *
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="w-full px-4 py-3 bg-white bg-opacity-10 backdrop-blur-sm border border-cyan-500 border-opacity-30 rounded-xl text-white placeholder-cyan-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

              {/* Username Input */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-white mb-2">
                  Username *
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="w-full px-4 py-3 bg-white bg-opacity-10 backdrop-blur-sm border border-cyan-500 border-opacity-30 rounded-xl text-white placeholder-cyan-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-200"
                  placeholder="Choose a username"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                />
              </div>

              {/* Email Input */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                  Email Address *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="w-full px-4 py-3 bg-white bg-opacity-10 backdrop-blur-sm border border-cyan-500 border-opacity-30 rounded-xl text-white placeholder-cyan-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>

              {/* Password Input */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                  Password *
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={6}
                  className="w-full px-4 py-3 bg-white bg-opacity-10 backdrop-blur-sm border border-cyan-500 border-opacity-30 rounded-xl text-white placeholder-cyan-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-200"
                  placeholder="Create a password (min. 6 characters)"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>

              {/* Confirm Password Input */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-white mb-2">
                  Confirm Password *
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={6}
                  className="w-full px-4 py-3 bg-white bg-opacity-10 backdrop-blur-sm border border-cyan-500 border-opacity-30 rounded-xl text-white placeholder-cyan-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-200"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                />
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="w-4 h-4 text-cyan-400 bg-white bg-opacity-10 border-cyan-500 border-opacity-30 rounded focus:ring-cyan-400 focus:ring-offset-transparent"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-cyan-100">
                I agree to the{' '}
                <Link href="/terms" className="text-cyan-300 hover:text-cyan-200 underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-cyan-300 hover:text-cyan-200 underline">
                  Privacy Policy
                </Link>
              </label>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 px-6 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold rounded-xl hover:from-cyan-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-2xl"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Creating account...
                  </div>
                ) : (
                  'Create Account'
                )}
              </button>
            </div>

            {/* Sign In Link */}
            <div className="text-center">
              <span className="text-sm text-cyan-200">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={handleLoginClick}
                  className="font-semibold text-white hover:text-cyan-200 transition-colors underline"
                >
                  Sign in here
                </button>
              </span>
            </div>
          </form>
        </div>

        {/* Additional Decorative Elements */}
        <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-3xl blur-xl opacity-20 -z-10"></div>
      </div>

    </div>
  );
}