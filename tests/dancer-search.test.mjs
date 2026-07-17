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

test("dancer program cards show song as the title and group with members", async () => {
  const source = await readFile(pagePath, "utf8");

  const songTitle = source.indexOf('<h2 className="mt-1 text-lg font-bold text-white">{program.song_name ?? program.title}</h2>');
  const groupText = source.indexOf('<p className="sgc-muted mt-3 text-sm leading-6">{program.group_name ?? program.title}</p>');
  const membersText = source.indexOf('{program.dancers.length > 0 ? (');

  assert.notEqual(songTitle, -1);
  assert.notEqual(groupText, -1);
  assert.notEqual(membersText, -1);
  assert.ok(songTitle < groupText);
  assert.ok(groupText < membersText);
});
