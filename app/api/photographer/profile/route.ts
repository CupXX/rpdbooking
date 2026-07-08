import { getCurrentPhotographerId } from "@/lib/auth";
import { jsonError, readJson } from "@/lib/http";
import { hashPassword } from "@/lib/password";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { asNonEmptyString, asOptionalString, isLikelyUrl } from "@/lib/validators";

export async function POST(request: Request) {
  const photographerId = await getCurrentPhotographerId();
  if (!photographerId) return jsonError("请先登录。", 401);

  const body = await readJson(request);
  const wechat = asNonEmptyString(body?.wechat);
  const sampleUrl = asOptionalString(body?.sample_url);
  const password = asOptionalString(body?.password);

  if (!wechat) return jsonError("微信号不能为空。");
  if (!isLikelyUrl(sampleUrl)) return jsonError("样片链接格式不正确。");

  try {
    const updates: { wechat: string; sample_url: string | null; password_hash?: string } = {
      wechat,
      sample_url: sampleUrl,
    };

    if (password) updates.password_hash = await hashPassword(password);

    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("photographers").update(updates).eq("id", photographerId);
    if (error) throw error;

    return Response.json({ success: true });
  } catch (error) {
    console.error(error);
    return jsonError("更新资料失败，请稍后重试。", 500);
  }
}
