// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 Manoj Rollo (MRJonam91)

import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, unlinkSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const CLI_PATH = resolve("dist/cli/index.js");
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
});

test("cli --version prints version", () => {
  const { stdout, status } = runCli(["--version"]);
  assert.equal(status, 0);
  assert.match(stdout, /careervault v\d+\.\d+\.\d+/);
});

test("cli init, validate, export and stats lifecycle", () => {
  const tmpFile = resolve("test-lifecycle-career.json");
  const tmpCv = resolve("test-lifecycle-cv.md");

  try {
    if (existsSync(tmpFile)) unlinkSync(tmpFile);
    if (existsSync(tmpCv)) unlinkSync(tmpCv);

    // 1. init
    const initRes = runCli(["init", tmpFile]);
    assert.equal(initRes.status, 0);
    assert.ok(existsSync(tmpFile));

    // 2. validate
    const valRes = runCli(["validate", tmpFile]);
    assert.equal(valRes.status, 0);
    assert.ok(valRes.stdout.includes("Profile structure is valid"));

    // 3. export markdown IT
    const expRes = runCli(["export", tmpFile, "--lang", "it", "--out", tmpCv]);
    assert.equal(expRes.status, 0);
    assert.ok(existsSync(tmpCv));

    // 4. stats
    const statsRes = runCli(["stats", tmpFile]);
    assert.equal(statsRes.status, 0);
    assert.ok(statsRes.stdout.includes("Career Telemetry"));
    assert.ok(statsRes.stdout.includes("Evidence Coverage"));
  } finally {
    if (existsSync(tmpFile)) unlinkSync(tmpFile);
    if (existsSync(tmpCv)) unlinkSync(tmpCv);
  }
});
