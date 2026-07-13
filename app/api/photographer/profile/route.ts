import { getCurrentPhotographerId } from "@/lib/auth";
import { hasContactMethod } from "@/lib/contactMethod";
import { jsonError, readJson } from "@/lib/http";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { asOptionalString, isLikelyUrl } from "@/lib/validators";

export async function POST(request: Request) {
  const photographerId = await getCurrentPhotographerId();
  if (!photographerId) return jsonError("请先登录。", 401);

  const body = await readJson(request);
  const wechat = asOptionalString(body?.wechat);
  const sampleUrl = asOptionalString(body?.sample_url);

  if (!isLikelyUrl(sampleUrl)) return jsonError("样片链接格式不正确。");

  try {
    const supabase = getSupabaseAdmin();
    const { data: photographerData, error: photographerError } = await supabase
      .from("photographers")
      .select("wechat_qr_path")
      .eq("id", photographerId)
      .maybeSingle();

    if (photographerError) throw photographerError;
    const photographer = photographerData as { wechat_qr_path: string | null } | null;
    if (!hasContactMethod(wechat, photographer?.wechat_qr_path)) {
      return jsonError("请至少填写微信号或上传微信二维码。");
    }

    const { error } = await supabase
      .from("photographers")
      .update({ wechat, sample_url: sampleUrl })
      .eq("id", photographerId);

    if (error) throw error;

    return Response.json({ success: true });
  } catch (error) {
    console.error(error);
    return jsonError("更新资料失败，请稍后重试。", 500);
  }
}
