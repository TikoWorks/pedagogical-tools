import { supabaseServer } from '@/lib/supabaseServer';

/* ============================================================
   PARTICIPANT LUOMINEN
   ============================================================ */

export async function POST(request: Request) {
  const body = await request.json();

  // Tarkistetaan, että joinCode tuli pyynnössä ja että se ei ole tyhjä
  if (typeof body.joinCode !== 'string' || body.joinCode.trim() === '') {
    return Response.json({ error: 'Invalid join code' }, { status: 400 });
  }

  // Haetaan sessio join coden perusteella kannasta
  const { data: session, error: sessionError } = await supabaseServer
    .from('session')
    .select('id, state')
    .eq('join_code', body.joinCode.trim().toUpperCase())
    .maybeSingle();

  if (sessionError) {
    return Response.json({ error: sessionError.message }, { status: 404 });
  }

  // Jos join-koodilla ei löydy sessiota, palautetaan selkeä 404-virhe
  if (!session) {
    return Response.json({ error: 'Session not found' }, { status: 404 });
  }

  // Luodaan uusi participant löydettyyn sessioniin
  const { data, error } = await supabaseServer
    .from('participant')
    .insert({ session_id: session.id })
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(
    {
      ...data,
      sessionId: session.id,
      state: session.state,
    },
    { status: 201 },
  );
}
