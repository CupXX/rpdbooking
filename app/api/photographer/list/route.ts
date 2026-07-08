import { jsonError } from "@/lib/http";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import type { PhotographerOption } from "@/lib/types";

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("photographers")
      .select("photographer_code, display_name")
      .eq("is_active", true)
      .order("display_name", { ascending: true });

    if (error) throw error;

    return Response.json({ photographers: (data ?? []) as PhotographerOption[] });
  } catch (error) {
    console.error(error);
    return jsonError("获取摄影名单失败，请稍后重试。", 500);
  }
}
