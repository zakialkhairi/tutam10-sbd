import { NextResponse } from 'next/server';
import { getWorkspaces, saveWorkspaces } from '@/lib/data';
import { Schedule } from '@/types';

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

  return NextResponse.json(workspace.schedules);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const workspaces = getWorkspaces();
    const workspaceIndex = workspaces.findIndex((w) => w.id === id);

    if (workspaceIndex === -1) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }

    const newSchedule: Schedule = {
      ...body,
      id: crypto.randomUUID(),
    };

    workspaces[workspaceIndex].schedules.push(newSchedule);
    saveWorkspaces(workspaces);

    return NextResponse.json(newSchedule, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create schedule' }, { status: 500 });
  }
}
