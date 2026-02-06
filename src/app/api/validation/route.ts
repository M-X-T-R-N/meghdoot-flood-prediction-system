import { NextResponse } from "next/server";
import { validatePredictions } from "@/lib/prediction-engine";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(validatePredictions());
}
