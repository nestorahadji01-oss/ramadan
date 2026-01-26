import { createClient } from '@supabase/supabase-js';

// Types for our database
export interface ActivationCode {
  id: string;
  phone: string;
  order_id: string;
  customer_name: string | null;
  customer_email: string | null;
  used: boolean;
  used_at: string | null;
  created_at: string;
}

export interface EBook {
  id: string;
  title: string;
  author: string | null;
  category: string;
  description: string | null;
  file_url: string;
  cover_url: string | null;
  pages: number | null;
  created_at: string;
}

// Supabase client configuration
// Use fallback empty strings to prevent build errors - actual values required at runtime
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

// Create Supabase client (will fail at runtime if env vars not set, but allows build)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ========================================
// ACTIVATION CODE FUNCTIONS
// ========================================

/**
 * Verify if a phone number has a valid, unused activation code
 */
export async function verifyActivationCode(phone: string): Promise<{
  valid: boolean;
  error?: string;
  code?: ActivationCode;
}> {
  try {
    // Normalize phone number (remove spaces, ensure proper format)
    const normalizedPhone = normalizePhoneNumber(phone);

    const { data, error } = await supabase
      .from('activation_codes')
      .select('*')
      .eq('phone', normalizedPhone)
      .single();

    if (error || !data) {
      return { valid: false, error: 'Code d\'activation introuvable pour ce numéro.' };
    }

    if (data.used) {
      return { valid: false, error: 'Ce code a déjà été utilisé.' };
    }

    return { valid: true, code: data };
  } catch (err) {
    console.error('Verification error:', err);
    return { valid: false, error: 'Erreur de vérification. Veuillez réessayer.' };
  }
}

/**
 * Mark an activation code as used
 */
export async function activateCode(phone: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const normalizedPhone = normalizePhoneNumber(phone);

    const { error } = await supabase
      .from('activation_codes')
      .update({
        used: true,
        used_at: new Date().toISOString()
      })
      .eq('phone', normalizedPhone)
      .eq('used', false);

    if (error) {
      return { success: false, error: 'Erreur lors de l\'activation.' };
    }

    return { success: true };
  } catch (err) {
    console.error('Activation error:', err);
    return { success: false, error: 'Erreur d\'activation. Veuillez réessayer.' };
  }
}

/**
 * Create a new activation code (called from webhook)
 */
export async function createActivationCode(data: {
  phone: string;
  order_id: string;
  customer_name?: string;
  customer_email?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const normalizedPhone = normalizePhoneNumber(data.phone);

    // Check if code already exists for this phone
    const { data: existing } = await supabase
      .from('activation_codes')
      .select('id')
      .eq('phone', normalizedPhone)
      .single();

    if (existing) {
      return { success: true }; // Already exists, no need to create
    }

    const { error } = await supabase
      .from('activation_codes')
      .insert({
        phone: normalizedPhone,
        order_id: data.order_id,
        customer_name: data.customer_name || null,
        customer_email: data.customer_email || null,
        used: false,
      });

    if (error) {
      console.error('Create code error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('Create activation code error:', err);
    return { success: false, error: 'Failed to create activation code' };
  }
}

// ========================================
// E-BOOK FUNCTIONS
// ========================================

/**
 * Get all e-books
 */
export async function getEBooks(): Promise<EBook[]> {
  const { data, error } = await supabase
    .from('ebooks')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Get ebooks error:', error);
    return [];
  }

  return data || [];
}

/**
 * Get e-books by category
 */
export async function getEBooksByCategory(category: string): Promise<EBook[]> {
  const { data, error } = await supabase
    .from('ebooks')
    .select('*')
    .eq('category', category)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Get ebooks by category error:', error);
    return [];
  }

  return data || [];
}

/**
 * Get a single e-book by ID
 */
export async function getEBook(id: string): Promise<EBook | null> {
  const { data, error } = await supabase
    .from('ebooks')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Get ebook error:', error);
    return null;
  }

  return data;
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Normalize phone number to consistent format
 */
function normalizePhoneNumber(phone: string): string {
  // Remove all non-digit characters except +
  let normalized = phone.replace(/[^\d+]/g, '');

  // Ensure it starts with a +
  if (!normalized.startsWith('+')) {
    // Assume it's a local number, could add country code logic here
    normalized = '+' + normalized;
  }

  return normalized;
}
