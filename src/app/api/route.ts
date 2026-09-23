import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Tietokanta yhteyden testaamista
export async function GET() {
  const { data, error } = await supabase.from('session').select('*');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
