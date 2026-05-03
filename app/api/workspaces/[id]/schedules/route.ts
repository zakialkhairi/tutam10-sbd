import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { data, error } = await supabase
    .from('schedules')
    .select('*')
    .eq('workspaces_id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data || []);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    console.log("POST SCHEDULE BODY:", body);

    const newSchedule = {
      ...body,
      id: crypto.randomUUID(),
      workspaces_id: id,
      created_at: new Date().toISOString(),
    };

    console.log("INSERT SCHEDULE DATA:", newSchedule);

    const { data, error } = await supabase
      .from('schedules')
      .insert([newSchedule])
      .select();

    if (error) {
      console.error("SUPABASE ERROR (POST Schedule):", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const inserted = data?.[0];
    console.log("SUCCESS POST SCHEDULE:", inserted);

    return NextResponse.json(inserted, { status: 201 });
  } catch (error: any) {
    console.error("SERVER ERROR (POST Schedule):", error);
    return NextResponse.json({ error: 'Failed to create schedule' }, { status: 500 });
  }
}

