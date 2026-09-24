import { supabaseServer } from '@/lib/supabaseServer';

// Participant luominen tietokantaan
export async function POST(request: Request) {
  const body = await request.json();

  //Haetaan session id join coden perusteella kannasta
  const { data: session, error: sessionError } = await supabaseServer
    .from('session')
    .select('id')
    .eq('join_code', body.joinCode)
    .single();

  if (sessionError) {
    return Response.json({ error: sessionError.message }, { status: 404 });
  }

  const { data, error } = await supabaseServer
    .from('participant')
    .insert({ session_id: session.id })
    .select()
    .single();

  if (error) {
    console.log(error);
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(data, { status: 201 });
}
