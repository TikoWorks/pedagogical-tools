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

  // Haetaan session join-koodin perusteella.
  // maybeSingle() palauttaa nullin, jos sessiota ei löydy,
  // eikä kaadu samalla tavalla kuin single().
  const { data: session, error: sessionError } = await supabaseServer
    .from('session')
    .select('id')
    .eq('join_code', body.joinCode.trim().toUpperCase())
    .maybeSingle();

  // Jos tietokantakysely epäonnistuu, palautetaan virhe
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

  // Jos participantin luonti epäonnistuu, palautetaan palvelinvirhe
  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  // Palautetaan luotu participant onnistuneesti
  return Response.json(data, { status: 201 });
}
