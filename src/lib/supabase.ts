import { createClient } from '@supabase/supabase-js';

// Types for our database
export interface ActivationCode {
  id: string;
  phone: string;
  order_id: string;
  customer_name: string | null;
  customer_email: string | null;
  device_id: string | null;
  used: boolean;
  used_at: string | null;
  created_at: string;
}

export interface UserProfile {
  phone: string;
  name: string | null;
  firstName: string | null;
  email: string | null;
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
 * Verify if a phone number has a valid activation code
 * Checks if the device_id matches or if no device is registered yet
 */
export async function verifyActivationCode(phone: string, deviceId?: string): Promise<{
  valid: boolean;
  error?: string;
  code?: ActivationCode;
  profile?: UserProfile;
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

    // Check if already used on a different device
    if (data.used && data.device_id && deviceId && data.device_id !== deviceId) {
      return {
        valid: false,
        error: 'Ce numéro est déjà activé sur un autre appareil.'
      };
    }

    // If already used on same device, allow re-login
    if (data.used && data.device_id === deviceId) {
      const profile: UserProfile = {
        phone: data.phone,
        name: data.customer_name,
        firstName: data.customer_name?.split(' ')[0] || null,
        email: data.customer_email,
      };
      return { valid: true, code: data, profile };
    }

    // New activation
    const profile: UserProfile = {
      phone: data.phone,
      name: data.customer_name,
      firstName: data.customer_name?.split(' ')[0] || null,
      email: data.customer_email,
    };

    return { valid: true, code: data, profile };
  } catch (err) {
    console.error('Verification error:', err);
    return { valid: false, error: 'Erreur de vérification. Veuillez réessayer.' };
  }
}

/**
 * Activate a code and register the device
 */
export async function activateCode(phone: string, deviceId: string): Promise<{
  success: boolean;
  error?: string;
  profile?: UserProfile;
}> {
  try {
    // Call the server-side API that uses service_role key
    const response = await fetch('/api/activate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phone, deviceId }),
    });

    const result = await response.json();

    if (!result.success) {
      return { success: false, error: result.error || 'Erreur d\'activation.' };
    }

    return {
      success: true,
      profile: result.data?.profile
    };
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
        device_id: null,
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

/**
 * Transfer activation to a new device (admin function)
 */
export async function transferActivation(phone: string, newDeviceId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const normalizedPhone = normalizePhoneNumber(phone);

    const { error } = await supabase
      .from('activation_codes')
      .update({
        device_id: newDeviceId,
        used_at: new Date().toISOString(),
      })
      .eq('phone', normalizedPhone);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('Transfer activation error:', err);
    return { success: false, error: 'Erreur lors du transfert.' };
  }
}

/**
 * Get user profile by phone
 */
export async function getUserProfile(phone: string): Promise<UserProfile | null> {
  try {
    const normalizedPhone = normalizePhoneNumber(phone);

    const { data, error } = await supabase
      .from('activation_codes')
      .select('phone, customer_name, customer_email')
      .eq('phone', normalizedPhone)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      phone: data.phone,
      name: data.customer_name,
      firstName: data.customer_name?.split(' ')[0] || null,
      email: data.customer_email,
    };
  } catch (err) {
    console.error('Get profile error:', err);
    return null;
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

/**
 * Generate a unique device ID
 */
export function generateDeviceId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 15);
  return `device_${timestamp}_${randomPart}`;
}
