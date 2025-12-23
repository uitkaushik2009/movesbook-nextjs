import { useState, useEffect } from 'react';

export function useFavoriteSports() {
  const [favoriteSports, setFavoriteSports] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavoriteSports();
  }, []);

  const loadFavoriteSports = async () => {
    try {
      // Check both regular token and admin token
      const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
      if (!token) {
        console.log('🔒 No token found, skipping favorite sports load');
        setLoading(false);
        return;
      }

      console.log('🌟 Loading favorite sports...');
      const response = await fetch('/api/user/favorite-sports', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Favorite sports loaded:', data.sports?.length || 0, 'sports');
        setFavoriteSports(data.sports || []);
      } else {
        // If there's an error, just use empty array (user hasn't set favorites yet)
        console.log('⚠️ No favorite sports found');
        setFavoriteSports([]);
      }
    } catch (error) {
      console.error('❌ Error loading favorite sports:', error);
      // On error, set empty array so the component still works
      setFavoriteSports([]);
    } finally {
      setLoading(false);
    }
  };

  return { favoriteSports, loading, reload: loadFavoriteSports };
}

