import { supabaseServer } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';

/* ============================================================
   SUBMISSION LUOMINEN
   ============================================================ */

export async function POST(request: Request) {
  const body = await request.json();

  if (
    typeof body.participantId !== 'string' ||
    body.participantId.trim() === ''
  ) {
    return Response.json({ error: 'Invalid participant ID' }, { status: 400 });
  }

  if (!body.data || typeof body.data !== 'object') {
    return Response.json({ error: 'Invalid submission data' }, { status: 400 });
  }

  // Haetaan participant id:n perusteella
  const { data: participant, error: participantError } = await supabaseServer
    .from('participant')
    .select('id, session_id')
    .eq('id', body.participantId)
    .single();

  if (participantError) {
    return Response.json({ error: participantError.message }, { status: 404 });
  }

  // Haetaan session state
  const { data: session, error: sessionError } = await supabaseServer
    .from('session')
    .select('state')
    .eq('id', participant.session_id)
    .single();

  if (sessionError) {
    return Response.json({ error: sessionError.message }, { status: 404 });
  }

  if (session.state !== 'active') {
    return Response.json({ error: 'Session is paused' }, { status: 403 });
  }

  const { data, error } = await supabaseServer
    .from('submission')
    .insert({
      session_id: participant.session_id,
      participant_id: participant.id,
      data: body.data,
    })
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(data, { status: 201 });
}

/* ============================================================
   SESSION SUBMISSION HAKEMINEN
   ============================================================ */

export async function GET() {
  const cookieStore = await cookies();
  const hostToken = cookieStore.get('host_token');

  if (!hostToken) {
    return Response.json({ error: 'Host token missing' }, { status: 401 });
  }

  // Haetaan host-tokenia vastaava sessio
  const { data: session, error: sessionError } = await supabaseServer
    .from('session')
    .select('id')
    .eq('host_token', hostToken.value)
    .single();

  if (sessionError) {
    return Response.json({ error: sessionError.message }, { status: 404 });
  }

  // Haetaan kaikki session submissionit
  const { data, error } = await supabaseServer
    .from('submission')
    .select('data')
    .eq('session_id', session.id);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(data, { status: 200 });
}
