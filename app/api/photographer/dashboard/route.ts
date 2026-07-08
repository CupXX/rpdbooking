import { getCurrentPhotographerId } from "@/lib/auth";
import { jsonError } from "@/lib/http";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import type { DashboardProgram, Photographer, Program } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const photographerId = await getCurrentPhotographerId();
  if (!photographerId) return jsonError("请先登录。", 401);

  try {
    const supabase = getSupabaseAdmin();
    const [{ data: photographerData, error: photographerError }, { data: programsData, error: programsError }, { data: statusData, error: statusError }] = await Promise.all([
      supabase
        .from("photographers")
        .select("id, photographer_code, display_name, wechat, sample_url, is_active")
        .eq("id", photographerId)
        .eq("is_active", true)
        .maybeSingle(),
      supabase
        .from("programs")
        .select("id, order_no, title, song_name, group_name, note")
        .order("order_no", { ascending: true }),
      supabase
        .from("photographer_program_status")
        .select("program_id, available")
        .eq("photographer_id", photographerId),
    ]);

    if (photographerError) throw photographerError;
    if (programsError) throw programsError;
    if (statusError) throw statusError;

    const photographer = photographerData as Photographer | null;
    if (!photographer) return jsonError("登录状态无效，请重新登录。", 401);

    const programs = (programsData ?? []) as Program[];
    const statusRows = (statusData ?? []) as Array<{ program_id: string; available: boolean }>;
    const statusByProgramId = new Map(statusRows.map((row) => [row.program_id, row.available]));

    const responsePrograms: DashboardProgram[] = programs.map((program) => ({
      ...program,
      available: statusByProgramId.get(program.id) ?? false,
    }));

    return Response.json({
      photographer: {
        display_name: photographer.display_name,
        wechat: photographer.wechat,
        sample_url: photographer.sample_url,
      },
      programs: responsePrograms,
    });
  } catch (error) {
    console.error(error);
    return jsonError("获取摄影管理数据失败，请稍后重试。", 500);
  }
}
