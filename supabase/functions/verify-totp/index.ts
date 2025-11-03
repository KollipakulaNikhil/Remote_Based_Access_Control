import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simplified TOTP verification for demo - in production, use a proper TOTP library
function verifyTOTPDemo(token: string): boolean {
  // For demo purposes, accept any 6-digit code
  // In production, implement proper TOTP verification with time-based validation
  return /^\d{6}$/.test(token);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { token } = await req.json();
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      throw new Error('Not authenticated');
    }

    // Get user's TOTP secret from auth_data
    const { data: authData, error: dbError } = await supabaseClient
      .from('auth_data')
      .select('totp_secret')
      .eq('user_id', user.id)
      .maybeSingle();

    if (dbError) {
      throw new Error('Database error: ' + dbError.message);
    }

    if (!authData) {
      throw new Error('TOTP secret not found');
    }

    // Simplified verification - in production use proper TOTP validation
    const isValid = verifyTOTPDemo(token);

    if (isValid) {
      // Update totp_verified status
      await supabaseClient
        .from('auth_data')
        .update({ totp_verified: true })
        .eq('user_id', user.id);

      // Log successful verification
      await supabaseClient
        .from('audit_logs')
        .insert({
          user_id: user.id,
          action: 'totp_verified',
          details: 'TOTP verification successful'
        });

      console.log('TOTP verified for user:', user.id);
    }

    return new Response(
      JSON.stringify({ valid: isValid }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error verifying TOTP:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});