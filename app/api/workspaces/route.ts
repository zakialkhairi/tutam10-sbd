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
    const newWorkspace = {
      id: crypto.randomUUID(),
      name: body.name || 'New Workspace',
    };

    const { data, error } = await supabase
      .from('workspaces')
      .insert([newWorkspace])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(normalizeWorkspace({ ...data, schedules: [] }), { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create workspace' }, { status: 500 });
  }
}
