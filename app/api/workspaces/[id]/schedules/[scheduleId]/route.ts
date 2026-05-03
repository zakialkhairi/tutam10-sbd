import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; scheduleId: string }> }
) {
  try {
    const { scheduleId } = await params;
    const body = await request.json();
    console.log("PUT SCHEDULE BODY:", body);

    // Exclude read-only fields
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _, created_at, workspaces_id, ...updateData } = body;

    const { data, error } = await supabase
      .from('schedules')
      .update({ ...updateData })
      .eq('id', scheduleId)
      .select();

    if (error) {
      console.error("SUPABASE ERROR (PUT Schedule):", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const updated = data?.[0];
    if (!updated) {
      return NextResponse.json({ error: 'Schedule not found' }, { status: 404 });
    }

    console.log("SUCCESS PUT SCHEDULE:", updated);
    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("SERVER ERROR (PUT Schedule):", error);
    return NextResponse.json({ error: 'Failed to update schedule' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; scheduleId: string }> }
) {
  const { scheduleId } = await params;
  
  const { error } = await supabase
    .from('schedules')
    .delete()
    .eq('id', scheduleId);

  if (error) {
    console.error("SUPABASE ERROR (DELETE Schedule):", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return new NextResponse(null, { status: 204 });
}

