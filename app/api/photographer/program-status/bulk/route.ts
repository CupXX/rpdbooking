import { getCurrentPhotographerId } from "@/lib/auth";
import { hasContactMethod } from "@/lib/contactMethod";
import { jsonError, readJson } from "@/lib/http";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import type { Program } from "@/lib/types";
import { asBoolean } from "@/lib/validators";

export async function POST(request: Request) {
  const photographerId = await getCurrentPhotographerId();
  if (!photographerId) return jsonError("请先登录。", 401);

  const body = await readJson(request);
  const available = asBoolean(body?.available);
  if (available === null) return jsonError("缺少可接状态。");

  try {
    const supabase = getSupabaseAdmin();
    if (available) {
      const { data: photographerData, error: photographerError } = await supabase
        .from("photographers")
        .select("wechat, wechat_qr_path")
        .eq("id", photographerId)
        .maybeSingle();

      if (photographerError) throw photographerError;
      const photographer = photographerData as { wechat: string | null; wechat_qr_path: string | null } | null;
      if (!hasContactMethod(photographer?.wechat, photographer?.wechat_qr_path)) {
        return jsonError("请至少填写微信号或上传微信二维码后再开放可约。");
      }
    }

    const { data, error: programsError } = await supabase.from("programs").select("id");
    if (programsError) throw programsError;

    const programs = (data ?? []) as Pick<Program, "id">[];
    const rows = programs.map((program) => ({
      photographer_id: photographerId,
      program_id: program.id,
      available,
    }));

    if (rows.length > 0) {
      const { error } = await supabase
        .from("photographer_program_status")
        .upsert(rows, { onConflict: "photographer_id,program_id" });
      if (error) throw error;
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error(error);
    return jsonError("批量更新节目状态失败，请稍后重试。", 500);
  }
}
