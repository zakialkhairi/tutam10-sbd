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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { data, error } = await supabase
    .from('workspaces')
    .select('*, schedules(*)')
    .eq('id', id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
  }

  return NextResponse.json(normalizeWorkspace(data));
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Exclude schedules from update data as they live in a separate table
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { schedules, ...updateData } = body;

    const { data, error } = await supabase
      .from('workspaces')
      .update({ ...updateData })
      .eq('id', id)
      .select('*, schedules(*)')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(normalizeWorkspace(data));
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update workspace' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  const { error } = await supabase
    .from('workspaces')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
