import assert from "node:assert/strict";
import { test } from "node:test";
import { readFile } from "node:fs/promises";
import ts from "typescript";

async function loadContactModule() {
  const source = await readFile(new URL("../lib/contactMethod.ts", import.meta.url), "utf8");
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  const moduleUrl = `data:text/javascript;base64,${Buffer.from(transpiled).toString("base64")}`;
  return import(moduleUrl);
}

test("requires either wechat text or a QR image URL before marking available", async () => {
  const { hasContactMethod } = await loadContactModule();

  assert.equal(hasContactMethod(null, null), false);
  assert.equal(hasContactMethod("   ", ""), false);
  assert.equal(hasContactMethod("cupx_wechat", null), true);
  assert.equal(hasContactMethod(null, "https://example.com/qr.png"), true);
});
