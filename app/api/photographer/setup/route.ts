import { NextResponse } from "next/server";
import { clearSetupCookie, getSetupPhotographerCode, setSessionCookie } from "@/lib/auth";
import { jsonError, readJson } from "@/lib/http";
import { hashPassword } from "@/lib/password";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import type { Photographer } from "@/lib/types";
import { asNonEmptyString, asOptionalString, isLikelyUrl } from "@/lib/validators";

export async function POST(request: Request) {
  const body = await readJson(request);
  const photographerCode = asNonEmptyString(body?.photographer_code);
  const password = asNonEmptyString(body?.password);
  const wechat = asNonEmptyString(body?.wechat);
  const sampleUrl = asOptionalString(body?.sample_url);

  if (!photographerCode) return jsonError("缺少摄影 ID，请先从登录页进入首次设置。");
  if (!password) return jsonError("密码不能为空。");
  if (!wechat) return jsonError("微信号不能为空。");
  if (!isLikelyUrl(sampleUrl)) return jsonError("样片链接格式不正确。");

  const setupCode = await getSetupPhotographerCode();
  if (setupCode !== photographerCode) return jsonError("首次设置已过期，请重新输入摄影 ID。", 401);

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
    if (!photographer) return jsonError("未找到该摄影 ID，请确认是否已登记。", 404);
    if (photographer.password_hash) return jsonError("该摄影 ID 已设置密码，请直接登录。", 409);

    const passwordHash = await hashPassword(password);
    const { error: updateError } = await supabase
      .from("photographers")
      .update({ password_hash: passwordHash, wechat, sample_url: sampleUrl })
      .eq("id", photographer.id);

    if (updateError) throw updateError;

    const response = NextResponse.json({ success: true });
    clearSetupCookie(response);
    setSessionCookie(response, photographer.id);
    return response;
  } catch (error) {
    console.error(error);
    return jsonError("保存首次设置失败，请稍后重试。", 500);
  }
}
