// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 Manoj Rollo (MRJonam91)

import type {
  CareerDiffChange,
  CareerDiffResult,
  CareerProfile,
  LocalizedText,
  WorkExperience,
} from "./types.ts";

function textStr(t?: LocalizedText): string {
  if (!t) return "";
  if (typeof t === "string") return t;
  return `${t.it || ""} | ${t.en || ""}`;
}

export function diffProfiles(
  oldProfile: CareerProfile,
  newProfile: CareerProfile
): CareerDiffResult {
  const changes: CareerDiffChange[] = [];

  // Basics check
  const bOld = oldProfile.basics;
  const bNew = newProfile.basics;
  if (bOld && bNew) {
    if (bOld.name !== bNew.name) {
      changes.push({
        category: "basics",
        type: "modified",
        item: "name",
        oldValue: bOld.name,
        newValue: bNew.name,
        details: `Name changed from '${bOld.name}' to '${bNew.name}'`,
      });
    }
    if (textStr(bOld.label) !== textStr(bNew.label)) {
      changes.push({
        category: "basics",
        type: "modified",
        item: "label",
        details: "Professional headline/label updated",
      });
    }
    if (bOld.email !== bNew.email) {
      changes.push({
        category: "basics",
        type: "modified",
        item: "email",
        oldValue: bOld.email,
        newValue: bNew.email,
        details: `Email changed from '${bOld.email}' to '${bNew.email}'`,
      });
    }
    if (textStr(bOld.summary) !== textStr(bNew.summary)) {
      changes.push({
        category: "basics",
        type: "modified",
        item: "summary",
        details: "Executive career summary modified",
      });
    }
  }

  // Experiences check
  const expMapOld = new Map<string, WorkExperience>();
  const expMapNew = new Map<string, WorkExperience>();

  for (const exp of oldProfile.experiences ?? []) {
    expMapOld.set(exp.id || `${exp.company}-${exp.startDate}`, exp);
  }
  for (const exp of newProfile.experiences ?? []) {
    expMapNew.set(exp.id || `${exp.company}-${exp.startDate}`, exp);
  }

  // Check added/modified in new
  for (const [key, expNew] of expMapNew.entries()) {
    const expOld = expMapOld.get(key);
    if (!expOld) {
      changes.push({
        category: "experiences",
        type: "added",
        item: `${expNew.company} (${textStr(expNew.role)})`,
        details: `New experience role added: ${expNew.company} (${expNew.startDate} - ${expNew.endDate ?? "current"})`,
        newValue: expNew,
      });
    } else {
      // Check modifications
      const diffNotes: string[] = [];
      if (expOld.company !== expNew.company) diffNotes.push("company name");
      if (textStr(expOld.role) !== textStr(expNew.role)) diffNotes.push("role title");
      if (expOld.startDate !== expNew.startDate || expOld.endDate !== expNew.endDate) {
        diffNotes.push(`timeline dates (${expOld.startDate}..${expOld.endDate} -> ${expNew.startDate}..${expNew.endDate})`);
      }
      if ((expOld.highlights?.length ?? 0) !== (expNew.highlights?.length ?? 0)) {
        diffNotes.push(`highlights count (${expOld.highlights?.length ?? 0} -> ${expNew.highlights?.length ?? 0})`);
      }
      if ((expOld.metrics?.length ?? 0) !== (expNew.metrics?.length ?? 0)) {
        diffNotes.push(`metrics count (${expOld.metrics?.length ?? 0} -> ${expNew.metrics?.length ?? 0})`);
      }
      if (diffNotes.length > 0) {
        changes.push({
          category: "experiences",
          type: "modified",
          item: `${expNew.company} (${key})`,
          details: `Modified fields: ${diffNotes.join(", ")}`,
        });
      }
    }
  }

  // Check removed experiences
  for (const [key, expOld] of expMapOld.entries()) {
    if (!expMapNew.has(key)) {
      changes.push({
        category: "experiences",
        type: "removed",
        item: `${expOld.company} (${textStr(expOld.role)})`,
        details: `Experience removed: ${expOld.company}`,
        oldValue: expOld,
      });
    }
  }

  // Skills check
  const skillsOld = new Map((oldProfile.skills ?? []).map((s) => [s.name.toLowerCase(), s]));
  const skillsNew = new Map((newProfile.skills ?? []).map((s) => [s.name.toLowerCase(), s]));

  for (const [name, sNew] of skillsNew.entries()) {
    const sOld = skillsOld.get(name);
    if (!sOld) {
      changes.push({
        category: "skills",
        type: "added",
        item: sNew.name,
        details: `New skill added: ${sNew.name} [${sNew.category}]`,
      });
    } else if (sOld.level !== sNew.level) {
      changes.push({
        category: "skills",
        type: "modified",
        item: sNew.name,
        details: `Skill level for '${sNew.name}' changed from '${sOld.level ?? "unspecified"}' to '${sNew.level ?? "unspecified"}'`,
      });
    }
  }

  for (const [name, sOld] of skillsOld.entries()) {
    if (!skillsNew.has(name)) {
      changes.push({
        category: "skills",
        type: "removed",
        item: sOld.name,
        details: `Skill removed: ${sOld.name}`,
      });
    }
  }

  // Certifications check
  const certsOld = new Set((oldProfile.certifications ?? []).map((c) => c.name));
  const certsNew = new Set((newProfile.certifications ?? []).map((c) => c.name));

  for (const c of certsNew) {
    if (!certsOld.has(c)) {
      changes.push({
        category: "certifications",
        type: "added",
        item: c,
        details: `New certification added: ${c}`,
      });
    }
  }
  for (const c of certsOld) {
    if (!certsNew.has(c)) {
      changes.push({
        category: "certifications",
        type: "removed",
        item: c,
        details: `Certification removed: ${c}`,
      });
    }
  }

  const added = changes.filter((c) => c.type === "added").length;
  const removed = changes.filter((c) => c.type === "removed").length;
  const modified = changes.filter((c) => c.type === "modified").length;

  return {
    hasDifferences: changes.length > 0,
    changes,
    summary: { added, removed, modified },
  };
}
