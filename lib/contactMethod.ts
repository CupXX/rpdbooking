export function hasContactMethod(wechat: string | null | undefined, wechatQrUrl: string | null | undefined) {
  return Boolean(wechat?.trim() || wechatQrUrl?.trim());
}

export function isWechatQrMimeType(value: string) {
  return value === "image/png" || value === "image/jpeg" || value === "image/webp";
}

export function wechatQrExtensionForMimeType(value: string) {
  if (value === "image/png") return "png";
  if (value === "image/webp") return "webp";
  return "jpg";
}

export function createWechatQrPath(photographerId: string, mimeType: string, uploadId: string) {
  return `${photographerId}/${uploadId}.${wechatQrExtensionForMimeType(mimeType)}`;
}
