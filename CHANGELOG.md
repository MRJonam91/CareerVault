# Changelog — CareerVault

Tutte le modifiche rilevanti a questo progetto sono documentate in questo file. /
All notable changes to this project are documented in this file.

Il formato è basato su [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
e rispetta il [Semantic Versioning](https://semver.org/).

## [0.2.0-beta.1] - 2026-11-06

### Added / Aggiunto
- **Career Ledger Diff Engine**: confronto semantico deterministico tra due versioni di profili (`diffProfiles`, comando CLI `careervault diff fileA fileB`), con rilevamento di ruoli aggiunti, rimossi o modificati, spostamenti temporali, aggiunte/rimozioni di competenze e variazioni metriche.
- **Standalone HTML Exporter**: esportatore CV in formato HTML reattivo e autocontenuto (`--format html`) con foglio di stile ottimizzato per stampa e conversione PDF via browser (`@media print`, `@page { margin: 1.5cm }`).
- **JSON Resume Bi-directional Interop**: funzione `importJsonResume` e comando `careervault import <resume.json>` per importare e convertire istantaneamente curriculum esistenti nel formato `career.json`.
- **Advanced Tailoring & Export Controls**: filtri per competenze (`--filter-skills`), limite temporale (`--max-years`), limite del numero di esperienze (`--limit`) e stili di presentazione (`--style compact|detailed|standard`).
- **Employment Gap & Senior Metric Audits**: rilevamento proattivo di buchi di carriera superiori a 3 mesi e segnalazione di ruoli senior privi di metriche aziendali quantificabili.
- **Stale Skill Detection**: avviso per competenze non impiegate attivamente da oltre 4 anni.
- **Enhanced Test Suite**: espansione della suite a 23 test automatizzati a copertura completa di schema, diff, validazione, CLI ed esportatori.

## [0.1.0] - 2026-11-06

### Added / Aggiunto
- **CareerProfile Schema v1**: schema JSON deterministico per la gestione completa della storia professionale (dati anagrafici, esperienze lavorative, competenze categorizzate, progetti chiave, istruzione, certificazioni, lingue e link di verifica/evidenza).
- **Anomaly & Consistency Engine**: rilevamento automatico di sovrapposizioni lavorative non autorizzate (`overlapping roles`), inversioni cronologiche (`endDate < startDate`), competenze orfane o non censite, buchi temporali superiori a 6 mesi e lacune nelle traduzioni bilingui.
- **Bilingual Markdown Exporter**: esportazione professionale e deterministica del CV sia in italiano (`--lang it`) che in inglese (`--lang en`), pronto per la consultazione o conversione PDF.
- **JSON Resume Standard Exporter**: conversione nativa verso lo standard universale `resume.json` (jsonresume.org).
- **Career Telemetry & Stats**: calcolo degli anni effettivi di esperienza (deduplicando sovrapposizioni temporali), tenure media, distribuzione per categoria di skill e tasso di copertura delle evidenze verificabili.
- **CLI Suite**: comandi `careervault init`, `careervault validate`, `careervault export`, `careervault stats` con supporto output `--json` per pipeline CI/CD.
- **Sponsorship integration**: notifica non intrusiva (1/10) conforme a `REPO-STANDARDS.md` (`NO_SPONSOR=1`, muta in CI).
- **Documentazione bilingue**: `README.md` (EN) e `README.it.md` (IT), `docs/ARCHITECTURE.md`, `docs/LAUNCH.md`, e profilo di prova verificabile in `examples/`.
