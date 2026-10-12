# Praedos

*Built / Chrome extension* · Projects / Agents & reliability

> Application autofill that knows when to leave a field alone.

Praedos is a personal job application agent. It keeps one verified applicant profile, maps what a form is asking onto it, applies confidence rules, fills only the controls it is sure about, and then reads them back to confirm.

The design goal is incorrect fills approaching zero, not fields filled approaching a hundred percent. A blank field is recoverable; a confidently wrong answer is not.

**My part.** Matching architecture kept separate from browser DOM operations.

**Outcome.** 763 passing tests. The matching pipeline needs no model, no network call, and no API key. Greenhouse and Lever detection works, but it has not yet been run against a real application, and Workday is not started.

**Stack.** TypeScript, Chrome extension, Semantic matching

**Workflow.** Scan → Map → Resolve → Policy → Fill

## Technical detail and evidence

- The résumé is only an onboarding input. Once the user verifies the extracted profile, that profile is the source of truth.
- Matching uses HTML semantics, an alias registry of about 200 phrasings, and fuzzy matching. Every strategy runs and the candidates are scored, so agreement between signals counts as evidence and disagreement is shown instead of hidden.
- Every filled value is read back to confirm it landed, and a side panel lists each fill with a control to change it.
- Corrections are stored against semantic fingerprints, so fixing one question carries across application systems, scoped globally, per applicant tracking system, per company, or per exact field.
- Legal and sensitive answers, such as work authorization, are never inferred from a résumé, and the extension never submits an application on its own.

**Connected to.** Trustworthy agents, Covenant, Cerno / IntentLock, Hermes, Shorted
