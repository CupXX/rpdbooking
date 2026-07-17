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

  const songTitle = source.indexOf('<h2 className="mt-0.5 text-xl font-bold leading-6 text-white">{program.song_name ?? program.title}</h2>');
  const groupText = source.indexOf('<p className="sgc-muted mt-2 text-sm leading-5">{program.group_name ?? program.title}</p>');
  const compactMembers = source.indexOf('<p className="sgc-muted mt-1 text-sm leading-5">');
  const membersText = source.indexOf('{program.dancers.length > 0 ? (');

  assert.notEqual(songTitle, -1);
  assert.notEqual(groupText, -1);
  assert.notEqual(compactMembers, -1);
  assert.notEqual(membersText, -1);
  assert.ok(songTitle < groupText);
  assert.ok(groupText < membersText);
  assert.ok(membersText < compactMembers);
});

test("dancer search includes photographer camera positions", async () => {
  const source = await readFile(routePath, "utf8");

  assert.match(source, /photographers\(id, display_name, camera_position, wechat, wechat_qr_path, sample_account, sample_url, is_active\)/u);
  assert.match(source, /camera_position: photographer\.camera_position/u);
});

test("dancer page shows photographer camera position next to the name", async () => {
  const source = await readFile(pagePath, "utf8");

  assert.match(source, /\{photographer\.camera_position \? `（\$\{photographer\.camera_position\}）` : ""\}/u);
});
