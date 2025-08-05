# oDoc

**A centralized freelance A-to-Z workflow platform built on decentralized architecture - combining AI automation with blockchain security.**

<p align="center">
  <img src="https://pbs.twimg.com/media/GtaU37aWAAAea3F?format=jpg&name=medium" alt="oDoc Platform" width="100%">
</p>

## 🎯 What is oDoc?

oDoc revolutionizes the entire freelance lifecycle - from job discovery to project completion and payment - through a unified platform. While providing centralized workflow management, it's built on decentralized Internet Computer blockchain for data ownership, security, and censorship resistance.

**The Complete Freelance Solution:**
- AI-powered job matching and application automation
- Voice-activated calendar and scheduling management  
- Blockchain-based project agreements and payments
- Reputation system with verifiable work history
- Integrated communication and collaboration tools


## [Join discord](https://discord.gg/HD2MbpuN)
## follow us on tweeter [odoc](https://x.com/odoc_ic/) & [icpjobs](https://x.com/icpjob/) 
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

Then edit `vite.config.ts` and change line:
```typescript
target: "http://localhost:YOUR_DFX_PORT"  // Replace with your port
```

### Access Your Application
```bash
yarn start
# Open http://127.0.0.1:5173/
```


### 📺 oDoc Code Video Tutorials
[![Watch Tutorial](https://img.youtube.com/vi/Pcba0_JW2Xc/hqdefault.jpg)](https://www.youtube.com/watch?v=Pcba0_JW2Xc&list=PLZ54FkZk9dwFjC0AyFv6elMA4VGE6N50T)

### 🧪 Demo
[![Watch Demo](https://img.youtube.com/vi/aZCgwIt5j7s/hqdefault.jpg)](https://youtu.be/aZCgwIt5j7s)

### 🔐 Contract Demo
[![Watch Contract Demo](https://img.youtube.com/vi/3UYPuOPWa9A/hqdefault.jpg)](https://youtu.be/3UYPuOPWa9A)


## 🏗️ Tech Stack

### Frontend
- **React 18** - Modern UI with concurrent features
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first styling

### Decentralized Backend
- **Internet Computer** - Web3 blockchain for scalable dApps
- **Rust** - High-performance canister development
- **WebAssembly** - Efficient blockchain execution
- **Candid** - Type-safe service interfaces

### AI Integration
- **Multiple Providers** - Anthropic, Google Gemini, DeepSeek
- **Natural Language Processing** - Voice commands and parsing
- **Machine Learning** - Smart matching and behavioral analysis

## ✨ Complete Freelance Workflow

### 🔍 Job Discovery & Applications
- **AI Job Matcher** - Intelligent opportunity matching with scoring
- **Automated Applications** - Resume analysis and cover letter generation  
- **Quality Filtering** - Remove low-value opportunities automatically
- **Market Intelligence** - Salary insights and demand analytics

### 📅 Scheduling & Communication
- **Voice Calendar** - "Book client call tomorrow 2pm"
- **Availability Management** - "Available weekdays 9-5"
- **Interview Automation** - Smart scheduling and reminders
- **Client Communication** - Integrated messaging and video calls

### 💼 Project Management
- **Smart Contracts** - Blockchain-based project agreements
- **Milestone Tracking** - Automated progress monitoring
- **Time Tracking** - Built-in productivity analytics
- **File Collaboration** - Real-time document editing

### 💰 Payments & Finance
- **Crypto Payments** - Native cryptocurrency processing
- **Automated Invoicing** - Smart contract-based billing
- **Escrow Services** - Secure milestone-based payments
- **Financial Analytics** - Income tracking and tax reporting

### 📊 Reputation & Growth
- **Karma Score** - Blockchain-verified work history
- **Dynamic Profiles** - Auto-updating portfolios
- **Skill Verification** - Decentralized credential system
- **Network Building** - Trust-based professional connections

## 🌟 Vision: Centralized Experience, Decentralized Foundation

### The Complete Freelance Operating System
Transform fragmented freelance tools into one seamless workflow:
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

## 🛠️ Development Commands
You can already find the staging website on by visiting [aliscie2.github.io/oDoc/](https://aliscie2.github.io/oDoc/)
but becareful everytime reloading the page make sure to go to `/odoc/` to get odoc.
```bash
# Daily development workflow
dfx start  --background --host 127.0.0.1:4943 
make deploy-all
yarn start
```
# Run oisy wallet
- only if you want to test it, u should not need this step otherways
```bash
## for testing oisy wallet
# - make sure u run dfx start  --background --host 127.0.0.1:4943  if not laready run than
git clone https://github.com/dfinity/oisy-wallet-signer
cd oisy-wallet-signer/demo
npm ci
npm run dev:wallet
# - make sure it run on ` http://localhost:5174/`
```

## 🧪 Testing

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

## Pocket ic testig
... the new version not working.

## 🐛 Troubleshooting
Look at the make file it may help,

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

## 📚 Manual Setup (Advanced)

```bash
# 1. Clean start
dfx start  --background --clean  --host 127.0.0.1:4943 

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

## 🎯 Strategic Domains

- **icpjobs.com** - AI-powered job matching platform
- **calendarTalk.com** - Voice-activated scheduling system
- **odoc.app** - Complete freelance workflow suite

## 🗺️ Roadmap

### Phase 1: Core Workflow (Current)
- [x] AI job matching algorithm
- [x] Tolk to your calendar  
- [x] Blockchain payment system
- [x] Promise escrow contract
- [X] Karma scoring system

### Phase 2: Advanced Automation
- [ ] AI project managers
- [ ] Automated client onboarding
- [ ] Smart contract templates
- [ ] Advanced analytics dashboard

### Phase 3: Ecosystem Growth
- [ ] Plugin marketplace
- [ ] Multi-blockchain support
- [ ] DAO governance
- [ ] Global freelancer network

## 🤝 Contributing

Building the future of freelance work:

1. **Fork and branch** - Create feature branches for development
2. **Follow conventions** - TypeScript/Rust standards with tests
3. **Test thoroughly** - Ensure blockchain operations work correctly  
4. **Document well** - Clear code comments and feature descriptions
5. join our discord
6. check list of tasks here https://discord.gg/HD2MbpuN

## 📄 License

Open source under MIT License. Previous versions at [Odoc-old repository](https://github.com/aliscie/Odoc-old).

---

**Transforming freelance work through centralized experience on decentralized infrastructure.**