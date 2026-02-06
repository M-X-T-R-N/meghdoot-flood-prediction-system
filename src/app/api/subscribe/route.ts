import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// GET: list subscribers (admin)
export async function GET() {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("subscribers")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ subscribers: data || [] });
}

// POST: register a new subscriber
export async function POST(req: NextRequest) {
  const supabase = getServiceClient();
  const body = await req.json();
  const { name, phone, area, language } = body;

  if (!name || !phone || !area) {
    return NextResponse.json(
      { error: "Name, phone, and area are required" },
      { status: 400 }
    );
  }

  // Normalize phone (strip spaces, dashes)
  const normalizedPhone = phone.replace(/[\s-]/g, "");

  // Check for duplicate
  const { data: existing } = await supabase
    .from("subscribers")
    .select("id")
    .eq("phone", normalizedPhone)
    .limit(1);

  if (existing && existing.length > 0) {
    return NextResponse.json(
      { error: "Phone already registered", code: "DUPLICATE" },
      { status: 409 }
    );
  }

  const { data, error } = await supabase
    .from("subscribers")
    .insert({
      name: name.trim(),
      phone: normalizedPhone,
      area,
      language: language || "bn",
      active: true,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ subscriber: data });
}
