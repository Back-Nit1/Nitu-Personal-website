# Auspex

*Foundation phase / Research tool* · Projects / Games & products

> Understanding the probabilities behind sports markets.

Auspex turns a proposed position on a sports prediction market into an auditable analysis: normalized legs, timestamped evidence, probability estimates, market price comparison, and correlation aware combo math.

It’s there to help someone think a bet through, not to promise certainty or place wagers automatically. A valid answer can be consider, pass, avoid, or insufficient data, and every estimate must state its uncertainty and how fresh its evidence is.

**My part.** Research and prediction workflow design.

**Outcome.** Research → estimate → calibrate. Only the foundation exists: monorepo, API, database, typed contracts, and CI. No product screens or prediction models have been built yet.

**Stack.** React, TypeScript, FastAPI, PostgreSQL

**Workflow.** Research → Estimate → Calibrate

## Technical detail and evidence

- Quantitative work lives in typed deterministic code. Language models may only assist with parsing, evidence classification, and explanations.
- The first version is pregame analysis and paper trading only, with no trading credentials, no automatic execution, and no public access.
- Cross language contracts are generated from Pydantic models so the web app and API can’t drift apart.
- Also planned: TanStack Query, SQLAlchemy, Alembic, and Playwright.

**Connected to.** Volleyball, Autonomy & learning
