import assert from "node:assert/strict";
import { test } from "node:test";
import { readFile } from "node:fs/promises";

const dancerPagePath = new URL("../app/dancer/page.tsx", import.meta.url);
const photographerPagePath = new URL("../app/photographer/page.tsx", import.meta.url);

test("program number labels use group suffix instead of program prefix", async () => {
  const [dancerSource, photographerSource] = await Promise.all([
    readFile(dancerPagePath, "utf8"),
    readFile(photographerPagePath, "utf8"),
  ]);

  assert.match(dancerSource, /\{String\(program\.order_no\)\.padStart\(2, "0"\)\}组/u);
  assert.match(photographerSource, /\{String\(program\.order_no\)\.padStart\(2, "0"\)\}组/u);
  assert.doesNotMatch(dancerSource, /节目 \{String\(program\.order_no\)\.padStart\(2, "0"\)\}/u);
});
