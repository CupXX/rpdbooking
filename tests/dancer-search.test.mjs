import assert from "node:assert/strict";
import { test } from "node:test";
import { readFile } from "node:fs/promises";

const pagePath = new URL("../app/dancer/page.tsx", import.meta.url);
const routePath = new URL("../app/api/dancer/search/route.ts", import.meta.url);

test("dancer page tells users to use the program nickname", async () => {
  const source = await readFile(pagePath, "utf8");

  assert.match(source, /placeholder="请输入您节目单中的昵称"/u);
});

test("dancer search matches nicknames without case sensitivity", async () => {
  const source = await readFile(routePath, "utf8");

  assert.match(source, /\.ilike\("nickname", nickname\)/u);
  assert.doesNotMatch(source, /\.eq\("nickname", nickname\)/u);
});
