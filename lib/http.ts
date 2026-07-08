import { NextResponse } from "next/server";

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ success: false, message }, { status });
}

export function jsonOk<T extends object>(body: T, status = 200) {
  return NextResponse.json(body, { status });
}

export async function readJson(request: Request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}
