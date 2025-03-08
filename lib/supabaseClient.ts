import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Initialize with default empty values if environment variables are not available
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Get the site URL for redirects based on the environment
export const getURL = () => {
  let url =
    process?.env?.NEXT_PUBLIC_SITE_URL ?? // Set this to your site URL in production env.
    process?.env?.NEXT_PUBLIC_VERCEL_URL ?? // Automatically set by Vercel.
    'http://localhost:3000/';

  // Make sure to include `https://` when not localhost.
  url = url.includes('localhost')
    ? url
    : url.startsWith('http')
    ? url
    : `https://${url}`;

  // Make sure to include a trailing `/`.
  url = url.endsWith('/') ? url : `${url}/`;

  return url;
};

// Create a singleton instance
let supabaseInstance: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient => {
  if (!supabaseInstance) {
    // Only throw an error in the browser environment, not during builds
    if (!supabaseUrl || !supabaseAnonKey) {
      if (typeof window !== 'undefined') {
        console.error(
          'Missing Supabase environment variables. Please check your .env.local file.'
        );
        throw new Error(
          'Supabase URL and Anon Key must be provided. Check your environment variables.'
        );
      }
    }

    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        storageKey: 'supabase-auth',
      },
    });
  }
  return supabaseInstance;
};

// Export a direct instance for convenience
export const supabase = getSupabase();

// Password reset functionality
export const resetPassword = async (email: string) => {
  const redirectUrl = `${getURL()}reset-password`;

  console.log(
    `Sending password reset to ${email} with redirect to ${redirectUrl}`
  );

  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: redirectUrl,
  });

  return { data, error };
};

// Enhanced connection check with better error handling
export const checkSupabaseConnection = async () => {
  try {
    console.log('Checking Supabase connection with URL:', supabaseUrl);

    // First check auth connection
    const { data: authData, error: authError } =
      await supabase.auth.getSession();

    if (authError) {
      console.error('Supabase auth connection error:', authError);
      return {
        connected: false,
        error: authError,
        details: 'Auth service connection failed',
        credentials: {
          hasUrl: !!supabaseUrl,
          hasKey: !!supabaseAnonKey,
          urlPrefix: supabaseUrl?.substring(0, 10),
        },
      };
    }

    // Then check database connection with a simpler query
    const { error: dbError } = await supabase
      .from('users')
      .select('count', { count: 'exact', head: true });

    if (dbError) {
      console.error('Supabase database connection error:', dbError);
      // Don't fail if this is just a permission error (RLS)
      const isPolicyError =
        dbError.code === 'PGRST301' ||
        dbError.message.includes('permission denied');

      return {
        connected: isPolicyError, // Still connected if it's just a policy issue
        error: dbError,
        details: isPolicyError
          ? 'Connected but policy restricts access'
          : 'Database connection failed',
      };
    }

    return { connected: true };
  } catch (err) {
    console.error('Unexpected error checking Supabase connection:', err);
    return {
      connected: false,
      error: err,
      details: 'Unexpected connection error',
    };
  }
};
