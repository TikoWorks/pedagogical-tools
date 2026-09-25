import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

// Tietokanta yhteyden testaamista
export async function GET() {
  const { data, error } = await supabaseServer.from('session').select('*');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
