import { supabaseServer } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';

//6-merkkisen koodin generointi
function generateCode() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
  let code = '';

  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    code += characters[randomIndex];
  }

  return code;
}

// Sessionin luominen tietokantaan
export async function POST(request: Request) {
  const body = await request.json();

  const joinCode = generateCode();
  const hostToken = crypto.randomUUID();

  const { data, error } = await supabaseServer
    .from('session')
    .insert({
      name: body.name,
      join_code: joinCode,
      host_token: hostToken,
      state: 'active',
    })
    .select()
    .single();

  if (error) {
    console.log(error);
    return Response.json({ error: error.message }, { status: 500 });
  }

  // Host tokenin tallennus evästeeseen
  const cookieStore = await cookies();
  cookieStore.set('host_token', hostToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24,
  });

  return Response.json(data, { status: 201 });
}

// Session tilan (state) päivitys
export async function PATCH(request: Request) {
  const body = await request.json();
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

  // Päivitetään session tila
  const { data, error } = await supabaseServer
    .from('session')
    .update({ state: body.state })
    .eq('id', session.id)
    .select()
    .single();

  if (error) {
    console.log(error);
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(data, { status: 200 });
}
