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
  - Deploy Cycles ledger canister
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

- Implement Identity Verification:
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
