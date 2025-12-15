import { useAuth } from '@/hooks/useAuth';
import { useUserSettings } from './useUserSettings';

/**
 * Hook to get the current sport icon type setting
 * Returns 'emoji' or 'icon' based on user preference
 */
export function useSportIconType(): 'emoji' | 'icon' {
  const { user } = useAuth();
  const { settings, loading } = useUserSettings(user?.id);

  // Default to emoji while loading or if not set
  if (loading || !settings || !settings.sportIconType) {
    return 'emoji';
  }

  return settings.sportIconType;
}

