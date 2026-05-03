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

    const { data, error } = await supabase
      .from('schedules')
      .update({ ...body, id: scheduleId })
      .eq('id', scheduleId)
      .select()
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Schedule not found' }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return new NextResponse(null, { status: 204 });
}
