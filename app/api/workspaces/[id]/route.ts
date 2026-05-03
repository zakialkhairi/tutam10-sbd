import { NextResponse } from 'next/server';
import { getWorkspaces, saveWorkspaces } from '@/lib/data';

export const dynamic = 'force-dynamic';
import { Workspace } from '@/types';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const workspaces = getWorkspaces();
  const workspace = workspaces.find((w) => w.id === id);

  if (!workspace) {
    return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
  }

  return NextResponse.json(workspace);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const workspaces = getWorkspaces();
    const index = workspaces.findIndex((w) => w.id === id);

    if (index === -1) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }

    const updatedWorkspace: Workspace = {
      ...workspaces[index],
      ...body,
      id, // ensure ID cannot be changed
    };

    workspaces[index] = updatedWorkspace;
    saveWorkspaces(workspaces);

    return NextResponse.json(updatedWorkspace);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update workspace' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const workspaces = getWorkspaces();
  const newWorkspaces = workspaces.filter((w) => w.id !== id);

  if (workspaces.length === newWorkspaces.length) {
    return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
  }

  saveWorkspaces(newWorkspaces);
  return NextResponse.json({ success: true });
}
