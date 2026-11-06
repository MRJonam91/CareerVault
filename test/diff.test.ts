// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 Manoj Rollo (MRJonam91)

import test from "node:test";
import assert from "node:assert/strict";
import { diffProfiles } from "../src/core/diff.ts";
import type { CareerProfile } from "../src/core/types.ts";

const BASE_PROFILE: CareerProfile = {
  schemaVersion: "1.0.0",
  basics: {
    name: "Alex Rossi",
    label: "Senior Engineer",
    email: "alex@example.com",
    summary: "Experienced developer",
  },
  skills: [
    { name: "TypeScript", category: "languages", level: "advanced" },
    { name: "Docker", category: "tools", level: "intermediate" },
  ],
  experiences: [
    {
      id: "exp-1",
      company: "Alpha Corp",
      role: "Lead Engineer",
      employmentType: "full-time",
      startDate: "2021-01",
      endDate: "2023-01",
      highlights: ["Built API"],
      skills: ["TypeScript"],
    },
  ],
};

test("diffProfiles detects identical profiles", () => {
  const result = diffProfiles(BASE_PROFILE, BASE_PROFILE);
  assert.equal(result.hasDifferences, false);
  assert.equal(result.changes.length, 0);
  assert.equal(result.summary.added, 0);
  assert.equal(result.summary.modified, 0);
  assert.equal(result.summary.removed, 0);
});

test("diffProfiles detects added and modified roles", () => {
  const newProfile = structuredClone(BASE_PROFILE);
  newProfile.basics.name = "Alex Rossi, PhD";
  newProfile.experiences[0]!.highlights.push("Managed 5 engineers");
  newProfile.experiences.push({
    id: "exp-2",
    company: "Beta Global",
    role: "Staff Architect",
    employmentType: "full-time",
    startDate: "2023-02",
    endDate: null,
    isCurrent: true,
    highlights: ["Cloud migration"],
    skills: ["Docker"],
  });
  newProfile.skills.push({ name: "Kubernetes", category: "cloud-devops", level: "advanced" });

  const result = diffProfiles(BASE_PROFILE, newProfile);
  assert.equal(result.hasDifferences, true);
  assert.ok(result.changes.some((c) => c.item === "name" && c.type === "modified"));
  assert.ok(result.changes.some((c) => c.category === "experiences" && c.type === "added"));
  assert.ok(result.changes.some((c) => c.category === "experiences" && c.type === "modified"));
  assert.ok(result.changes.some((c) => c.category === "skills" && c.item === "Kubernetes"));
});

test("diffProfiles detects removed roles and skills", () => {
  const trimmedProfile = structuredClone(BASE_PROFILE);
  trimmedProfile.experiences = [];
  trimmedProfile.skills = [BASE_PROFILE.skills[0]!];

  const result = diffProfiles(BASE_PROFILE, trimmedProfile);
  assert.equal(result.hasDifferences, true);
  assert.ok(result.changes.some((c) => c.category === "experiences" && c.type === "removed"));
  assert.ok(result.changes.some((c) => c.category === "skills" && c.item === "Docker" && c.type === "removed"));
});
