# Meridian

*Hackathon / Evaluated workflow* · Projects / Health & biology

> From a GI referral to an appointment that actually gets booked.

Meridian takes a referral by voice, decides whether it needs escalation, schedules the visit, and drafts the prior authorization request with citations. It never diagnoses. It decides one thing: whether this person needs a GI appointment, and how fast.

The rule at the center is that models extract and rules decide. A language model turns messy input into structured features; a versioned, unit tested rule engine with no model calls maps those features to an urgency, so every decision can be audited.

**My part.** Healthcare referral and scheduling automation.

**Outcome.** Rules evaluated against 2,093 patient records. Within that evaluation: 100% escalation recall and zero false reassurances. That is an evaluation result, not a clinical guarantee. The demo itself runs on synthetic data.

**Recognition.** Third place for Daytona · Top 8 finalist, Daytona HackSprint

**Stack.** FastAPI, Next.js, ElevenLabs, Pydantic, Hypothesis

**Workflow.** Voice intake → Clinical rules → Nurse sign off → Cited prior auth draft

## Technical detail and evidence

- Ten auditable clinical rules drive escalation. Every rule that fires is stored with the verdict, and the highest urgency wins.
- Faxed referrals are untrusted files, so they are decoded inside an isolated Daytona sandbox before any model sees the text.
- If any step fails, whether the sandbox, the model, or the document, the referral escalates to a human. No code path auto clears a patient.
- The voice layer cannot say a diagnosis: every line passes an output filter inside the synthesizer. A nurse signs off before anything is booked.
- The workflow drafts prior authorizations with a source citation on every sentence and navigates a mock payer phone tree.
- Also used: SQLAlchemy, CopilotKit, Fireworks, Daytona, and Braintrust.

## Links

- [Devpost submission](https://devpost.com/software/meridian-dyzt52)

**Connected to.** Penn Medicine, Neuropath, Centren Health, Seqra
