import { NextResponse } from 'next/server';
import { getWorkspaces, saveWorkspaces } from '@/lib/data';
import { Schedule } from '@/types';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; scheduleId: string }> }
) {
  try {
    const { id, scheduleId } = await params;
    const body = await request.json();
    const workspaces = getWorkspaces();
    const workspaceIndex = workspaces.findIndex((w) => w.id === id);

    if (workspaceIndex === -1) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }

    const scheduleIndex = workspaces[workspaceIndex].schedules.findIndex(
      (s) => s.id === scheduleId
    );

    if (scheduleIndex === -1) {
      return NextResponse.json({ error: 'Schedule not found' }, { status: 404 });
    }

    const updatedSchedule: Schedule = {
      ...workspaces[workspaceIndex].schedules[scheduleIndex],
      ...body,
      id: scheduleId, // ensure ID cannot be changed
    };

    workspaces[workspaceIndex].schedules[scheduleIndex] = updatedSchedule;
    saveWorkspaces(workspaces);

    return NextResponse.json(updatedSchedule);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update schedule' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; scheduleId: string }> }
) {
  const { id, scheduleId } = await params;
  const workspaces = getWorkspaces();
  const workspaceIndex = workspaces.findIndex((w) => w.id === id);

  if (workspaceIndex === -1) {
    return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
  }

  const newSchedules = workspaces[workspaceIndex].schedules.filter(
    (s) => s.id !== scheduleId
  );

  if (workspaces[workspaceIndex].schedules.length === newSchedules.length) {
    return NextResponse.json({ error: 'Schedule not found' }, { status: 404 });
  }

  workspaces[workspaceIndex].schedules = newSchedules;
  saveWorkspaces(workspaces);

  return new NextResponse(null, { status: 204 });
}
