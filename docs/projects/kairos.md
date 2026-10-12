# Kairos

*Built / Funding workflow* · Projects / Agents & reliability

> Finding funding without inventing the founder’s story.

Kairos is an agent that watches for nondilutive funding a student founder is actually eligible for, decides which opportunities are worth their time, and drafts most of the application from what it already knows. It interrupts the founder only for the few things it genuinely cannot answer.

Its governing rule is that models perceive and Python decides. Eligibility is plain code, and a drafted application passes an eight check claim gate before anything is called done.

**My part.** Agent workflow with deterministic eligibility and claim validation.

**Outcome.** 1,082 offline tests · 35 mutation tested cases. Working locally, not production ready. Retrieval recall was 85.7% on a 20 program benchmark. The AWS deployment is written but has not been applied, and no model path has been validated against live Bedrock.

**Stack.** FastAPI, Next.js, AWS Strands, Bedrock, SQLite

**Workflow.** Discover programs → Rule based eligibility → Draft → Eight check claim gate

## Technical detail and evidence

- Three sub agents have three different failure modes: an Assessor that judges fit, a Drafter that may invent, and an Auditor that sees only the finished draft and the knowledge base, so it cannot inherit the Drafter’s mistakes.
- The validation gate covers provenance, numeric whitelists, entity checks, closed world checks, and an independent auditor pass.
- Every discarded opportunity is recorded with the exact check that rejected it. Silence is a valid output.
- The curated catalog holds 59 programs, 52 of them verified quote by quote against their live pages.
- Storage and migrations use SQLite and Alembic.
- Broader investor and accelerator support are possible extensions, not built features.

**Connected to.** Campus leadership, Why the Greek names?, Cerno / IntentLock, Hermes
