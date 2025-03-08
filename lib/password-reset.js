import { supabase } from '@/lib/supabaseClient';

// This function should be called from a secure server component
// or a Supabase Edge Function because it requires admin privileges
export async function resetPassword({ userId, newPassword }) {
  try {
    // Validate inputs
    if (!userId || !newPassword) {
      throw new Error('User ID and new password are required');
    }

    console.log('Resetting password for user ID:', userId);

    // Method 1: Try the simplified API
    try {
      console.log('Attempting password reset via simplified API');
      const simplifiedResponse = await fetch(
        '/api/admin/reset-password-simple',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            newPassword,
          }),
        }
      );

      const simplifiedData = await simplifiedResponse.json();

      if (simplifiedResponse.ok) {
        console.log('Password reset successful via simplified API');
        return simplifiedData;
      }

      console.log('Simplified API failed:', simplifiedData.error);
    } catch (error) {
      console.error('Simplified API error:', error);
    }

    // Method 2: Try the direct reset API
    try {
      console.log('Attempting password reset via direct API');
      const directResponse = await fetch('/api/admin/direct-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          newPassword,
        }),
      });

      const directData = await directResponse.json();

      if (directResponse.ok) {
        console.log('Password reset successful via direct API');
        return directData;
      }

      console.log('Direct API failed:', directData.error);
    } catch (error) {
      console.error('Direct API error:', error);
    }

    // Method 3: Try client-side API if available
    try {
      console.log('Attempting password reset via client-side API');
      // This requires admin privilege which likely won't work
      const { error } = await supabase.auth.admin.updateUserById(userId, {
        password: newPassword,
      });

      if (!error) {
        console.log('Password reset successful via client-side API');
        return { success: true };
      }

      console.log('Client-side API failed:', error.message);
    } catch (error) {
      console.error('Client-side API error:', error);
    }

    // If we get here, all methods failed
    throw new Error('All password reset methods failed');
  } catch (error) {
    console.error('Password reset error:', error);
    throw error;
  }
}
