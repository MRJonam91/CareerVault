// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 Manoj Rollo (MRJonam91)

import test from "node:test";
import assert from "node:assert/strict";
import { importJsonResume } from "../src/core/json-resume-exporter.ts";
import { validateProfile } from "../src/core/validator.ts";

const MOCK_JSON_RESUME = {
  basics: {
    name: "Jane Doe",
    label: "Full Stack Engineer",
    email: "jane@example.com",
    summary: "Senior web developer with 6 years experience.",
    location: { city: "London", countryCode: "GB" },
  },
  work: [
    {
      name: "Fintech Startup",
      position: "Senior Engineer",
      startDate: "2020-01",
      endDate: "2023-01",
      summary: "Core platform architect",
      highlights: ["Migrated monolith to microservices"],
      keywords: ["Node.js", "TypeScript"],
    },
  ],
  skills: [
    {
      name: "Programming",
      keywords: ["Node.js", "TypeScript"],
    },
  ],
  education: [
    {
      institution: "Imperial College",
      area: "Computing",
      studyType: "BSc",
      startDate: "2016-09",
      endDate: "2019-06",
    },
  ],
};

test("importJsonResume correctly maps external jsonresume.org format", () => {
  const profile = importJsonResume(MOCK_JSON_RESUME);
  assert.equal(profile.basics.name, "Jane Doe");
  assert.equal(profile.basics.email, "jane@example.com");
  assert.equal(profile.experiences.length, 1);
  assert.equal(profile.experiences[0]?.company, "Fintech Startup");
  assert.equal(profile.skills.length, 2);
  assert.ok(profile.skills.some((s) => s.name === "TypeScript"));
  assert.equal(profile.education?.length, 1);

  // Check that the imported profile passes validation
  const validation = validateProfile(profile);
  assert.equal(validation.valid, true);
  assert.equal(validation.errors.length, 0);
});
