import { jsonError, readJson } from "@/lib/http";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import type { Dancer, DancerSearchProgram, Photographer, Program } from "@/lib/types";
import { asNonEmptyString } from "@/lib/validators";
import { getWechatQrPublicUrl } from "@/lib/wechatQr";

type MaybeArray<T> = T | T[] | null;

type ProgramDancerProgramRow = {
  programs: MaybeArray<Program>;
};

type ProgramDancerDancerRow = {
  program_id: string;
  dancers: MaybeArray<Pick<Dancer, "nickname" | "display_name">>;
};

type AvailablePhotographerRow = {
  program_id: string;
  photographers: MaybeArray<Pick<Photographer, "id" | "display_name" | "wechat" | "wechat_qr_path" | "sample_url" | "is_active">>;
};

function firstRelated<T>(value: MaybeArray<T>) {
  return Array.isArray(value) ? value[0] ?? null : value;
}

export async function POST(request: Request) {
  const body = await readJson(request);
  const nickname = asNonEmptyString(body?.nickname);
  if (!nickname) return jsonError("请输入舞者昵称。");

  try {
    const supabase = getSupabaseAdmin();
    const { data: dancerData, error: dancerError } = await supabase
      .from("dancers")
      .select("id, nickname, display_name")
      .eq("nickname", nickname)
      .maybeSingle();

    if (dancerError) throw dancerError;
    const dancer = dancerData as Dancer | null;
    if (!dancer) {
      return Response.json(
        { success: false, message: "未找到该昵称对应的参赛节目，请确认昵称是否与报名名单一致。" },
        { status: 404 },
      );
    }

    const { data: programRowsData, error: programRowsError } = await supabase
      .from("program_dancers")
      .select("programs(id, order_no, title, song_name, group_name, note)")
      .eq("dancer_id", dancer.id);

    if (programRowsError) throw programRowsError;

    const programRows = (programRowsData ?? []) as unknown as ProgramDancerProgramRow[];
    const programs = programRows
      .map((row) => firstRelated(row.programs))
      .filter((program): program is Program => Boolean(program))
      .sort((a, b) => a.order_no - b.order_no);

    if (programs.length === 0) return Response.json({ dancer, programs: [] });

    const programIds = programs.map((program) => program.id);

    const [{ data: dancersData, error: dancersError }, { data: availableData, error: availableError }] = await Promise.all([
      supabase
        .from("program_dancers")
        .select("program_id, dancers(nickname, display_name)")
        .in("program_id", programIds),
      supabase
        .from("photographer_program_status")
        .select("program_id, photographers(id, display_name, wechat, wechat_qr_path, sample_url, is_active)")
        .in("program_id", programIds)
        .eq("available", true),
    ]);

    if (dancersError) throw dancersError;
    if (availableError) throw availableError;

    const dancersByProgramId = new Map<string, Array<Pick<Dancer, "nickname" | "display_name">>>();
    for (const row of (dancersData ?? []) as unknown as ProgramDancerDancerRow[]) {
      const dancerRow = firstRelated(row.dancers);
      if (!dancerRow) continue;
      const existing = dancersByProgramId.get(row.program_id) ?? [];
      existing.push(dancerRow);
      dancersByProgramId.set(row.program_id, existing);
    }

    const photographersByProgramId = new Map<
      string,
      Array<{ id: string; display_name: string; wechat: string | null; wechat_qr_url: string | null; sample_url: string | null }>
    >();
    for (const row of (availableData ?? []) as unknown as AvailablePhotographerRow[]) {
      const photographer = firstRelated(row.photographers);
      if (!photographer?.is_active) continue;
      const existing = photographersByProgramId.get(row.program_id) ?? [];
      existing.push({
        id: photographer.id,
        display_name: photographer.display_name,
        wechat: photographer.wechat,
        wechat_qr_url: getWechatQrPublicUrl(supabase, photographer.wechat_qr_path),
        sample_url: photographer.sample_url,
      });
      photographersByProgramId.set(row.program_id, existing);
    }

    const responsePrograms: DancerSearchProgram[] = programs.map((program) => ({
      ...program,
      dancers: dancersByProgramId.get(program.id) ?? [],
      available_photographers: photographersByProgramId.get(program.id) ?? [],
    }));

    return Response.json({ dancer, programs: responsePrograms });
  } catch (error) {
    console.error(error);
    return jsonError("查询失败，请稍后重试。", 500);
  }
}

