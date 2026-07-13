import type { SupabaseClient } from "@supabase/supabase-js";

export const WECHAT_QR_BUCKET = "photographer-wechat-qrs";
export const WECHAT_QR_MAX_SIZE_BYTES = 2 * 1024 * 1024;

export function getWechatQrPublicUrl(supabase: SupabaseClient, path: string | null | undefined) {
  if (!path) return null;
  return supabase.storage.from(WECHAT_QR_BUCKET).getPublicUrl(path).data.publicUrl;
}
