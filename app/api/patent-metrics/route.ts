import { NextResponse } from "next/server";
import { getPatentData } from "@/lib/patent-data";

export const revalidate = 3600;

export async function GET() {
  const data = await getPatentData();
  return NextResponse.json(
    { ok: true, ...data },
    {
      headers: {
        "X-Robots-Tag": "noindex, nofollow"
      }
    }
  );
}
