# VoteChain — Blockchain-Based E-Voting System

A blockchain-powered electronic voting platform built to explore how decentralized ledger technology can solve the trust, transparency, and security problems that plague traditional and legacy electronic voting systems. Voters authenticate with MetaMask, cast one immutable vote per wallet against a Solidity smart contract deployed on the Ethereum Sepolia testnet, and results are tallied and displayed in real time.

This repository is the practical implementation accompanying the dissertation *"Developing a Blockchain-Based E-Voting System."* The write-up (`web3voting.md`) covers the full research context, methodology, and evaluation this README summarizes below.

## Why this exists

Traditional voting systems — paper-based or electronic — share a common weakness: they depend on a central authority to run the election, count the votes, and be trusted to have done both honestly. That creates real, recurring problems:

- **Security vulnerabilities** — centralized systems are single points of failure for hacking, tampering, and vote manipulation.
- **Lack of transparency** — voters have no way to independently verify that their vote was recorded or counted as cast.
- **Fraud risk** — ballot stuffing, duplicate voting, and impersonation are hard to rule out after the fact.

Blockchain's core properties — decentralization, immutability, and cryptographic verification — map directly onto these problems. Once a vote is written to the chain, it can't be quietly altered, and anyone can audit the ledger without needing to trust the entity that ran the election.

## Aim & Objectives

**Aim:** Design and build a blockchain-based e-voting system that improves election security, transparency, and trustworthiness over conventional systems, while remaining simple enough for non-technical voters to use.

**Objectives:**
1. Design a secure, immutable voting workflow using blockchain technology.
2. Use wallet-based cryptographic identity (MetaMask) for voter authentication instead of passwords.
3. Implement vote casting and tallying via a smart contract, removing the need for a trusted central counter.
4. Evaluate the system's security, performance, and usability against real test scenarios.

## How it works

1. **Login** — the voter connects their MetaMask wallet from the browser. The wallet address *is* the voter's identity; there's no separate account or password.
2. **Vote** — the voter picks a candidate from the list pulled live from the smart contract. The backend builds and signs the transaction (so the voter doesn't need testnet ETH of their own) and submits it to Sepolia.
3. **Enforcement on-chain** — the smart contract keeps a `hasVoted` mapping keyed by wallet address, so a second vote from the same wallet is rejected by the contract itself, not just by application logic.
4. **Results** — vote counts are read directly from the contract (`getCandidates`) and rendered as a live chart, so anyone can independently query the same contract and see identical numbers.

```
Browser (MetaMask) ──▶ Express API (server.js) ──▶ web3.js ──▶ Infura ──▶ Sepolia testnet
                                                                       │
                                                          EVoting.sol smart contract
                                                     (candidates, hasVoted, vote counts)
```

## Tech stack

| Layer | Technology |
|---|---|
| Smart contract | Solidity `^0.8.0` |
| Blockchain network | Ethereum Sepolia testnet (via Infura) |
| Backend | Node.js, Express.js, `web3.js` |
| Frontend | HTML, CSS, vanilla JavaScript, Chart.js |
| Wallet / identity | MetaMask |

## Project structure

```
.
├── server.js              # Express API: serves the frontend, reads candidates, signs & sends vote transactions
├── voting.sol             # EVoting smart contract (candidates, hasVoted, vote, getCandidates)
├── public/
│   ├── index.html         # Login screen (MetaMask connect)
│   ├── homepage.html      # Candidates list + poll results
│   ├── css/styles.css     # UI styling
│   └── js/
│       ├── login.js       # MetaMask connect flow for the login page
│       ├── homepage.js    # Candidate rendering, tab switching, vote submission
│       └── chart.js       # Poll results chart (Chart.js)
├── .env.example           # Template for required environment variables
└── web3voting.md          # Accompanying dissertation / research write-up
```

## Smart contract

`EVoting.sol` is intentionally minimal — the point is to keep the trust-critical logic (one vote per address, valid candidate check) on-chain where it can't be bypassed by the backend:

- `constructor(string[] candidateNames)` — seeds the contract with the candidate list at deployment.
- `vote(uint candidateId, address voter)` — reverts if `voter` has already voted or `candidateId` doesn't exist; otherwise increments the candidate's tally and marks the voter as having voted.
- `getCandidates()` — returns the full candidate list with live vote counts.
- `hasVoted(address)` — public mapping, queryable by anyone.
- `Voted(address indexed voter, uint indexed candidateId)` — emitted on every successful vote, giving an auditable on-chain event log.

## Getting started

**Prerequisites:** Node.js, an Infura (or similar) Sepolia RPC endpoint, a funded Sepolia wallet to pay gas, and MetaMask installed in your browser.

```bash
npm install
cp .env.example .env   # then fill in your own values below
npm start
```

`.env` requires:

```
CONTRACT_ADDRESS=   # deployed EVoting contract address on Sepolia
INFURA_URL=         # your Sepolia RPC endpoint
PRIVATE_KEY=        # private key of the wallet that pays gas for votes — never commit this
SENDER_ADDRESS=     # address matching PRIVATE_KEY
PORT=3000
```

Then open `http://localhost:3000` with MetaMask installed and connected to Sepolia.

> **Never commit `.env`.** It's already excluded via `.gitignore`. If a private key is ever exposed in a repo, chat log, or shared doc, treat it as compromised and rotate it — even on a testnet, keys are sometimes reused by habit, which is the real risk.

## Testing & results

The system was evaluated end-to-end — smart contract unit/integration/edge-case testing via Remix, API load testing, and a UX questionnaire with 11 participants. Headline results from that evaluation:

| Metric | Result |
|---|---|
| Voter registration success rate | 96.55% (28/29 transactions) |
| Vote casting success rate | 96.30% (26/27 transactions) |
| Duplicate-vote prevention | 100% (25/25 correctly rejected) |
| Invalid wallet submission handling | 100% (26/26 correctly rejected) |
| Average gas per vote | ~60,000 units |
| Average API response time | 200–300 ms |
| User satisfaction (ease of use, visual design) | 4.4+ / 5 |

Full methodology and discussion are in `web3voting.md` §4.

## Known limitations

- **Scalability** — throughput is bounded by Sepolia/Ethereum block times and gas costs; a mainnet or high-volume deployment would need layer-2 scaling (rollups/sidechains) to stay cost-effective.
- **Gas fees** — even optimized, public-chain gas costs are a real constraint for large-scale elections; this implementation pays gas from a single funding wallet, which doesn't scale indefinitely.
- **Voter privacy** — votes are pseudonymous (tied to a wallet address, not an identity), but wallet addresses and vote choices are publicly visible on-chain. There's no zero-knowledge or homomorphic-encryption layer here to break that link.
- **User familiarity** — wallet-based login is unfamiliar to many voters; clearer onboarding/education materials would matter for real-world use.
- **Regulatory fit** — using this in an actual election would require alignment with local electoral law, which varies significantly by jurisdiction and isn't addressed by the code itself.

## Possible future directions

- Zero-knowledge proofs or homomorphic encryption to decouple wallet identity from vote choice.
- Layer-2 deployment (rollups/sidechains) to cut gas costs at scale.
- Multi-chain support beyond Ethereum.
- Real-time monitoring/analytics on contract health and voting activity.
- Decentralized storage (e.g. IPFS) for auxiliary election metadata, with content hashes referenced on-chain for tamper detection.

## Disclaimer

This is a research/academic project running against a public **testnet**. It is not audited for production or real-election use. Treat any wallet keys used with it as disposable, and do not reuse them for real funds.
