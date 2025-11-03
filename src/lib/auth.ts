import { supabase } from "@/integrations/supabase/client";

export interface SignUpData {
  email: string;
  password: string;
  fullName: string;
}

export const signUp = async ({ email, password, fullName }: SignUpData) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          full_name: fullName,
        }
      }
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Sign up error:', error);
    return { data: null, error };
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Sign in error:', error);
    return { data: null, error };
  }
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Sign out error:', error);
    return { error };
  }
};

export const generateTOTPSecret = async () => {
  try {
    const { data, error } = await supabase.functions.invoke('generate-totp-secret');
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Generate TOTP error:', error);
    return { data: null, error };
  }
};

export const verifyTOTP = async (token: string) => {
  try {
    const { data, error } = await supabase.functions.invoke('verify-totp', {
      body: { token }
    });
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Verify TOTP error:', error);
    return { data: null, error };
  }
};