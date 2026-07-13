export type Program = {
  id: string;
  order_no: number;
  title: string;
  song_name: string | null;
  group_name: string | null;
  note: string | null;
};

export type Dancer = {
  id: string;
  nickname: string;
  display_name: string | null;
};

export type Photographer = {
  id: string;
  photographer_code: string;
  display_name: string;
  wechat: string | null;
  wechat_qr_path: string | null;
  sample_url: string | null;
  is_active: boolean | null;
};

export type PhotographerOption = Pick<Photographer, "photographer_code" | "display_name">;

export type DancerSearchProgram = Program & {
  dancers: Array<Pick<Dancer, "nickname" | "display_name">>;
  available_photographers: Array<{
    id: string;
    display_name: string;
    wechat: string | null;
    wechat_qr_url: string | null;
    sample_url: string | null;
  }>;
};

export type DancerSearchResponse = {
  dancer: Dancer;
  programs: DancerSearchProgram[];
};

export type DashboardProgram = Program & {
  dancers: Array<Pick<Dancer, "nickname" | "display_name">>;
  available: boolean;
};

export type DashboardResponse = {
  photographer: {
    photographer_code: string;
    display_name: string;
    wechat: string | null;
    wechat_qr_url: string | null;
    sample_url: string | null;
  };
  programs: DashboardProgram[];
};

export type ApiMessage = {
  success: boolean;
  message?: string;
};
