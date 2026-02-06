import { NextRequest, NextResponse } from "next/server";
import { generateAlerts } from "@/lib/prediction-engine";
import { getServiceClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// Bengali SMS templates based on risk category
function getBengaliMessage(zone: string, category: string, score: number): string {
  switch (category) {
    case "Severe":
      return `[মেঘদূত জরুরি সতর্কতা] ${zone} এলাকায় বন্যার ঝুঁকি অত্যন্ত বেশি (স্কোর: ${score}/১০০)। পরবর্তী ১২ ঘণ্টায় পানি দ্রুত বাড়তে পারে। অনুগ্রহ করে এখনই নিরাপদ উঁচু স্থানে যান। মূল্যবান জিনিসপত্র সরিয়ে রাখুন। এটি সরকারি সতর্কতা নয়।`;
    case "Warning":
      return `[মেঘদূত সতর্কতা] ${zone} এলাকায় বন্যার ঝুঁকি বেশি (স্কোর: ${score}/১০০)। আগামী ১২-২৪ ঘণ্টায় পানি বাড়তে পারে। প্রস্তুত থাকুন এবং নিরাপদ স্থান চিহ্নিত করুন। শিশু ও বৃদ্ধদের সরিয়ে নিন। এটি সরকারি সতর্কতা নয়।`;
    case "Watch":
      return `[মেঘদূত পর্যবেক্ষণ] ${zone} এলাকায় বন্যার সম্ভাবনা আছে (স্কোর: ${score}/১০০)। নদীর পানি বাড়ছে। সতর্ক থাকুন এবং খবর রাখুন। প্রয়োজনে জরুরি জিনিসপত্র গুছিয়ে রাখুন। এটি সরকারি সতর্কতা নয়।`;
    default:
      return `[মেঘদূত আপডেট] ${zone} এলাকায় বন্যার ঝুঁকি কম (স্কোর: ${score}/১০০)। বর্তমানে পরিস্থিতি স্বাভাবিক। আমরা নজর রাখছি। এটি সরকারি সতর্কতা নয়।`;
  }
}

function getEnglishMessage(zone: string, category: string, score: number, explanation: string): string {
  return `[Meghdoot Alert] Flood risk ${category.toUpperCase()} in ${zone} within next 12 hours (score: ${score}/100). ${explanation}. Stay alert. This is not an official government warning.`;
}

export async function GET() {
  const supabase = getServiceClient();
  const alerts = generateAlerts(50);

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
      message_en: log.message_en || log.message || "",
      message_bn: log.message_bn || "",
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

  const newLogs = alerts.map((alert) => ({
    zone: alert.zone,
    risk_category: alert.category,
    risk_score: alert.risk_score,
    message_en: getEnglishMessage(alert.zone, alert.category, alert.risk_score, alert.message),
    message_bn: getBengaliMessage(alert.zone, alert.category, alert.risk_score),
    recipients: Math.floor(Math.random() * 5000) + 1000,
    status: "sent",
  }));

  if (newLogs.length > 0) {
    await supabase.from("sms_logs").insert(newLogs);
  }

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
      message_en: log.message_en || log.message || "",
      message_bn: log.message_bn || "",
      recipients: log.recipients,
      status: log.status,
    })),
  });
}
