import { NextRequest, NextResponse } from "next/server";
import { generateAlerts } from "@/lib/prediction-engine";
import { getServiceClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = getServiceClient();
  const alerts = generateAlerts(50);

  // Fetch SMS logs from Supabase
  const { data: smsLogs } = await supabase
    .from("sms_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  return NextResponse.json({
    alerts,
    sms_log: (smsLogs || []).map((log) => ({
      id: log.id,
      timestamp: log.created_at,
      zone: log.zone,
      risk_category: log.risk_category,
      message: log.message,
      recipients: log.recipients,
      status: log.status,
    })),
  });
}

export async function POST(req: NextRequest) {
  const supabase = getServiceClient();
  const body = await req.json();
  const threshold = body.threshold ?? 50;
  const alerts = generateAlerts(threshold);

  // Persist SMS logs to Supabase
  const newLogs = alerts.map((alert) => ({
    id: `sms_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    zone: alert.zone,
    risk_category: alert.category,
    risk_score: alert.risk_score,
    message: alert.message,
    recipients: Math.floor(Math.random() * 5000) + 1000,
    status: "sent",
  }));

  if (newLogs.length > 0) {
    await supabase.from("sms_logs").insert(newLogs);
  }

  // Fetch updated log
  const { data: smsLogs } = await supabase
    .from("sms_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  return NextResponse.json({
    sent: newLogs.length,
    alerts: newLogs,
    sms_log: (smsLogs || []).map((log) => ({
      id: log.id,
      timestamp: log.created_at,
      zone: log.zone,
      risk_category: log.risk_category,
      message: log.message,
      recipients: log.recipients,
      status: log.status,
    })),
  });
}
