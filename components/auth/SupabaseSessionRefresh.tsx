'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export function SupabaseSessionRefresh() {
  useEffect(() => {
    const supabase = createClient();

    // Listen for auth state changes (handles token refresh events)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN') {
          // Session is fresh — no action needed
        }
        if (event === 'SIGNED_OUT') {
          // Clear any stale state
        }
      }
    );

    // When user returns to the tab, force a session check
    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') {
        supabase.auth.getSession();
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      subscription.unsubscribe();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return null;
}
