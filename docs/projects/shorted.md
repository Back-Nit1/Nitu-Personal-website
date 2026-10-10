# Shorted

*Early implementation* · Projects / Games & products

> Making missing item refund requests easier to explain.

Shorted turns “half my DoorDash order is missing” into a specific, evidenced, correctly priced refund claim. It compares a receipt with photos or other evidence, identifies what’s missing, works out its value, and drafts an itemized explanation.

**My part.** Core logic, services, ingestion, migrations, and tests.

**Outcome.** Itemized evidence, not a guessed total. The core logic exists. The money math is not yet verified against real receipts, and the interface, receipt parser, and live model integration are unfinished.

**Stack.** TypeScript, Expo, Zod, Supabase

**Workflow.** Receipt → Compare evidence → Value missing items → Draft explanation

## Technical detail and evidence

- Every piece of data must come from a real order a real person placed. No fixtures, no generated receipts.
- The money and matching logic is pure code with no network, no database, and no model calls, so it can be tested directly. Item matching is a global assignment rather than a greedy guess.
- Fees the system doesn’t recognize are left out of the refund calculation rather than guessed.
- A corpus test is red on purpose until real receipts are hand verified, and the receipt parser waits on the real email format instead of an imagined one.
- Gmail ingestion stores raw HTML before parsing and checks the real sender domain before reading a body.

**Connected to.** Praedos, Themis
