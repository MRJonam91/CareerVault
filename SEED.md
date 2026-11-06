# CareerVault: decision seed & MVP status

IT — Scopo: CV, portfolio e profili riportano versioni incoerenti della carriera. Prima prova: Un profilo strutturato esportabile in CV Markdown italiano e inglese.
EN — Purpose: CVs, portfolios and profiles contain inconsistent career histories. First trial: One structured profile exportable to Italian and English Markdown CVs.

## Stato / Status
- [x] Schema unificato della carriera (`CareerProfile`) con supporto bilingue (IT/EN), metriche ed evidenze verificabili.
- [x] Motore di rilevamento anomalie (inversioni cronologiche, ruoli full-time sovrapposti non concorrenti, competenze orfane o non dichiarate).
- [x] Generatore di CV in Markdown bilingue (italiano e inglese) e supporto per JSON Resume standard.
- [x] Calcolo della telemetria di carriera (anni/mesi deduplicati unificando le sovrapposizioni temporali).
- [x] Suite CLI (`init`, `validate`, `export`, `stats`) e test automatici nativi senza dipendenze di runtime.
- [x] Standard repository MRJonam91 applicati (Apache-2.0, NOTICE, LICENSING.md, FUNDING.yml, CI con guardia core < 1500 righe, marker anti-plagio registrati).
