import { getCurrentPhotographerId } from "@/lib/auth";
import { jsonError, readJson } from "@/lib/http";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { asBoolean, asNonEmptyString } from "@/lib/validators";

export async function POST(request: Request) {
  const photographerId = await getCurrentPhotographerId();
  if (!photographerId) return jsonError("请先登录。", 401);

  const body = await readJson(request);
  const programId = asNonEmptyString(body?.program_id);
  const available = asBoolean(body?.available);

  if (!programId) return jsonError("缺少节目 ID。");
  if (available === null) return jsonError("缺少可接状态。");

  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from("photographer_program_status")
      .upsert(
        { photographer_id: photographerId, program_id: programId, available },
        { onConflict: "photographer_id,program_id" },
      );

    if (error) throw error;
    return Response.json({ success: true });
  } catch (error) {
    console.error(error);
    return jsonError("更新节目状态失败，请稍后重试。", 500);
  }
}
