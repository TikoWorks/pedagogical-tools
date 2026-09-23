import { supabaseServer } from '@/lib/supabaseServer';

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

  return Response.json(data, { status: 201 });
}
