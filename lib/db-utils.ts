import { supabase } from '@/lib/supabaseClient';

// User-related functions
export const getUserProfile = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) return null;

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('user_id', session.user.id)
    .single();

  if (error) throw error;
  return data;
};

export const updateUserProfile = async (updates: { username?: string }) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('user_id', session.user.id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Product-related functions
export const getProducts = async (limit = 10) => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .limit(limit);

  if (error) throw error;
  return data;
};

export const getProductById = async (productId: number) => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('product_id', productId)
    .single();

  if (error) throw error;
  return data;
};

// Order-related functions
export const getOrders = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('orders')
    .select(
      `
      order_id,
      quantity,
      order_date,
      products (
        product_id,
        name,
        price,
        image_url
      )
    `
    )
    .eq('user_id', session.user.id);

  if (error) throw error;
  return data;
};

export const createOrder = async (productId: number, quantity: number) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('orders')
    .insert({
      user_id: session.user.id,
      product_id: productId,
      quantity: quantity,
      order_date: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getTransactions = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
};
