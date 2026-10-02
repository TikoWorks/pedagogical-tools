import { supabaseServer } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';

// 6-merkkisen koodin generointi
function generateCode() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
  let code = '';

  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    code += characters[randomIndex];
  }

  return code;
}

/* ============================================================
   SESSIONIN LUOMINEN
   ============================================================ */

export async function POST(request: Request) {
  const body = await request.json();

  if (typeof body.name !== 'string' || body.name.trim() === '') {
    return Response.json({ error: 'Invalid session name' }, { status: 400 });
  }

  const joinCode = generateCode();
  const hostToken = crypto.randomUUID();

  const { data, error } = await supabaseServer
    .from('session')
    .insert({
      name: body.name.trim(),
      join_code: joinCode,
      host_token: hostToken,
      state: 'paused',
    })
    .select('id, name, join_code, state')
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  // Host tokenin tallennus evästeeseen
  const cookieStore = await cookies();

  cookieStore.set('host_token', hostToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 12,
  });

  return Response.json(data, { status: 201 });
}

/* ============================================================
   SESSIONIN HAKEMINEN
   ============================================================ */

export async function GET() {
  const cookieStore = await cookies();
  const hostToken = cookieStore.get('host_token');

  if (!hostToken) {
    return Response.json({ error: 'Host token missing' }, { status: 401 });
  }

  const { data, error } = await supabaseServer
    .from('session')
    .select('id, name, join_code, state')
    .eq('host_token', hostToken.value)
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 404 });
  }

  return Response.json(data, { status: 200 });
}

/* ============================================================
   SESSION PÄIVITTÄMINEN
   ============================================================ */

export async function PATCH(request: Request) {
  const body = await request.json();

  // Validoidaan state, jos se lähetettiin
  if (
    body.state !== undefined &&
    body.state !== 'active' &&
    body.state !== 'paused'
  ) {
    return Response.json({ error: 'Invalid session state' }, { status: 400 });
  }

  // Validoidaan name, jos se lähetettiin
  if (
    body.name !== undefined &&
    (typeof body.name !== 'string' || body.name.trim() === '')
  ) {
    return Response.json({ error: 'Invalid session name' }, { status: 400 });
  }

  const cookieStore = await cookies();

  // Haetaan host token
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

  // Muodostetaan päivitettävät kentät
  const updates: {
    state?: 'active' | 'paused';
    name?: string;
  } = {};

  if (body.state !== undefined) {
    updates.state = body.state;
  }

  if (body.name !== undefined) {
    updates.name = body.name.trim();
  }

  // Päivitetään sessio
  const { data, error } = await supabaseServer
    .from('session')
    .update(updates)
    .eq('id', session.id)
    .select('id, name, join_code, state')
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(data, { status: 200 });
}

/* ============================================================
   SESSION JA SIIHEN LIITTYVÄN DATAN POISTAMINEN
   ============================================================ */

export async function DELETE() {
  const cookieStore = await cookies();
  const hostToken = cookieStore.get('host_token');

  if (!hostToken) {
    return Response.json({ error: 'Host token missing' }, { status: 401 });
  }

  const { data, error } = await supabaseServer
    .from('session')
    .delete()
    .eq('host_token', hostToken.value)
    .select('id, name, join_code, state')
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  cookieStore.delete('host_token');

  return Response.json(data, { status: 200 });
}
