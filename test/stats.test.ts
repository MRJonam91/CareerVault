// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 Manoj Rollo (MRJonam91)

import test from "node:test";
import assert from "node:assert/strict";
import { getCareerStats } from "../src/core/stats.ts";
import type { CareerProfile } from "../src/core/types.ts";

const PROFILE: CareerProfile = {
  schemaVersion: "1.0.0",
  basics: {
    name: "Laura Bianchi",
    label: { it: "Data Engineer", en: "Data Engineer" },
    email: "laura@example.com",
    summary: { it: "Ingegnere dei dati", en: "Data Engineer" },
  },
  skills: [
    { name: "Python", category: "languages" },
    { name: "SQL", category: "languages" },
    { name: "Spark", category: "frameworks" },
  ],
  experiences: [
    {
      id: "exp-1",
      company: "DataCorp",
      role: { it: "Data Engineer", en: "Data Engineer" },
      employmentType: "full-time",
      startDate: "2020-01",
      endDate: "2020-12", // 12 months
      highlights: [{ it: "Pipeline ETL", en: "ETL pipelines" }],
      skills: ["Python", "SQL"],
      evidence: ["https://example.com/repo"],
    },
    {
      id: "exp-2",
      company: "Analytics Ltd",
      role: { it: "Senior Data Engineer", en: "Senior Data Engineer" },
      employmentType: "full-time",
      startDate: "2020-07", // overlaps 6 months with exp-1
      endDate: "2021-06", // 6 new months in 2021
      highlights: [{ it: "Spark Streaming", en: "Spark Streaming" }],
      skills: ["Spark"],
    },
  ],
};

test("getCareerStats accurately deduplicates overlapping career months", () => {
  const stats = getCareerStats(PROFILE);
  // 2020-01 to 2020-12 = 12 months
  // 2021-01 to 2021-06 = 6 months
  // Total unique months = 18 months (1 year and 6 months)
  assert.equal(stats.totalExperienceMonths, 18);
  assert.equal(stats.totalRolesCount, 2);
  assert.equal(stats.skillsCount, 3);
  assert.equal(stats.skillsByCategory["languages"], 2);
  assert.equal(stats.skillsByCategory["frameworks"], 1);
  assert.equal(stats.evidenceCoveragePercent, 50); // 1 of 2 roles has evidence
});
