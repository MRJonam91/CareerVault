// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 Manoj Rollo (MRJonam91)

import test from "node:test";
import assert from "node:assert/strict";
import { exportJsonResume } from "../src/core/json-resume-exporter.ts";
import type { CareerProfile } from "../src/core/types.ts";

const PROFILE: CareerProfile = {
  schemaVersion: "1.0.0",
  basics: {
    name: "Marco Neri",
    label: { it: "Backend Lead", en: "Backend Lead" },
    email: "marco@example.com",
    summary: { it: "Sviluppatore esperto.", en: "Expert developer." },
  },
  skills: [
    { name: "Node.js", category: "frameworks" },
    { name: "PostgreSQL", category: "databases" },
  ],
  experiences: [
    {
      id: "exp-1",
      company: "Fintech Co",
      role: { it: "Tech Lead", en: "Tech Lead" },
      employmentType: "full-time",
      startDate: "2022-01",
      endDate: "2024-01",
      highlights: [{ it: "Scalato database", en: "Scaled database" }],
      skills: ["Node.js", "PostgreSQL"],
    },
  ],
};

test("exportJsonResume complies with standard JSON Resume structure", () => {
  const jsonResume = exportJsonResume(PROFILE, { lang: "en" });
  assert.equal(jsonResume.basics.name, "Marco Neri");
  assert.equal(jsonResume.basics.label, "Backend Lead");
  assert.equal(jsonResume.work.length, 1);
  assert.equal(jsonResume.work[0]?.name, "Fintech Co");
  assert.equal(jsonResume.work[0]?.position, "Tech Lead");
  assert.ok(jsonResume.work[0]?.highlights?.includes("Scaled database"));
  assert.ok(Array.isArray(jsonResume.skills));
  assert.equal(jsonResume.meta.canonical, "https://github.com/MRJonam91/CareerVault");
});
