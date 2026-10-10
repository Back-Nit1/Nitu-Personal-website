# Themis

*Synthetic data prototype* · Projects / Agents & reliability

> An auditable workflow for transaction disputes.

A customer texts about a charge they don’t recognize. Themis finds the transactions, resolves the merchant, gathers evidence, classifies the dispute, and proposes an action. The AI interprets; a deterministic policy authorizes. Those two jobs never blur.

**My part.** Implemented the contracts and fixtures; scaffolded the services and dashboard.

**Outcome.** Allow · deny · human review. A prototype running on synthetic data. It is not connected to live banking or real money.

**Stack.** Python, AWS Strands, Bedrock, Cedar, DynamoDB

**Workflow.** Identify → Collect evidence → Classify → Policy decision

## Technical detail and evidence

- The model never has unilateral authority over money or accounts. Its proposals pass a Cedar plus Python policy that returns allow, deny, or require human review, and only an allowed action executes.
- One frozen, versioned contract of 20 tools is shared by the gateway, the dispatcher, and the tests. Mutations are idempotent and every decision is written to an audit trail.
- Messaging runs over RCS and SMS with duplicate admission control, retries, and case email. An operations dashboard shows cases, merchants, reports, and human review requests.
- Reports store structured evidence and rationale, never hidden chain of thought.
- The wider design uses React, TypeScript, Zod, Bedrock AgentCore, S3, CDK, Lambda, and CloudWatch.

**Connected to.** Trustworthy agents, Why the Greek names?, Covenant, Cerno / IntentLock, Sentinel, Shorted
