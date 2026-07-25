import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/login';

  if (code) {
    // Exchange the auth code for a valid Supabase session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error && data?.user) {
      // Fetch user profile role to determine redirect path
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      if (profile) {
        let redirectPath = '/menu';
        if (profile.role === 'admin') redirectPath = '/dashboard';
        else if (profile.role === 'staff') redirectPath = '/dashboard/orders';
        return NextResponse.redirect(`${origin}${redirectPath}`);
      }
    }
  }

  return NextResponse.redirect(`${origin}${next}`);
}
