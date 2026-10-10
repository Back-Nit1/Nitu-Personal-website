# Covenant

*Deployed / Base mainnet* · Projects / Games & products

> Crowdfunding where money is released only against public evidence.

Donations sit in a smart contract escrow, not in the creator’s wallet. When a campaign’s donations cover its current milestone, the creator posts public proof, and posting it releases exactly that milestone’s amount in the same transaction. The rest stays locked.

An event indexer keeps the application in step with what happened on the blockchain, so every donation, evidence update, and release is a permanent public record.

**My part.** Smart contracts, backend services, and the application workflow.

**Outcome.** 40 REST endpoints serving indexed activity. Deployed on Base mainnet.

**Stack.** Solidity, Next.js, Node.js, SQLite, Base

**Workflow.** Fund escrow → Cover milestone → Post evidence → Release payout

## Technical detail and evidence

- A milestone can only release once the campaign’s own donations cover it, so no campaign can ever be paid out of another campaign’s escrow.
- Evidence can be a URL, an IPFS link, or text. An earlier version required donor approval before release; that deployment was retired.
- Features include audit trails, creator reputation, and an event indexer with backfilling.
- Also used: Scaffold ETH 2, OpenZeppelin, Hardhat, RainbowKit, Express, AWS EC2, Nginx, and PM2.

## Links

- [Contract on BaseScan](https://basescan.org/address/0x9CA2E453462b87584f5A4D15f5962a4f2174BCE9)

**Connected to.** Themis, Praedos, Sentinel
