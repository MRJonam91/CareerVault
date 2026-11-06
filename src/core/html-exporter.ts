// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 Manoj Rollo (MRJonam91)

import { anonymizeProfile } from "./anonymizer.ts";
import type { CareerProfile, ExportOptions, LocalizedText, SupportedLanguage } from "./types.ts";

function resolveText(text?: LocalizedText, lang: SupportedLanguage = "en"): string {
  if (!text) return "";
  if (typeof text === "string") return text;
  return text[lang] || text.en || text.it || "";
}

function esc(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export function exportHtmlCv(rawProfile: CareerProfile, options: ExportOptions = { lang: "en" }): string {
  const profile = options.anonymize ? anonymizeProfile(rawProfile) : rawProfile;
  const lang = options.lang;
  const isIt = lang === "it";
  const b = profile.basics;
  const title = resolveText(b.label, lang);
  const summary = resolveText(b.summary, lang);

  const contactItems: string[] = [];
  if (b.email) contactItems.push(`<a href="mailto:${esc(b.email)}">${esc(b.email)}</a>`);
  if (b.phone) contactItems.push(`<span>${esc(b.phone)}</span>`);
  if (b.location) {
    const loc = [b.location.city, b.location.region, b.location.countryCode].filter(Boolean).join(", ");
    if (loc) contactItems.push(`<span>${esc(loc)}</span>`);
  }
  if (b.url) contactItems.push(`<a href="${esc(b.url)}">${esc(b.url.replace(/^https?:\/\//, ""))}</a>`);
  if (b.profiles) for (const p of b.profiles) contactItems.push(`<a href="${esc(p.url)}">${esc(p.network)}: ${esc(p.username)}</a>`);

  let expHtml = "";
  for (const exp of profile.experiences ?? []) {
    const role = resolveText(exp.role, lang);
    const expSummary = resolveText(exp.summary, lang);
    const period = `${exp.startDate} — ${exp.isCurrent || !exp.endDate ? (isIt ? "Presente" : "Present") : exp.endDate}`;
    const highlights = (exp.highlights ?? []).map((h) => `<li>${esc(resolveText(h, lang))}</li>`).join("");
    const metrics = (exp.metrics ?? []).map((m) => `<li><strong>${esc(m.value)}</strong> — ${esc(resolveText(m.label, lang))}</li>`).join("");
    const tags = exp.skills?.length ? `<div class="tags">${exp.skills.map((s) => `<span class="tag">${esc(s)}</span>`).join("")}</div>` : "";

    expHtml += `<article class="entry">
      <div class="entry-header"><h3>${esc(role)} <span class="co">@ ${esc(exp.company)}</span></h3>
      <div class="meta">${esc(period)} ${exp.location ? `• ${esc(exp.location)}` : ""} • ${esc(exp.employmentType)}</div></div>
      ${expSummary ? `<p class="desc">${esc(expSummary)}</p>` : ""}
      ${highlights || metrics ? `<ul class="hl">${highlights}${metrics}</ul>` : ""}${tags}
    </article>`;
  }

  let projHtml = "";
  if (!options.anonymize && profile.projects?.length) {
    projHtml = `<section class="sec"><h2>${isIt ? "Progetti Rilevanti" : "Key Projects"}</h2>` +
      profile.projects.map((p) => `<article class="entry"><h3>${p.url ? `<a href="${esc(p.url)}">${esc(p.name)}</a>` : esc(p.name)}</h3><p class="desc">${esc(resolveText(p.description, lang))}</p>` +
        (p.skills?.length ? `<div class="tags">${p.skills.map((s) => `<span class="tag">${esc(s)}</span>`).join("")}</div>` : "") +
      `</article>`).join("") + `</section>`;
  }

  const skillsHtml = profile.skills?.length ? `<section class="sec"><h2>${isIt ? "Competenze Tecniche" : "Technical Skills"}</h2>
    <div class="pills">${profile.skills.map((s) => `<span class="pill">${esc(s.name)}${s.level ? ` <em>(${s.level})</em>` : ""}</span>`).join("")}</div>
  </section>` : "";

  let eduHtml = "";
  if (profile.education?.length) {
    eduHtml = `<section class="sec"><h2>${isIt ? "Formazione e Titoli" : "Education & Credentials"}</h2>` +
      profile.education.map((e) => `<article class="entry"><h3>${esc(resolveText(e.studyType, lang))} in ${esc(resolveText(e.area, lang))} <span class="co">@ ${esc(e.institution)}</span></h3><div class="meta">${esc(e.startDate)} — ${esc(e.endDate ?? (isIt ? "Presente" : "Present"))}${e.score ? ` • ${esc(e.score)}` : ""}</div></article>`).join("") +
      `</section>`;
  }

  let certHtml = "";
  if (profile.certifications?.length) {
    certHtml = `<section class="sec"><h2>${isIt ? "Certificazioni" : "Certifications"}</h2><ul class="hl">` +
      profile.certifications.map((c) => `<li><strong>${esc(c.name)}</strong> — ${esc(c.issuer)} (${esc(c.issueDate)})${c.credentialId ? ` • ID: <code>${esc(c.credentialId)}</code>` : ""}</li>`).join("") +
      `</ul></section>`;
  }

  let langHtml = "";
  if (profile.languages?.length) {
    langHtml = `<section class="sec"><h2>${isIt ? "Lingue" : "Languages"}</h2><div class="cts">` +
      profile.languages.map((l) => `<span><strong>${esc(resolveText(l.language, lang))}:</strong> ${esc(l.fluency)}</span>`).join(" • ") +
      `</div></section>`;
  }

  return `<!DOCTYPE html><html lang="${lang}"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>${esc(b.name)} — ${esc(title)}</title>
<style>
  :root { --t: #1f2937; --m: #4b5563; --a: #2563eb; --b: #e5e7eb; --g: #f3f4f6; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: var(--t); background: #fafafa; padding: 2rem 1rem; }
  .box { max-width: 820px; margin: 0 auto; background: #fff; padding: 2.5rem; border: 1px solid var(--b); border-radius: 8px; }
  h1 { font-size: 2.2rem; } .tit { font-size: 1.15rem; color: var(--a); font-weight: 600; margin-top: 0.25rem; }
  .cts { display: flex; flex-wrap: wrap; gap: 0.75rem; margin-top: 0.5rem; font-size: 0.9rem; color: var(--m); }
  .cts a { color: var(--m); text-decoration: none; } .cts a:hover { color: var(--a); text-decoration: underline; }
  hr { border: 0; border-top: 1px solid var(--b); margin: 1.25rem 0; }
  h2 { font-size: 1.2rem; text-transform: uppercase; letter-spacing: 0.05em; color: #374151; margin-bottom: 0.75rem; border-bottom: 2px solid var(--a); padding-bottom: 0.2rem; }
  .sec { margin-bottom: 1.75rem; } .entry { margin-bottom: 1.25rem; } .co { color: var(--a); }
  .meta { font-size: 0.85rem; color: var(--m); margin: 0.15rem 0 0.4rem; }
  .desc { font-size: 0.95rem; margin-bottom: 0.4rem; } .hl { padding-left: 1.2rem; font-size: 0.95rem; } .hl li { margin-bottom: 0.2rem; }
  .tags, .pills { display: flex; flex-wrap: wrap; gap: 0.4rem; margin-top: 0.4rem; }
  .tag { font-size: 0.75rem; background: var(--g); color: #374151; padding: 0.15rem 0.5rem; border-radius: 4px; }
  .pill { font-size: 0.85rem; background: var(--g); padding: 0.2rem 0.5rem; border-radius: 6px; } .pill em { font-size: 0.75rem; color: var(--m); font-style: normal; }
  footer { margin-top: 2rem; text-align: center; font-size: 0.8rem; color: #9ca3af; }
  @media print { body { background: #fff; padding: 0; } .box { border: none; padding: 0; } .entry { page-break-inside: avoid; } footer { display: none; } }
</style></head>
<body><div class="box">
  <header><h1>${esc(b.name)}</h1>${title ? `<div class="tit">${esc(title)}</div>` : ""}${contactItems.length ? `<div class="cts">${contactItems.join(" • ")}</div>` : ""}</header>
  <hr/>
  ${summary ? `<section class="sec"><h2>${isIt ? "Profilo" : "Summary"}</h2><p>${esc(summary)}</p></section>` : ""}
  <section class="sec"><h2>${isIt ? "Esperienza Professionale" : "Work Experience"}</h2>${expHtml}</section>
  ${projHtml}
  ${skillsHtml}
  ${eduHtml}
  ${certHtml}
  ${langHtml}
  <footer>${isIt ? "Generato tramite CareerVault — Single Source of Truth" : "Generated via CareerVault — Career Single Source of Truth"}</footer>
</div></body></html>`;
}
