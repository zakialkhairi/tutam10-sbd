import { NextResponse } from 'next/server';
import { getWorkspaces, saveWorkspaces } from '@/lib/data';
import { Workspace } from '@/types';

export async function GET() {
  const workspaces = getWorkspaces();
  return NextResponse.json(workspaces);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newWorkspace: Workspace = {
      id: crypto.randomUUID(),
      name: body.name || 'New Workspace',
      schedules: [],
      createdAt: Date.now(),
    };

    const workspaces = getWorkspaces();
    workspaces.push(newWorkspace);
    saveWorkspaces(workspaces);

    return NextResponse.json(newWorkspace, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create workspace' }, { status: 500 });
  }
}
