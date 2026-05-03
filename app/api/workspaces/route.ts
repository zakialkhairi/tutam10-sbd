import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

function normalizeWorkspace(workspace: any) {
  return {
    ...workspace,
    createdAt:
      workspace.createdAt ??
      (workspace.created_at ? new Date(workspace.created_at).getTime() : Date.now()),
    schedules: workspace.schedules ?? [],
  };
}

export async function GET() {
  const { data, error } = await supabase
    .from('workspaces')
    .select('*, schedules(*)');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json((data || []).map(normalizeWorkspace));
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("BODY:", body);

    const newWorkspace = {
      id: crypto.randomUUID(),
      name: body.name || 'New Workspace',
      created_at: new Date().toISOString(),
    };

    console.log("INSERT DATA:", newWorkspace);

    const { data, error } = await supabase
      .from('workspaces')
      .insert([newWorkspace])
      .select();

    if (error) {
      console.error("SUPABASE ERROR:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const inserted = data?.[0];

    console.log("SUCCESS:", inserted);

    return NextResponse.json(
      {
        ...inserted,
        createdAt: new Date(inserted.created_at).getTime(),
        schedules: [],
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("SERVER ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}