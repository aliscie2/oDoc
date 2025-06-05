# oDoc
- Decentralized & open source Trustless contracts, tasks, and payment Management on ICP
- **Name** the word odoc stand for open documents
- **Version:** beta | **Date:** 2025-02-07
- **Duration:** 4 months  
- **Intro Link:** [Twitter Announcement](https://x.com/alihushamsci/status/1885269718392590342)
- **Ofocial tweeter**: [odoc_ic](https://x.com/odoc_ic)

---
### Abstract

oDoc is a crypto Agreement platform that eliminates intermediaries in professional collaboration through AI-powered smart contracts on ICP blockchain. The platform serves freelancers, clients, business owners, startups, large companies, and lawyers with unified project matching, automated payments, and dispute resolution.

Traditional platforms force users across multiple tools—Slack, Jira, Upwork, PayPal, PandaDoc—creating inefficiency, high fees, trust issues, and wasted time on logistics instead of building.

oDoc solves this with AI contract automation and ICP blockchain efficiency, providing limitless collaboration without middlemen across all business scales.

---

### Problem Statement

Current project management splits workflows across disconnected platforms, forcing manual coordination between tasks, contracts, and payments. Freelancers risk non-payment, businesses pay excessive fees, and teams waste time on administrative overhead instead of productive work.

---

### Solution Overview

oDoc streamline the work on one single page where users can set thier documents, promises and release them.
**Core Modules:**
1. **SNS** - ODOC DAO
2. **Orygin** - Biometric Identity verfication
3. **AI Job Matcher** - Skill-requirement matching via Ollama Qwen3 + Mistral 7B
4. **AI Auto Release** - Auto release payment when task is done, stake promise fund on dispute
5. **Crypto Agreement** - Smart contract legal framework by ICP
6. **AI Analytics** - Performance tracking and optimization with actitons suggtions 
7. **Karma Score** - Reputation-based trust system

**Anti-Manipulation:**
- Max 50$ promises if Karma score <2
- Dispute staking (7 days to 3 months)
- Commission-based Karma to prevent Sybil attacks  
- AI override for clear dispute resolution

The platform automates the complete workflow from project discovery to payment settlement while preventing fraud through reputation mechanics and financial commitments.


# Tech Strecute   
## SNS
## Origyn
## AI Job matcher
## AI auto release
## Karama
## AI analytics
1. For example, in chat you say to your friend "Let's meet tomorrow 9 AM" The AI suggest to add that to your google calendar. and it add it autoamtilcy. Other example, if you made 3 cancilations it suggest to interview people caefully.

 

---

# Karma
Karama or reputation ODoc’s trust framework combines quantitative metrics and community validation to ensure fairness, accountability, and growth. Below is a hybrid structure for clarity:  

---
Karama score 
0 to 2.5 new user, or punched user 
limtations
can't make or resive prmoise bigger then 50$
Long stake time from 1 to 3 months

2.5 to 3.5
shorter staking time
...

3.5 to 4
...
4+


## User have to pay to increatse thier karama score
Why: to prevent syble attack.

## Quick Reference Table  

| **Trust Score Increases**                          | **Trust Score Decreases**                          |  
|----------------------------------------------------|----------------------------------------------------|  
| High-value transactions (↑ with amount)            | Payment cancellations or disputes (↓ severity-based)|  
| Collaborating with >5 unique users                 | Limited network diversity (≤5 partners)            |  
| Partnering with users scoring ≥3.5/5               | Frequent score volatility (triggers **Risk Flag**) |  
| Receiving ratings from users with ≥4.0/5 (2x weight)| Low Karma Score (unresolved objections)            |  
| Earning badges (e.g., Trust Ambassador)            | Negative social interactions (flagged content)     |  
| Consistent dispute-free behavior                  | New accounts (initial 0 score)                     |  

---

### **Trust Score Growth**  
1. **Transaction Value**  
   - Trust gains scale with payment size (e.g., $1,000 payments accelerate growth 10x faster than $100).  
2. **Network Diversity**  
   - Collaborating with ≤5 users yields minimal gains.  
   - Exponential growth unlocks at >5 unique partners.  
3. **Quality Partnerships**  
   - Interacting with users scoring ≥3.5/5 adds a 15% trust multiplier.  
4. **Weighted Feedback**  
   - Ratings from users with ≥4.0/5 scores have 2x impact.  
5. **Badges**  
   - **Trust Ambassador**: Awarded at 25+ interactions.  
   - **Dual Trust Ambassador**: Granted when partnering with ≥3.5/5 users.  

### **Trust Score Decay**  
1. **Disputes & Cancellations**  
   - Penalties scale with unresolved issues (e.g., a $1,000 cancellation deducts 2x more than $100).  
2. **Network Stagnation**  
   - No growth if collaborating with ≤5 partners for 30+ days.  
3. **Volatility**  
   - Frequent fluctuations (≥3 significant changes/week) trigger a **Risk Flag** for manual review.  
4. **Low Karma**  
   - Unresolved objections or poor community ratings reduce scores.  
5. **New Users**  
   - Start at 0; rebuild trust through consistent positive actions.  

---

### **Dual-Rating Framework**  
- **Karma Score**: Objective metric based on:  
  - Transaction volume/value.  
  - Dispute resolution rate.  
  - Network diversity.  
- **Community Rating**: Subjective feedback from peers.  
  - Users must have a Karma Score ≥3.0/5 to leave comments.  
  - Comments from users with ≥4.0/5 scores are highlighted as "Trusted Feedback."  

---

### Design Philosophy  
- **Growth**: Rewards scale, diversity, and consistency.  
- **Decay**: Penalizes instability, fraud, and low engagement.  
- **Balance**: Combines immutable metrics (Karma) and community-driven validation.  

---

**Key Notes**  
- **Rehabilitation**: Users with low scores regain trust through dispute-free transactions.  
- **Risk Flags**: Manual reviews ensure fairness in volatile cases.  
- **Badges**: Gamify ethical behavior and signal reliability.  

---

# AI Job matcher  
- prevent user from seeking matches with score less then 70%
- algorthim
  - mismatch_list = skill in Job but not in Talent, Note if skills in Talent but not in job is ignored
  - sort matches by mismatch list
  - show top 10
---

# Roadmap  
[see our vision Vision](https://x.com/alihushamsci/status/1878758216756244789)
#### Milestone 1 (30 Days)  
- Frontend unit testing  
- Contracts permissions setup  
- Promises security validation  
- Backend unit tests  
- Update contacts permissions (backend side)  
- View contract permissions configuration  
- Prepare for SNS integration:  
  - Develop whitepaper  
  - Deploy Cycles ledger canister  (!IMPORTANT)
  - Implement sns-js library (or interact with SNS using agent and actor) [Note: decided]  
  - Establish Cycles management strategy:  
    - Provide each user with 1 free TC  
    - Enable payment for cycles via USDC/USDT/ICP/credit card deposit post free cycle usage  
    - Integrate frontend voting for SNS  
    - Implement reproducible SNS tests using Docker [Note: decided]  
  - Setup ODOC TOKines:  
    - Define token symbol as ODOCT  
- Launch the SNS:  
  - Enable decentralized governance for odoc  
  - Allow token holders to participate in key decisions  
  - Transition from centralized control to community-led governance  
  - Implement voting on new updates  

#### Milestone 2 (40 Days)  
- Migrate from Gemeni AI to Olama 
- Use AI light white in brwoser
- Develop Advanced Text Editor:  
  - Implement table functionality  
  - Enable live sharing  
  - Support export in PDF and CSV formats  
  - Incorporate color text options  
  - Allow commenting on text  
- Build Dashboard:  
  - Integrate calendar with events  
  - Implement TODO board:  
    - TODO  
    - Overdo  
    - In progress  
    - Done  
- Create Projects Section:  
  - Allow users to create projects for tracking progress and teams  
  - Enable tagging of contracts and documents with project identifiers  
  - Support workspaces as project names  
  - Plan future AI integration to suggest project details based on document/contract data  
- Implement Submissions Module:  
  - Allow users to create forums for data submission  
  - Support contract submissions via form  
- Design Contract Views:  
  - Charts view  
  - Board view  
  - Gallery view  
- Enhance Shares Contract Functionality:  
  - Enable voting on new share values (requires consent from all shareholders)  
  - Integrate automated calculation formulas:  
    - Example: `if (Age < 18) { 'Not allowed' }`  
    - Additional formula example with extra security confirmation:  
      - `if ( now() == '2022-08-03' ) { transfer_USDT({from: @ali, to: @john}) }`  
      - Formula components:  
        - Trigger (e.g., `now()` or `column('name')`)  
        - Operation (e.g., `==`, `>=`, `<=`, `contains`)  
        - Target value (e.g., `'2022-08-03'`, `'true'`, `'false'`)  
        - Execution (e.g., `transfer_USDT`, `transfer_token`, `transfer_nft`)  
- Testing with Selenium:  
  - Test full app CRUD and transaction flows  
  - Schedule test runs every 30 days or on each push to the main branch  
  - Specific tests:  
    - Login  
    - Register  
    - Create contract  
    - Create document  
    - Send friend request  
    - Access discover page  
    - Create post  
    - Create comment  
    - Reply to comment  
    - Handle long nested replies  
- Test Data Corruption Scenarios:  
  - Ensure data integrity during migrations (adding/renaming/removing fields)  

#### Milestone 3 (30 Days)  
- AI Auto release 
- Implement Orygin Identity Verification:  
  - Require users to verify identity via passport chip for a green profile flag  
- Develop Tokens Collection Mechanism:  
  - Allow users to collect tokens (tokens cannot be purchased)  
  - Actions: Tokens earned from releasing or receiving payments  
  - Diversity: Encourage token collection from multiple users  
  - Community: Earn tokens by creating posts and receiving positive ratings  
- Enable Token Burning:  
  - Allow token burning through refunding nonrefundable promises  
- Define Three Types of Tokens:  
  - Social tokens  
  - Receiver tokens  
  - Sender tokens  
- Establish a 3-Day Token Gain Cycle:  
  - Tokens earned on send actions  
  - Tokens earned on receive actions  
  - Tokens earned on interactions  
- Implement 3 Ways to Burn Tokens:  
  - Burn tokens on cancellation  
  - Burn tokens on objections  
  - Burn tokens when receiving low ratings or dislikes  
- Enhance Advanced Permissions:  
  - Allow sharing of contracts with customizable permissions:  
    - Permission to release payment  
    - Permission to update a column  
    - Permission to view a column  
    - Support role separation (e.g., project manager vs. financial manager)  

#### Milestone 4 (50 Days)  
- Contract Enhancements:  
  - Implement filters  
  - Enable reordering and resizing of columns  
  - Allow reordering of rows  
  - Facilitate update requests  
- Advanced Navigation:  
  - Implement jump links for documents  
  - Develop publish page functionality  
  - Integrate search within content and contracts  
  - Implement pagination  
- Websocket Integration:  
  - Deploy websocket via Docker on AWS on a dedicated server  
- Networking Enhancements:  
  - Enable Mindmaster events  
  - Incorporate AI recommendations for connecting like-minded users  
  - Support creation of both online and physical events  
  - Facilitate custom posts  
- Google Calendar API Integration:  
  - Simplify migration from legacy systems  
- Integrate Notion API  
- Develop Cost Calculator:  
  - Assist managers in estimating costs using deep AI  
- Jobs Application Module:  
  - Allow job postings on the discover page  
  - Enable users to offer and apply for jobs  
  - Track job offers/applications and maintain job history on profiles  

---

# Team  
- **Founder & Visionary:** Sets the strategic direction of odoc and drives the core mission of decentralization and user empowerment.  
- **Chief Technology Officer (CTO):** Leads technical development, ensuring the seamless integration of ICP technologies and the platform’s scalability and reliability.  
- **Community Lead:** Manages user engagement, oversees governance processes, and integrates community feedback into the platform’s evolution.  



# security 🔐

ODoc ensures data integrity and protection against cyber threats for SMEs through its robust, decentralized architecture. Below are the key security features:
- **Tamper-proof Records**: Immutable blockchain records maintain an unalterable audit trail.
- **Decentralized Architecture**: Eliminates single points of failure, reducing attack vectors.
- **Verified Access**: Digital identities (Internet Ident) prevent unauthorized entry.
- **Fraud Prevention**: Cryptographic blockchain transactions and smart contracts secure payments.
- **Secure Communication**: Encrypted messaging and secret key protection ensure confidential collaboration.
- **Real-time Monitoring**: Immediate detection of suspicious activities minimizes risks.
- **AI Assistance**: Optimizes management and reduces human error.
---

# Conclusion  
odoc is set to revolutionize both social networking and order/payment management by leveraging the decentralized, trustless infrastructure of ICP. With a comprehensive multi-token ecosystem and a detailed, phased roadmap, odoc returns control to users and teams, ensuring transparency, accountability, and efficiency without relying on traditional encryption. This initial release, designed to be both cost-effective and rapid, lays the foundation for a future of decentralized digital interactions and community-led governance.  

---

### References  
1. Internet Computer Protocol (ICP) Official Documentation  
2. Standards for Decentralized Identity and Task Management  
3. Blockchain-based Governance Models  
4. Best Practices for Trustless Smart Contract Operations  
