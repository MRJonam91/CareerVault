// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 Manoj Rollo (MRJonam91)

import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, unlinkSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const CLI_SOURCE = resolve("src/cli/index.ts");

function runCli(args: string[]): { stdout: string; status: number } {
  try {
    const stdout = execFileSync("node", ["--no-warnings", CLI_SOURCE, ...args], {
      encoding: "utf8",
      env: { ...process.env, NO_SPONSOR: "1" },
    });
    return { stdout, status: 0 };
  } catch (err: unknown) {
    const error = err as { stdout?: string; status?: number; stderr?: string };
    return {
      stdout: (error.stdout ?? "") + (error.stderr ?? ""),
      status: error.status ?? 1,
    };
  }
}

test("cli --help shows commands and usage", () => {
  const { stdout, status } = runCli(["--help"]);
  assert.equal(status, 0);
  assert.ok(stdout.includes("CareerVault"));
  assert.ok(stdout.includes("validate"));
  assert.ok(stdout.includes("export"));
  assert.ok(stdout.includes("diff"));
  assert.ok(stdout.includes("import"));
  assert.ok(stdout.includes("anonymize"));
});

test("cli --version prints version", () => {
  const { stdout, status } = runCli(["--version"]);
  assert.equal(status, 0);
  assert.match(stdout, /careervault v\d+\.\d+\.\d+/);
});

test("cli init, validate, export HTML, diff, import and stats lifecycle", () => {
  const tmpFileA = resolve("test-lifecycle-career-a.json");
  const tmpFileB = resolve("test-lifecycle-career-b.json");
  const tmpCvMd = resolve("test-lifecycle-cv.md");
  const tmpCvHtml = resolve("test-lifecycle-cv.html");
  const tmpResumeJson = resolve("test-lifecycle-resume.json");
  const tmpImported = resolve("test-lifecycle-imported.json");

  try {
    // 1. init A
    const initRes = runCli(["init", tmpFileA]);
    assert.equal(initRes.status, 0);
    assert.ok(existsSync(tmpFileA));

    // 2. validate A
    const valRes = runCli(["validate", tmpFileA]);
    assert.equal(valRes.status, 0);
    assert.ok(valRes.stdout.includes("Profile structure is valid"));

    // 3. export markdown IT
    const expMdRes = runCli(["export", tmpFileA, "--lang", "it", "--out", tmpCvMd]);
    assert.equal(expMdRes.status, 0);
    assert.ok(existsSync(tmpCvMd));

    // 4. export HTML EN
    const expHtmlRes = runCli(["export", tmpFileA, "--lang", "en", "--format", "html", "--out", tmpCvHtml]);
    assert.equal(expHtmlRes.status, 0);
    assert.ok(existsSync(tmpCvHtml));

    // 5. export JSON Resume
    const expJsonRes = runCli(["export", tmpFileA, "--format", "json-resume", "--out", tmpResumeJson]);
    assert.equal(expJsonRes.status, 0);
    assert.ok(existsSync(tmpResumeJson));

    // 6. import JSON Resume back
    const impRes = runCli(["import", tmpResumeJson, "--out", tmpImported]);
    assert.equal(impRes.status, 0);
    assert.ok(existsSync(tmpImported));

    // 7. diff A and imported
    const diffRes = runCli(["diff", tmpFileA, tmpImported]);
    assert.equal(diffRes.status, 0);
    assert.ok(diffRes.stdout.includes("Career Ledger Diff"));

    // 8. anonymize command
    const tmpBlind = resolve("test-lifecycle-blind.json");
    const anonRes = runCli(["anonymize", tmpFileA, "-o", tmpBlind]);
    assert.equal(anonRes.status, 0);
    assert.ok(existsSync(tmpBlind));
    unlinkSync(tmpBlind);

    // 9. export markdown with --anonymize
    const blindCv = resolve("test-lifecycle-blind-cv.md");
    const expBlindRes = runCli(["export", tmpFileA, "--anonymize", "-o", blindCv]);
    assert.equal(expBlindRes.status, 0);
    assert.ok(existsSync(blindCv));
    unlinkSync(blindCv);

    // 10. stats
    const statsRes = runCli(["stats", tmpFileA]);
    assert.equal(statsRes.status, 0);
    assert.ok(statsRes.stdout.includes("Career Telemetry"));
  } finally {
    for (const f of [tmpFileA, tmpFileB, tmpCvMd, tmpCvHtml, tmpResumeJson, tmpImported]) {
      if (existsSync(f)) unlinkSync(f);
    }
  }
});
