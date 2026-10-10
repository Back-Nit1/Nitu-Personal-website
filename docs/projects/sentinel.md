# Sentinel

*Hackathon / Deployed demo* · Projects / Agents & reliability

> Chargeback investigations that bring scattered evidence together.

When a customer tells their bank they never got an order, the bank pulls the money back and the store has about a week to prove otherwise. Sentinel handles that like a careful ops person: it reads the dispute in Stripe, looks the customer up in Salesforce, searches Gmail, and decides whether to fight, accept, or ask a person.

Then it acts, and reads every system back to confirm the write actually landed. If one silently didn’t, it retries safely or escalates.

**My part.** Agent loop, policy guardrails, readback verification, and the evaluation harness.

**Outcome.** 7 of 7 evaluation scenarios passed · 0 false actions. Run against real Stripe test mode, with a sandbox standing in for Salesforce, Gmail, and Slack. Runs against hosted twin services were not completed.

**Stack.** Next.js, TypeScript, Stripe, Salesforce, Claude

**Workflow.** Investigate → Decide → Act → Readback verify

## Technical detail and evidence

- Policies live in code: no action before a recorded decision, nothing after a deadline, and accepting a dispute over $200 waits for a named human approval.
- An idempotency ledger sends each action once, and a retry re reads state first so a late landing write is recognized instead of repeated.
- A chaos harness injects dropped writes, server errors, and timeouts, and the case timeline shows them as injected failures.
- After the loop, Sentinel reads Stripe, Salesforce, and Slack itself. A case is resolved only if every postcondition passes.

**Connected to.** Themis, Cerno / IntentLock, Covenant
