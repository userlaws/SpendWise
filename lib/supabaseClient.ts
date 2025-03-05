import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Directly check if the environment variables are available
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Validate required environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Missing Supabase environment variables. Please check your .env.local file.'
  );
}

// Create a properly typed singleton instance
let supabaseInstance: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient => {
  if (!supabaseInstance) {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error(
        'Supabase URL and Anon Key must be provided. Check your environment variables.'
      );
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

// Export configured supabase client
export const supabase = getSupabase();

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
