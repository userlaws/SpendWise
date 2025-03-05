import { supabase } from './supabaseClient';

export const getCurrentUser = async () => {
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) throw error;
    if (!session) return null;

    return session.user;
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
};

export const checkUserAuth = async () => {
  const user = await getCurrentUser();
  return !!user;
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Sign out error:', error);
    return false;
  }
};
