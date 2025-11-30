# oDoc

<p align="center">
  <img src="https://pbs.twimg.com/profile_images/1992121858154516480/FuADUuuT_400x400.jpg" alt="oDoc Logo" width="200">
</p>

**Your AI Secretary - A complete freelance workflow platform combining AI automation with blockchain security**

<p align="center">
  <img src="https://pbs.twimg.com/media/G3MpeTgXcAAp3VO?format=jpg&name=large" alt="oDoc Platform" width="100%">
</p>

---

## ⚠️ Important: Contract Validation Rules

**All promise/contract validation logic is located at:**
```
src/backend/src/contracts/custom_contract/validation_promise_rules.rs
```

---

## 🎯 What is oDoc?

oDoc revolutionizes the entire freelance lifecycle - from job discovery to project completion and payment - through a unified platform. Built on the Internet Computer blockchain, it provides centralized workflow convenience with decentralized data ownership, security, and censorship resistance.

**The Complete Freelance Solution:**
- 🤖 AI-powered job matching and application automation
- 🗓️ Voice-activated calendar with Google Calendar integration
- 💰 Blockchain-based smart contracts and crypto payments
- ⭐ Reputation system with verifiable work history
- 💬 Integrated communication and collaboration tools

### Current Traction
- **300+** registered users
- **~$200** deposited in smart contracts
- **20+** active job and talent listings
- **Latest updates:** [odoc.app/about](https://odoc.app)

---

## 🚀 Quick Start

### Prerequisites

```bash
# Required tools
Node.js 18+ and Yarn
Rust and Cargo  
DFX (Internet Computer SDK)
```

### One-Command Setup

```bash
git clone https://github.com/aliscie2/oDoc
cd odoc
make deploy-all
```

### Port Configuration (Important!)

After deployment, get your DFX port and update Vite config:

```bash
dfx info webserver-port
```

Edit `vite.config.ts` and update:
```typescript
target: "http://localhost:YOUR_DFX_PORT"  // Replace with your port
```

### Access Your Application
```bash
yarn start
# Open http://127.0.0.1:5173/
```

---

## 🌐 Live Deployments

- **Production**: [icpjobs.com](https://icpjobs.com) - Main platform
- **Development**: [odoc.app](https://odoc.app) - Feature testing
- **Staging**: [aliscie2.github.io/oDoc/](https://aliscie2.github.io/oDoc/) - GitHub Pages

---

## 📺 Resources

### Video Tutorials
[![Watch Tutorial](https://img.youtube.com/vi/Pcba0_JW2Xc/hqdefault.jpg)](https://www.youtube.com/watch?v=Pcba0_JW2Xc&list=PLZ54FkZk9dwFjC0AyFv6elMA4VGE6N50T)

### Platform Demo
[![Watch Demo](https://pbs.twimg.com/media/G3YezjmXwAATCOf?format=jpg&name=medium)](https://youtu.be/UAPcuwq6Pl8)

### Smart Contract Demo
[![Watch Contract Demo](https://img.youtube.com/vi/3UYPuOPWa9A/hqdefault.jpg)](https://youtu.be/3UYPuOPWa9A)

---

## ✨ Complete A→Z Freelance Workflow

### 🔍 AI Job Match

**Problems Solved:**
- Freelancers struggle to build networks and find relevant opportunities
- LinkedIn and Upwork create noise and friction
- Wasted time on irrelevant applications

**How It Works:**
1. AI Profile Builder extracts accurate user data and suggests missing skills
2. AI matches jobs with match scores (60%-100%)
3. Filters bad matches using inverted index
4. Generates personalized cover letters
5. Flags contradictions and prevents application overflow
6. One-click connect sends booking link via email

**Key Features:**
- Auto-extract skills and references
- Quality-based filtering
- Smart cover letter generation
- Match score visualization

---

### 📅 Smart Calendar

**A calendar that actually understands you** - Set availability once and let Smart Calendar handle conflicts, rescheduling, and time-zone coordination.

**Problems Solved:**
- Multiple calendar conflicts
- Emergency rescheduling with excessive back-and-forth
- Time-boxing failures
- Context-based scheduling needs

**Fluid Availability Concept:**
- Set availability patterns: "Every day 9 AM to 1 PM"
- Context-aware booking: business meetings, phone-only days, screen-share availability
- Natural language commands: "Shift my availability by -1 hour"
- Auto-check connected calendars for overlaps

**Features:**
- Voice-activated scheduling
- Google Calendar integration
- Optimistic updates for instant responsiveness
- Multi-account support
- Custom booking links (15m, 30m, 1h)

**Technical Details:** See [`CALENDAR_SYSTEM_GUIDE.md`](src/frontend/pages/calendar/CALENDAR_SYSTEM_GUIDE.md)

---

### 💼 Crypto Agreements (Promises)

**On-chain promises that act as contracts and task managers**

**How to Create a Promise:**
1. Set amount, receiver, type (escrow or simple), and conditions
2. Deposit funds first (proof-of-existence)
3. Promise appears in receiver's notifications and to-do list
4. Receiver confirms → becomes active task and agreement
5. Complete milestone → automated payment release

**Types of Proof & Reputation:**
- **Proof of Existence** - Deposit required before contract creation
- **Proof of Cap** - New users capped to prevent abuse
- **Proof of Stake/Penalties** - Repeated cancellations increase stake/lock periods
- **Reputation Impact** - Cancellation history affects karma visible on profile

**Validation Rules:** All contract logic is in `validation_promise_rules.rs` (see top of README)

---

## 🏗️ Tech Stack

### Frontend
- **React 18** - Modern UI with concurrent features
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first styling

### Architecture Evolution

**Current**: Component-based (example: chatBot module)
```
chatBot/
├── components/
│   ├── InputBox.tsx
│   ├── MessageHistory.tsx
│   └── ChatWindow.tsx
├── hooks/
│   ├── useChatState.ts
│   └── useChatActions.ts
├── utils/
│   └── messageFormatter.ts
└── types.ts
```

**Future**: Feature-Based Architecture for better scalability

### Decentralized Backend
- **Internet Computer (ICP)** - Web3 blockchain for scalable dApps
- **Rust** - High-performance canister development
- **WebAssembly** - Efficient blockchain execution
- **Candid** - Type-safe service interfaces

### AI Integration
- **Multiple Providers** - Anthropic Claude Haiku, DeepSeek
- **Natural Language Processing** - Voice commands and parsing
- **Machine Learning** - Smart matching and behavioral analysis

---

## 🌟 Vision: Centralized Experience, Decentralized Foundation

### The Problem ODOC Solves

**Fragmentation Issues:**
- Multiple platforms required: PayPal for payments, Upwork for contracts, LinkedIn for networking, ClickUp for management
- Complex payment chains: Bank → Credit Card → PayPal → Platform → Freelancer
- Time waste: 2+ months searching for reliable partners

**Financial Burden:**
Independent developers earning $5,000/month face:
- Platform fees: 15% ($750)
- Payment processing: 3% ($150)
- Currency conversion: 2% ($100)
- Administrative overhead: 32.5% of working time (52 hours/month)
- **Net availability: Only 49.9% of gross income immediately accessible**

### Our Solution

**The Complete Freelance Operating System:**
- **Single Dashboard** - Manage jobs, projects, payments, and growth
- **AI Automation** - Eliminate repetitive tasks and optimize workflows
- **End-to-End Integration** - From job search to payment completion
- **Professional Growth** - Built-in career development and skill tracking

### Decentralized Advantages

While providing centralized convenience, built on blockchain for:
- **Data Ownership** - Freelancers own their work history and reputation
- **Censorship Resistance** - No platform can block or manipulate records
- **Global Access** - Works anywhere without banking restrictions
- **Transparent Payments** - Immutable payment and contract history
- **Cost Reduction** - Eliminate platform fees (up to 20% savings)
- **Time Savings** - Reduce administrative overhead by 70%

---

## 🛠️ Development Commands

### Daily Development Workflow
```bash
# Start local development
dfx start --background --host 127.0.0.1:4943 
make deploy-all
yarn start

# Development utilities
make diagnose    # Check canister status, cycles, WASM sizes
make first-run   # Initial setup for new developers
make test-all    # Run complete test suite
```

### PWA Development
```bash
# Test PWA functionality
yarn build
yarn preview
# Install as PWA from browser for testing
```

### Optional: Oisy Wallet Testing
Only needed if testing wallet functionality:
```bash
git clone https://github.com/dfinity/oisy-wallet-signer
cd oisy-wallet-signer/demo
npm ci
npm run dev:wallet
# Ensure it runs on http://localhost:5174/
```

---

## 🧪 Testing

### Playwright Tests
```bash
# Full test suite
yarn playwright test

# Interactive debugging
yarn playwright test --ui --debug

# Browser-specific testing  
yarn playwright test --project=chromium

# Generate new tests
yarn playwright codegen http://localhost:5173/
```

### Unit Testing with Pocket IC
Comprehensive testing framework for ICP canisters:
- Backend canister testing with mocked environments
- ckUSDT deposit/withdrawal simulation
- Contract lifecycle testing
- GitHub Actions CI integration

```bash
yarn test
yarn test:unit
yarn test:integration
```

---

## 🗺️ Roadmap

### Phase 1: Core Workflow ✅
- AI job matching
- Voice calendar
- Blockchain payments
- Karma scoring
- PWA support
- Real-time sync

### Phase 2: Next Milestones 🚧
**Coming Soon:**
- USDC and USDT deposit options
- Zero-knowledge KYC via ICP identity providers
- Enhanced affiliate rewards and earnings management
- Improved UI/UX and notification system
- Mobile offline app support

### Phase 3: Growth & Scale 🔜
**At 500 Users:**
- Advanced filtering and UI tutorials
- Automated workflows
- AI project managers
- Smart contract templates

**At 1,000+ Users:**
- Multi-domain deployment
- Plugin marketplace
- Multi-blockchain support
- DAO governance
- Enterprise features (Slack, Notion, Discord integrations)
- Team Spaces (AI-assisted collaboration)

**Long-term Vision:**
- AI autonomously hires, creates contracts, verifies completion, and releases payments
- Full decentralization via NNS/SNS
- On-chain KYC with zero-knowledge proofs

---

## 📈 Marketing Strategy

### Growth Channels
- Email collection during onboarding
- Event hubs: Lisbon, Bali, Kuala Lumpur, Singapore, USA
- Branded merchandise for community representatives
- Customizable avatar/logo strategy for viral growth

### Viral Mechanics
- Share booking links and docs
- Affiliate rewards for user referrals
- SEO optimization and website growth focus

---

## 🔐 Security

ODOC leverages ICP's decentralized architecture for enterprise-grade security:

- **Tamper-proof Records** - Immutable blockchain audit trails
- **No Single Points of Failure** - Distributed network architecture
- **Verified Access** - Internet Identity authentication
- **Fraud Prevention** - Cryptographic transaction validation
- **Encrypted Communication** - Secure messaging between users
- **Consensus-based Validation** - Trustless transaction verification
- **AI-Enhanced Security** - Intelligent risk assessment

---

## 🐛 Troubleshooting

### WASM Target Issues
```bash
rustup target remove wasm32-unknown-unknown
rustup self uninstall
brew uninstall rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
cargo install --locked wasm-bindgen-cli
rustup target add wasm32-unknown-unknown
cargo clean && cargo update
```

### Desktop Development (macOS)
```bash
brew install zstd llvm clang openssl gcc rocksdb
brew tap homebrew/versions
brew install gcc7 --use-llvm
rustup target add wasm32-unknown-unknown
```

---

## 📚 Manual Setup (Advanced)

```bash
# 1. Clean start
dfx start --background --clean --host 127.0.0.1:4943 

# 2. Deploy backend
dfx deploy backend

# 3. Deploy and configure Internet Identity
dfx deploy internet_identity
WASM_II_FOUND=$(find . -name "internet_identity.wasm.gz" -type f)

# 4. Deploy ledger (if available)
sh scripts/deploy_ledger.sh

# 5. Generate declarations and install dependencies
dfx generate
yarn install

# 6. Start development server
yarn start
```

---

## 🤝 Contributing

Building the future of freelance work together:

1. **Fork and branch** - Create feature branches for development
2. **Follow conventions** - TypeScript/Rust standards with comprehensive tests
3. **Test thoroughly** - Ensure blockchain operations work correctly  
4. **Document well** - Clear code comments and feature descriptions
5. **Join our community** - [Discord](https://discord.gg/HD2MbpuN)
6. **Check tasks** - Available at [Discord task board](https://discord.gg/HD2MbpuN)

### Community Links
- **Discord**: [discord.gg/HD2MbpuN](https://discord.gg/HD2MbpuN)
- **Twitter**: [@odoc_ic](https://x.com/odoc_ic/) | [@icpjobs](https://x.com/icpjob/)

---

## 📄 License

Open source under MIT License. Previous versions at [Odoc-old repository](https://github.com/aliscie/Odoc-old).

---

**Transforming freelance work through centralized experience on decentralized infrastructure.**

*Version: Beta | Development Duration: 4 months | Built on Internet Computer Protocol*
