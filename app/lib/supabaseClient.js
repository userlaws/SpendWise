import { createClient } from '@supabase/supabase-js';

// Create a regular Supabase client for browser/client use
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);

// Create a service role client for admin operations
export const createServiceClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

// Custom login function that handles password resets
export async function loginWithResetSupport(email, password) {
  try {
    // First, try normal login
    const { data: signInData, error: signInError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    // If login succeeds, return the result
    if (!signInError) {
      return { data: signInData, error: null };
    }

    // If login fails, check if there's an approved password reset
    console.log('Login failed, checking for password reset...');

    // Get the user by email in our users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, username, email')
      .eq('email', email)
      .maybeSingle();

    if (userError || !userData) {
      // No user found with this email
      return { data: null, error: signInError };
    }

    // Check for an approved password reset
    const { data: resetData, error: resetError } = await supabase
      .from('password_reset_requests')
      .select('*')
      .eq('email', email)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (resetError || !resetData) {
      // No approved reset found
      return { data: null, error: signInError };
    }

    console.log('Found approved password reset:', resetData.id);

    // Found an approved reset - check if the provided password matches the new_password
    if (resetData.new_password === password) {
      console.log('Password matches approved reset');

      // Update user's actual password in Auth
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        console.error('Error updating password:', updateError);
        return { data: null, error: updateError };
      }

      // Mark reset as completed
      await supabase
        .from('password_reset_requests')
        .update({ status: 'completed' })
        .eq('id', resetData.id);

      // Try logging in again
      return await supabase.auth.signInWithPassword({
        email,
        password,
      });
    } else {
      // Password doesn't match the reset
      return { data: null, error: { message: 'Incorrect password' } };
    }
  } catch (error) {
    console.error('Login error:', error);
    return { data: null, error };
  }
}

// Helper function to check if a user has an approved password reset
export async function checkForApprovedReset(email, password) {
  // This needs to be done server-side due to service role
  try {
    const response = await fetch('/api/admin/check-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    return await response.json();
  } catch (error) {
    console.error('Error checking for password reset:', error);
    return { match: false, error: error.message };
  }
}
