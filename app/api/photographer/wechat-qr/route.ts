import { getCurrentPhotographerId } from "@/lib/auth";
import { isWechatQrMimeType, wechatQrExtensionForMimeType } from "@/lib/contactMethod";
import { jsonError } from "@/lib/http";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { getWechatQrPublicUrl, WECHAT_QR_BUCKET, WECHAT_QR_MAX_SIZE_BYTES } from "@/lib/wechatQr";

export async function POST(request: Request) {
  const photographerId = await getCurrentPhotographerId();
  if (!photographerId) return jsonError("请先登录。", 401);

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) return jsonError("请上传微信二维码图片。");
  if (file.size <= 0) return jsonError("图片不能为空。");
  if (file.size > WECHAT_QR_MAX_SIZE_BYTES) return jsonError("图片不能超过 2MB。");
  if (!isWechatQrMimeType(file.type)) return jsonError("只支持 PNG、JPG 或 WebP 图片。");

  try {
    const supabase = getSupabaseAdmin();
    const { data: currentData, error: currentError } = await supabase
      .from("photographers")
      .select("wechat_qr_path")
      .eq("id", photographerId)
      .maybeSingle();

    if (currentError) throw currentError;

    const extension = wechatQrExtensionForMimeType(file.type);
    const nextPath = `${photographerId}/wechat-qr.${extension}`;
    const { error: uploadError } = await supabase.storage
      .from(WECHAT_QR_BUCKET)
      .upload(nextPath, file, { contentType: file.type, upsert: true });

    if (uploadError) throw uploadError;

    const { error: updateError } = await supabase
      .from("photographers")
      .update({ wechat_qr_path: nextPath })
      .eq("id", photographerId);

    if (updateError) throw updateError;

    const currentPath = (currentData as { wechat_qr_path: string | null } | null)?.wechat_qr_path;
    if (currentPath && currentPath !== nextPath) {
      await supabase.storage.from(WECHAT_QR_BUCKET).remove([currentPath]);
    }

    return Response.json({ success: true, wechat_qr_url: getWechatQrPublicUrl(supabase, nextPath) });
  } catch (error) {
    console.error(error);
    return jsonError("上传微信二维码失败，请稍后重试。", 500);
  }
}

export async function DELETE() {
  const photographerId = await getCurrentPhotographerId();
  if (!photographerId) return jsonError("请先登录。", 401);

  try {
    const supabase = getSupabaseAdmin();
    const { data: currentData, error: currentError } = await supabase
      .from("photographers")
      .select("wechat_qr_path")
      .eq("id", photographerId)
      .maybeSingle();

    if (currentError) throw currentError;
    const currentPath = (currentData as { wechat_qr_path: string | null } | null)?.wechat_qr_path;

    if (currentPath) {
      await supabase.storage.from(WECHAT_QR_BUCKET).remove([currentPath]);
    }

    const { error: updateError } = await supabase
      .from("photographers")
      .update({ wechat_qr_path: null })
      .eq("id", photographerId);

    if (updateError) throw updateError;

    return Response.json({ success: true, wechat_qr_url: null });
  } catch (error) {
    console.error(error);
    return jsonError("删除微信二维码失败，请稍后重试。", 500);
  }
}
