'use client';

import { useState, useEffect } from 'react';
import { X, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from "next/navigation";
import { useLanguage } from '@/contexts/LanguageContext';


interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type ViewMode = 'login' | 'reset-password' | 'reset-username';

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
    const { t } = useLanguage();
    const [viewMode, setViewMode] = useState<ViewMode>('login');
    const [formData, setFormData] = useState({
        identifier: '', // Can be email or username
        password: '',
        userType: 'athlete' as 'athlete' | 'coach' | 'team' | 'club' | 'group'
    });
    const [resetPasswordData, setResetPasswordData] = useState({
        identifier: '',
        newPassword: '',
        confirmPassword: '',
        userType: 'athlete' as 'athlete' | 'coach' | 'team' | 'club' | 'group'
    });
    const [resetUsernameData, setResetUsernameData] = useState({
        email: '',
        newUsername: '',
        userType: 'athlete' as 'athlete' | 'coach' | 'team' | 'club' | 'group'
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const { login } = useAuth();
    const router = useRouter();

    // Clear form when modal closes
    useEffect(() => {
        if (!isOpen) {
            // Reset form data when modal is closed
            setViewMode('login');
            setFormData({
                identifier: '',
                password: '',
                userType: 'athlete'
            });
            setResetPasswordData({
                identifier: '',
                newPassword: '',
                confirmPassword: '',
                userType: 'athlete'
            });
            setResetUsernameData({
                email: '',
                newUsername: '',
                userType: 'athlete'
            });
            setError('');
            setSuccess('');
            setIsLoading(false);
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Login failed');
            }

            // Use the auth hook to login
            login(data.token, data.user);

        } catch (error: any) {
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccess('');

        // Validate passwords match
        if (resetPasswordData.newPassword !== resetPasswordData.confirmPassword) {
            setError(t('alert_password_mismatch'));
            setIsLoading(false);
            return;
        }

        // Validate password strength
        if (resetPasswordData.newPassword.length < 6) {
            setError(t('auth_password_min_length'));
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    identifier: resetPasswordData.identifier,
                    newPassword: resetPasswordData.newPassword,
                    userType: resetPasswordData.userType
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || t('auth_password_reset_failed'));
            }

            setSuccess(t('auth_password_reset_success'));
            setTimeout(() => {
                setViewMode('login');
                setResetPasswordData({
                    identifier: '',
                    newPassword: '',
                    confirmPassword: '',
                    userType: 'athlete'
                });
            }, 2000);

        } catch (error: any) {
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetUsername = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccess('');

        // Validate username
        if (resetUsernameData.newUsername.length < 3) {
            setError(t('auth_username_min_length'));
            setIsLoading(false);
            return;
        }

        if (!/^[a-zA-Z0-9_]+$/.test(resetUsernameData.newUsername)) {
            setError(t('auth_username_format'));
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/auth/reset-username', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: resetUsernameData.email,
                    newUsername: resetUsernameData.newUsername,
                    userType: resetUsernameData.userType
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || t('auth_username_reset_failed'));
            }

            setSuccess(t('auth_username_reset_success').replace('{username}', data.newUsername));
            setTimeout(() => {
                setViewMode('login');
                setResetUsernameData({
                    email: '',
                    newUsername: '',
                    userType: 'athlete'
                });
            }, 3000);

        } catch (error: any) {
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    const renderLoginForm = () => (
        <>
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">
                    {t('auth_welcome_back')}
                </h2>
                <p className="text-cyan-100">
                    {t('auth_sign_in_subtitle')}
                </p>
            </div>

            {error && (
                <div className="bg-red-500 bg-opacity-20 backdrop-blur-sm border border-red-400 border-opacity-30 text-red-200 px-4 py-3 rounded-xl mb-6">
                    {error}
                </div>
            )}

            {success && (
                <div className="bg-green-500 bg-opacity-20 backdrop-blur-sm border border-green-400 border-opacity-30 text-green-200 px-4 py-3 rounded-xl mb-6">
                    {success}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off" key={isOpen ? 'open' : 'closed'}>
                <div>
                    <label htmlFor="user-type" className="block text-sm font-medium text-white mb-2">
                        {t('auth_select_user_type')}:
                    </label>
                    <select
                        id="user-type"
                        value={formData.userType}
                        onChange={(e) => setFormData({ ...formData, userType: e.target.value as any })}
                        className="w-full px-4 py-3 bg-white bg-opacity-10 backdrop-blur-sm border border-cyan-500 border-opacity-30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-200"
                    >
                        <option value="athlete" className="text-gray-800">{t('user_type_athlete')}</option>
                        <option value="coach" className="text-gray-800">{t('user_type_coach')}</option>
                        <option value="team" className="text-gray-800">{t('user_type_team')}</option>
                        <option value="club" className="text-gray-800">{t('user_type_club')}</option>
                        <option value="group" className="text-gray-800">{t('user_type_group')}</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="user-identifier" className="block text-sm font-medium text-white mb-2">
                        {t('auth_email_or_username')}
                    </label>
                    <input
                        type="text"
                        id="user-identifier"
                        name="user-login-identifier"
                        autoComplete="new-password"
                        autoCorrect="off"
                        autoCapitalize="off"
                        spellCheck="false"
                        required
                        value={formData.identifier}
                        onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                        className="w-full px-4 py-3 bg-white bg-opacity-10 backdrop-blur-sm border border-cyan-500 border-opacity-30 rounded-xl text-white placeholder-cyan-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-200"
                        placeholder={t('auth_email_or_username')}
                    />
                </div>

                <div>
                    <label htmlFor="user-password" className="block text-sm font-medium text-white mb-2">
                        {t('auth_password')}
                    </label>
                    <input
                        type="password"
                        id="user-password"
                        name="user-login-password"
                        autoComplete="new-password"
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full px-4 py-3 bg-white bg-opacity-10 backdrop-blur-sm border border-cyan-500 border-opacity-30 rounded-xl text-white placeholder-cyan-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-200"
                        placeholder={t('auth_password')}
                    />
                </div>

                <div className="flex justify-between items-center text-sm">
                    <button
                        type="button"
                        onClick={() => setViewMode('reset-password')}
                        className="text-cyan-200 hover:text-white transition-colors underline"
                    >
                        {t('auth_forgot_password')}
                    </button>
                    <button
                        type="button"
                        onClick={() => setViewMode('reset-username')}
                        className="text-cyan-200 hover:text-white transition-colors underline"
                    >
                        {t('auth_reset_username')}?
                    </button>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 px-6 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold rounded-xl hover:from-cyan-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-2xl"
                >
                    {isLoading ? (
                        <div className="flex items-center justify-center">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                            {t('loading')}
                        </div>
                    ) : (
                        t('auth_sign_in')
                    )}
                </button>
            </form>

            <div className="mt-6 text-center">
                <p className="text-cyan-200 text-sm">
                    {t('auth_no_account')}{' '}
                    <button
                        onClick={() => {
                            onClose();
                            router.push("/register");
                        }}
                        className="text-white font-semibold hover:text-cyan-200 transition-colors underline"
                    >
                        {t('auth_sign_up')}
                    </button>
                </p>
            </div>
        </>
    );

    const renderResetPasswordForm = () => (
        <>
            <button
                onClick={() => setViewMode('login')}
                className="flex items-center text-cyan-200 hover:text-white transition-colors mb-4"
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('auth_back_to_login')}
            </button>

            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">
                    {t('auth_reset_password_title')}
                </h2>
                <p className="text-cyan-100">
                    {t('auth_reset_password_subtitle')}
                </p>
            </div>

            {error && (
                <div className="bg-red-500 bg-opacity-20 backdrop-blur-sm border border-red-400 border-opacity-30 text-red-200 px-4 py-3 rounded-xl mb-6">
                    {error}
                </div>
            )}

            {success && (
                <div className="bg-green-500 bg-opacity-20 backdrop-blur-sm border border-green-400 border-opacity-30 text-green-200 px-4 py-3 rounded-xl mb-6">
                    {success}
                </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-6">
                <div>
                    <label htmlFor="reset-password-user-type" className="block text-sm font-medium text-white mb-2">
                        {t('auth_select_user_type')}:
                    </label>
                    <select
                        id="reset-password-user-type"
                        value={resetPasswordData.userType}
                        onChange={(e) => setResetPasswordData({ ...resetPasswordData, userType: e.target.value as any })}
                        className="w-full px-4 py-3 bg-white bg-opacity-10 backdrop-blur-sm border border-cyan-500 border-opacity-30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-200"
                    >
                        <option value="athlete" className="text-gray-800">{t('user_type_athlete')}</option>
                        <option value="coach" className="text-gray-800">{t('user_type_coach')}</option>
                        <option value="team" className="text-gray-800">{t('user_type_team')}</option>
                        <option value="club" className="text-gray-800">{t('user_type_club')}</option>
                        <option value="group" className="text-gray-800">{t('user_type_group')}</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="reset-password-identifier" className="block text-sm font-medium text-white mb-2">
                        {t('auth_email_or_username')}
                    </label>
                    <input
                        type="text"
                        id="reset-password-identifier"
                        required
                        value={resetPasswordData.identifier}
                        onChange={(e) => setResetPasswordData({ ...resetPasswordData, identifier: e.target.value })}
                        className="w-full px-4 py-3 bg-white bg-opacity-10 backdrop-blur-sm border border-cyan-500 border-opacity-30 rounded-xl text-white placeholder-cyan-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-200"
                        placeholder={t('auth_email_or_username')}
                    />
                </div>

                <div>
                    <label htmlFor="reset-password-new" className="block text-sm font-medium text-white mb-2">
                        {t('auth_new_password')}
                    </label>
                    <input
                        type="password"
                        id="reset-password-new"
                        required
                        value={resetPasswordData.newPassword}
                        onChange={(e) => setResetPasswordData({ ...resetPasswordData, newPassword: e.target.value })}
                        className="w-full px-4 py-3 bg-white bg-opacity-10 backdrop-blur-sm border border-cyan-500 border-opacity-30 rounded-xl text-white placeholder-cyan-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-200"
                        placeholder={t('auth_new_password')}
                    />
                </div>

                <div>
                    <label htmlFor="reset-password-confirm" className="block text-sm font-medium text-white mb-2">
                        {t('auth_confirm_password')}
                    </label>
                    <input
                        type="password"
                        id="reset-password-confirm"
                        required
                        value={resetPasswordData.confirmPassword}
                        onChange={(e) => setResetPasswordData({ ...resetPasswordData, confirmPassword: e.target.value })}
                        className="w-full px-4 py-3 bg-white bg-opacity-10 backdrop-blur-sm border border-cyan-500 border-opacity-30 rounded-xl text-white placeholder-cyan-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-200"
                        placeholder={t('auth_confirm_password')}
                    />
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 px-6 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold rounded-xl hover:from-cyan-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-2xl"
                >
                    {isLoading ? (
                        <div className="flex items-center justify-center">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                            {t('loading')}
                        </div>
                    ) : (
                        t('auth_reset_password')
                    )}
                </button>
            </form>
        </>
    );

    const renderResetUsernameForm = () => (
        <>
            <button
                onClick={() => setViewMode('login')}
                className="flex items-center text-cyan-200 hover:text-white transition-colors mb-4"
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('auth_back_to_login')}
            </button>

            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">
                    {t('auth_reset_username_title')}
                </h2>
                <p className="text-cyan-100">
                    {t('auth_reset_username_subtitle')}
                </p>
            </div>

            {error && (
                <div className="bg-red-500 bg-opacity-20 backdrop-blur-sm border border-red-400 border-opacity-30 text-red-200 px-4 py-3 rounded-xl mb-6">
                    {error}
                </div>
            )}

            {success && (
                <div className="bg-green-500 bg-opacity-20 backdrop-blur-sm border border-green-400 border-opacity-30 text-green-200 px-4 py-3 rounded-xl mb-6">
                    {success}
                </div>
            )}

            <form onSubmit={handleResetUsername} className="space-y-6">
                <div>
                    <label htmlFor="reset-username-user-type" className="block text-sm font-medium text-white mb-2">
                        {t('auth_select_user_type')}:
                    </label>
                    <select
                        id="reset-username-user-type"
                        value={resetUsernameData.userType}
                        onChange={(e) => setResetUsernameData({ ...resetUsernameData, userType: e.target.value as any })}
                        className="w-full px-4 py-3 bg-white bg-opacity-10 backdrop-blur-sm border border-cyan-500 border-opacity-30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-200"
                    >
                        <option value="athlete" className="text-gray-800">{t('user_type_athlete')}</option>
                        <option value="coach" className="text-gray-800">{t('user_type_coach')}</option>
                        <option value="team" className="text-gray-800">{t('user_type_team')}</option>
                        <option value="club" className="text-gray-800">{t('user_type_club')}</option>
                        <option value="group" className="text-gray-800">{t('user_type_group')}</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="reset-username-email" className="block text-sm font-medium text-white mb-2">
                        {t('auth_email')}
                    </label>
                    <input
                        type="email"
                        id="reset-username-email"
                        required
                        value={resetUsernameData.email}
                        onChange={(e) => setResetUsernameData({ ...resetUsernameData, email: e.target.value })}
                        className="w-full px-4 py-3 bg-white bg-opacity-10 backdrop-blur-sm border border-cyan-500 border-opacity-30 rounded-xl text-white placeholder-cyan-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-200"
                        placeholder={t('auth_email')}
                    />
                </div>

                <div>
                    <label htmlFor="reset-username-new" className="block text-sm font-medium text-white mb-2">
                        {t('auth_new_username')}
                    </label>
                    <input
                        type="text"
                        id="reset-username-new"
                        required
                        value={resetUsernameData.newUsername}
                        onChange={(e) => setResetUsernameData({ ...resetUsernameData, newUsername: e.target.value })}
                        className="w-full px-4 py-3 bg-white bg-opacity-10 backdrop-blur-sm border border-cyan-500 border-opacity-30 rounded-xl text-white placeholder-cyan-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-200"
                        placeholder={t('auth_new_username')}
                    />
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 px-6 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold rounded-xl hover:from-cyan-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-2xl"
                >
                    {isLoading ? (
                        <div className="flex items-center justify-center">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                            {t('loading')}
                        </div>
                    ) : (
                        t('auth_reset_username')
                    )}
                </button>
            </form>
        </> 
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60 backdrop-blur-md">
            <div className="relative w-full max-w-md">
                {/* Transparent Card with Glass Effect */}
                <div className="bg-white bg-opacity-10 backdrop-blur-xl rounded-3xl shadow-2xl border border-cyan-500 border-opacity-30 p-8">
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 text-white hover:text-cyan-200 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    {/* Render appropriate form based on view mode */}
                    {viewMode === 'login' && renderLoginForm()}
                    {viewMode === 'reset-password' && renderResetPasswordForm()}
                    {viewMode === 'reset-username' && renderResetUsernameForm()}
                </div>

                {/* Decorative Glow Effect */}
                <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-3xl blur-xl opacity-20 -z-10"></div>
            </div>
        </div>
    );
}