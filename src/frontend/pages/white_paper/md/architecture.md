# Architecture

## System Overview

ODOC is a decentralized platform for managing crypto agreements, escrow services, and collaborative work between freelancers and business owners. Built on the Internet Computer (IC) using Rust backend and React frontend.

![ODOC Platform Structure](https://pbs.twimg.com/media/GtaU37aWAAAea3F?format=jpg&name=medium)

## Key Innovations

### 1. AI Job Matcher

Intelligent freelancer-client pairing with automated networking alerts and skill-based matching.

### 2. Promises Contract System

Milestone-based agreements with automated payment tracking and release conditions.

### 3. AI dispute handler and AI Auto rlease

not integrated yet

---

### Platform: Internet Computer Protocol (ICP)

#### Core Components

- **Smart Contract Canisters**: Backend logic for task management, payments, and governance
- **Decentralized Identity**: User-controlled identity management
- **Distributed Storage**: Resilient data storage across network nodes
- **P2P Communication**: Direct user interactions via ICP protocols
- **Automated Escrow**: Milestone-based payment releases

---

## Core Architecture Components

### User Types & Workflows

**Business Owners:**

- Register → Make deposit → AI matching → Create documents → Define milestones → Create promises/payments → Research/manage

**Freelancers:**

- Register/login → Access shared documents OR create own → Receive payments (locked until release) → Complete tasks

### Backend Architecture (Rust/IC)

```rust
// Core Data Structures
pub struct User {
    pub id: String,
    pub name: String,
    pub email: String,
    pub description: String,
    pub photo: Vec<u8>,
}

pub struct CustomContract {
    pub id: String,
    pub name: String,
    pub creator: String,
    pub date_created: f64,
    pub date_updated: f64,
    pub contracts: Vec<CContract>,
    pub payments: Vec<CPayment>,
    pub promises: Vec<CPayment>,
    pub formulas: Vec<Formula>,
    pub permissions: Vec<ContractPermissionType>,
}

pub struct FileNode {
    pub id: FileId,
    pub parent: Option<FileId>,
    pub name: String,
    pub children: Vec<FileId>,
    pub share_id: Option<String>,
    pub author: String,
    pub permission: ShareFilePermission,
    pub users_permissions: HashMap<Principal, ShareFilePermission>,
    pub content_id: Option<String>,
    pub workspaces: Vec<String>,
}

pub struct Chat {
    pub id: String,
    pub name: String,
    pub admins: Vec<Principal>,
    pub members: Vec<Principal>,
    pub messages: Vec<Message>,
    pub creator: Principal,
    pub workspaces: Vec<String>,
}

pub struct WorkSpace {
    pub id: String,
    pub name: String,
    pub chats: Vec<String>,
    pub files: Vec<String>,
    pub members: Vec<Principal>,
    pub admins: Vec<Principal>,
    pub creator: Principal,
}

pub struct CPayment {
    pub contract_id: ContractId,
    pub id: String,
    pub amount: f64,
    pub sender: Principal,
    pub receiver: Principal,
    pub date_created: f64,
    pub date_released: f64,
    pub status: PaymentStatus,
    pub cells: Vec<CCell>,
}
```

## Core System Architecture

### 1. User Management System

- **Authentication**: Internet Identity (primary) + Google OAuth (calendar integration)
- **User Types**: Business owners, Freelancers
- **User State**: Security tracking (withdrawal/deposit status, transfer dates)
- **AI Credits**: Credit system for AI services

### 2. Document & Contract System

- **Central Text Editor**: Unified interface for managing tasks, payments, contracts, documentation
- **FileNode Structure**: Hierarchical file organization with sharing capabilities
- **Custom Contracts**: Promise-based agreements with milestones, payments, formulas
- **Contract Types**: Current (promises), Future (dividend/shares)

### 3. Payment & Financial System

- **Escrow Services**: Secure payment holding until release
- **CKUSDC Integration**: Deposit/withdraw functionality
- **Payment Confirmation**: Multi-party confirmation system
- **Wallet**: Transaction history storage

### 4. Communication System

- **Real-time Chat**: WebSocket-based messaging via Omnia
- **Notifications**: Promise/payment status updates
- **Friend System**: Friend requests, friend-only chats
- **Group Management**: Admin/member roles

### 5. AI & Matching System

- **AI Job Matcher**: Keyword-based inverted indexing for skill matching
- **Microsoft Phi Model**: AI agent integration in text editor
- **Skill-based Discovery**: User matching based on capabilities

### 6. Social & Discovery System

- **Discovery Page**: Social posts, likes, comments
- **Friend Network**: Social connections and discovery
- **User Discovery**: Through AI matching and social features

### 7. Calendar Integration

- **Google Calendar**: Event creation and availability checking
- **Event Management**: Intersection detection, scheduling
- **Availability Tracking**: User availability management

### 8. Security & Anti-Fraud System

- **Capping System**: 3 consecutive cancellations → $50 cap on 4th promise
- **Staking Mechanism**: Volume-based staking (30 days for <$100, shorter for >$100)
- **Reentrancy Protection**: Transfer state tracking with 5-minute timeout
- **Reset Mechanism**: 30-minute reset capability for stuck transactions

### 9. Karma & Reputation System

- **Success Rate**: Released vs canceled payments ratio
- **Dispute Resolution**: Time-based karma calculation
- **Cancellation Impact**: Disputed cancellations affect karma negatively
- **Historical Tracking**: User promise/payment history

### 10. Workspace Organization

- **Purpose**: Simple categorization layer for files and chats
- **Structure**: Contains references to existing files and chats
- **Permissions**: Admin/member access control
- **Lightweight**: No complex hierarchy, just organizational grouping

## Data Storage & Management

### Storage Systems

- **IC Table Structure**: Primary data persistence
- **User History**: Promise/payment tracking
- **Wallet History**: Transaction records

### Current Limitations

- **No Version Control**: Updates overwrite existing data, (Texteditor, files, trash and recovering deleted files)
- **Lost Dispute History**: Multiple dispute resolutions not tracked
- **Planned Improvement**: Append-only history system

### Future Enhancements

- **Historical Versioning**: Maintain complete update history
- **Dispute Tracking**: Full dispute resolution timeline
- **Karma Enhancement**: Better tracking of dispute resolution times

## Component Hierarchy

```
ODOC Platform
├── Users (Business Owners, Freelancers)
├── Custom Contracts (Core business logic)
│   ├── Promises/Payments
│   ├── Milestones
│   ├── Formulas
│   └── Permissions
├── FileNodes (Hierarchical document structure)
├── Chats (Communication system)
├── Financial System
│   ├── Escrow
│   ├── Wallet
│   └── Payment Processing
├── AI & Matching Services
├── Social Features
│   ├── Friend System
│   ├── Discovery Page
│   └── Notifications
├── Calendar Integration
├── Security Systems
│   ├── Karma System
│   ├── Capping/Staking
│   └── Anti-fraud
├── Affiliate Program
└── WorkSpaces (Organizational layer)
    ├── File References
    └── Chat References
```

## Architecture Flow

### 1. User Registration Flow

```
Internet Identity → User Creation → Profile Setup → AI Credit Allocation → Affiliate Tracking
```

### 2. Contract Creation Flow

```
Text Editor → Contract Definition → Milestone Creation → Promise/Payment Setup → Escrow Lock
```

### 3. Payment Flow

```
Promise Creation → Escrow Lock → Task Completion → Payment Confirmation → Release/Dispute
```

### 4. Communication Flow

```
User Action → WebSocket → Real-time Update → Notification → UI Update
```

### 5. AI Matching Flow

```
User Profile → Skill Extraction → Keyword Indexing → Matching Algorithm → Recommendations
```

## Testing & Development

- **Methodology**: Test-driven development (TDD)
- **Tools**: Pocket-IC with Playwright
- **Focus**: End-to-end testing of contract flows

## External Integrations

- **Google Calendar**: Event management and scheduling
- **Microsoft Phi**: AI agent for text editing
- **Omnia WebSocket**: Real-time communication
- **Internet Identity**: Primary authentication

## Technical Stack

### Backend

- **Language**: Rust
- **Platform**: Internet Computer (IC)
- **Storage**: IC Table Structure
- **Authentication**: Internet Identity
- **WebSocket**: Omnia

### Frontend

- **Framework**: React
- **Text Editor**: Custom text using platejs built on top of slatejs
- **Authentication**: internet identity
- **Real-time**: WebSocket connections

### Services

- **AI**: Microsoft Phi model on runpod.io
- **Calendar**: Google Calendar API integrated with our custom calendar
- **Payments**: CKUSDC integration
- **Testing**: Pocket-IC + Playwright

This architecture centers around the contract system as the core business logic, with workspace serving as a simple organizational tool for better file and chat management.
