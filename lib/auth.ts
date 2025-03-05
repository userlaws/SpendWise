import { supabase } from './supabaseClient';

/**
 * Register a new user with both Supabase Auth and custom users table
 * @param email User's email
 * @param password User's password
 * @param username User's username
 * @param additionalData Any additional user data to store
 * @returns Object with success/error message and user data
 */
export async function registerUser(
  email: string,
  password: string,
  username: string,
  additionalData: Record<string, any> = {}
) {
  try {
    // 1. Use Supabase Auth to sign up the user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError || !authData.user) {
      console.error('Auth Sign-Up Error:', authError?.message);
      return { error: authError?.message || 'Sign-Up failed' };
    }

    // 2. Insert additional user data into the custom 'users' table
    const { data, error: insertError } = await supabase.from('users').insert([
      {
        user_id: authData.user.id, // Link to the auth user's id
        email: email, // User email
        username: username, // User-provided username
        registration_date: new Date().toISOString(),
        ...additionalData, // Any additional fields
      },
    ]);

    if (insertError) {
      console.error('Custom Table Insert Error:', insertError.message);
      return { error: insertError.message };
    }

    // 3. Return success response
    return {
      success: 'User registered successfully',
      user: authData.user,
      userData: data,
    };
  } catch (error) {
    console.error('Registration error:', error);
    return { error: 'An unexpected error occurred during registration' };
  }
}

/**
 * Add user data to the custom users table (for cases where auth already happened)
 * @param userId The user ID from Supabase Auth
 * @param email User's email
 * @param username User's username
 * @param additionalData Additional user data
 * @returns Object with success/error message and user data
 */
export async function addUserToCustomTable(
  userId: string,
  email: string,
  username: string,
  additionalData: Record<string, any> = {}
) {
  try {
    const { data, error } = await supabase.from('users').insert([
      {
        user_id: userId,
        email: email,
        username: username,
        registration_date: new Date().toISOString(),
        ...additionalData,
      },
    ]);

    if (error) {
      console.error('Custom Table Insert Error:', error.message);
      return { error: error.message };
    }

    return { success: 'User data added successfully', userData: data };
  } catch (error) {
    console.error('Error adding user data:', error);
    return { error: 'An unexpected error occurred while adding user data' };
  }
}

/**
 * Login a user with email and password
 * @param email User's email
 * @param password User's password
 * @returns Object with success/error message and session data
 */
export async function loginUser(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Login Error:', error.message);
      return { error: error.message };
    }

    return {
      success: 'Login successful',
      session: data.session,
      user: data.user,
    };
  } catch (error) {
    console.error('Unexpected login error:', error);
    return { error: 'An unexpected error occurred during login' };
  }
}

/**
 * Log out the current user
 * @returns Object with success/error message
 */
export async function logoutUser() {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Logout Error:', error.message);
      return { error: error.message };
    }

    return { success: 'Logged out successfully' };
  } catch (error) {
    console.error('Unexpected logout error:', error);
    return { error: 'An unexpected error occurred during logout' };
  }
}

/**
 * Get the current user's session
 * @returns Object with session data or null
 */
export async function getCurrentSession() {
  try {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.error('Session Error:', error.message);
      return { error: error.message };
    }

    return { session: data.session };
  } catch (error) {
    console.error('Unexpected session error:', error);
    return { error: 'An unexpected error occurred while getting session' };
  }
}

/**
 * Get user data from the custom users table
 * @param userId The user ID from Supabase Auth
 * @returns Object with user data or error
 */
export async function getUserData(userId: string) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Get User Data Error:', error.message);
      return { error: error.message };
    }

    return { userData: data };
  } catch (error) {
    console.error('Unexpected get user data error:', error);
    return { error: 'An unexpected error occurred while getting user data' };
  }
}
