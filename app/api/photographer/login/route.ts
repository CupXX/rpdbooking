import { NextResponse } from "next/server";
import { setSessionCookie } from "@/lib/auth";
import { jsonError, readJson } from "@/lib/http";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import type { Photographer } from "@/lib/types";
import { asNonEmptyString } from "@/lib/validators";

export async function POST(request: Request) {
  const body = await readJson(request);
  const photographerCode = asNonEmptyString(body?.photographer_code);

  if (!photographerCode) return jsonError("请选择摄影。");

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("photographers")
      .select("id, photographer_code, display_name, wechat, sample_url, is_active")
      .eq("photographer_code", photographerCode)
      .eq("is_active", true)
      .maybeSingle();

    if (error) throw error;
    const photographer = data as Photographer | null;

    if (!photographer) {
      return NextResponse.json(
        { success: false, message: "未找到该摄影，请确认是否已登记。" },
        { status: 404 },
      );
    }

    const response = NextResponse.json({ success: true });
    setSessionCookie(response, photographer.id);
    return response;
  } catch (error) {
    console.error(error);
    return jsonError("选择摄影失败，请稍后重试。", 500);
  }
}
