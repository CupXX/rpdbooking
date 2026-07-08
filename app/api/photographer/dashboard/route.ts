import { getCurrentPhotographerId } from "@/lib/auth";
import { jsonError } from "@/lib/http";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import type { Dancer, DashboardProgram, Photographer, Program } from "@/lib/types";

export const dynamic = "force-dynamic";

type MaybeArray<T> = T | T[] | null;

type ProgramDancerRow = {
  program_id: string;
  dancers: MaybeArray<Pick<Dancer, "nickname" | "display_name">>;
};

function firstRelated<T>(value: MaybeArray<T>) {
  return Array.isArray(value) ? value[0] ?? null : value;
}

export async function GET() {
  const photographerId = await getCurrentPhotographerId();
  if (!photographerId) return jsonError("请先登录。", 401);

  try {
    const supabase = getSupabaseAdmin();
    const [
      { data: photographerData, error: photographerError },
      { data: programsData, error: programsError },
      { data: statusData, error: statusError },
      { data: dancersData, error: dancersError },
    ] = await Promise.all([
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
      supabase
        .from("program_dancers")
        .select("program_id, dancers(nickname, display_name)"),
    ]);

    if (photographerError) throw photographerError;
    if (programsError) throw programsError;
    if (statusError) throw statusError;
    if (dancersError) throw dancersError;

    const photographer = photographerData as Photographer | null;
    if (!photographer) return jsonError("登录状态无效，请重新登录。", 401);

    const programs = (programsData ?? []) as Program[];
    const statusRows = (statusData ?? []) as Array<{ program_id: string; available: boolean }>;
    const statusByProgramId = new Map(statusRows.map((row) => [row.program_id, row.available]));
    const dancersByProgramId = new Map<string, Array<Pick<Dancer, "nickname" | "display_name">>>();

    for (const row of (dancersData ?? []) as unknown as ProgramDancerRow[]) {
      const dancer = firstRelated(row.dancers);
      if (!dancer) continue;
      const existing = dancersByProgramId.get(row.program_id) ?? [];
      existing.push(dancer);
      dancersByProgramId.set(row.program_id, existing);
    }

    const responsePrograms: DashboardProgram[] = programs.map((program) => ({
      ...program,
      dancers: dancersByProgramId.get(program.id) ?? [],
      available: statusByProgramId.get(program.id) ?? false,
    }));

    return Response.json({
      photographer: {
        photographer_code: photographer.photographer_code,
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
