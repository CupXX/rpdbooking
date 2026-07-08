import { NextResponse } from "next/server";
import { setSessionCookie, setSetupCookie } from "@/lib/auth";
import { jsonError, readJson } from "@/lib/http";
import { verifyPassword } from "@/lib/password";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import type { Photographer } from "@/lib/types";
import { asNonEmptyString } from "@/lib/validators";

export async function POST(request: Request) {
  const body = await readJson(request);
  const photographerCode = asNonEmptyString(body?.photographer_code);
  const password = typeof body?.password === "string" ? body.password : "";

  if (!photographerCode) return jsonError("请输入摄影 ID。");

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("photographers")
      .select("id, photographer_code, display_name, password_hash, wechat, sample_url, is_active")
      .eq("photographer_code", photographerCode)
      .eq("is_active", true)
      .maybeSingle();

    if (error) throw error;
    const photographer = data as Photographer | null;

    if (!photographer) {
      return NextResponse.json(
        { success: false, message: "未找到该摄影 ID，请确认是否已登记。" },
        { status: 404 },
      );
    }

    if (!photographer.password_hash) {
      const response = NextResponse.json({
        success: true,
        needs_setup: true,
        photographer_code: photographer.photographer_code,
        display_name: photographer.display_name,
      });
      setSetupCookie(response, photographer.photographer_code);
      return response;
    }

    if (!password) return jsonError("请输入密码。");

    const passwordMatches = await verifyPassword(password, photographer.password_hash);
    if (!passwordMatches) return jsonError("摄影 ID 或密码不正确。", 401);

    const response = NextResponse.json({ success: true, needs_setup: false });
    setSessionCookie(response, photographer.id);
    return response;
  } catch (error) {
    console.error(error);
    return jsonError("登录失败，请稍后重试。", 500);
  }
}
