# Promise Permissions Guide

## What is a Promise?
A **Promise** is a commitment to pay someone a specific amount of money when certain conditions are met. Think of it like a smart contract IOU that tracks obligations and enforces behavioral standards through economic incentives.

---

## 🔐 Core Permission System

### **Creating Promises**
| Action | Who Can Do It | Requirements |
|--------|---------------|--------------|
| Create a new promise | **Only you** (as the sender) | • Sufficient balance to cover the promise<br>• Must respect karma-based amount limits<br>• Cannot exceed behavioral restriction caps |

### **Promise Status Management**
| Status Change | Sender Can Do | Receiver Can Do | System Requirements |
|---------------|---------------|-----------------|---------------------|
| **Release Payment** | ✅ Yes | ❌ No | • Sufficient balance<br>• No self-payments<br>• Not blocked by dispute penalties |
| **Request Cancellation** | ✅ Yes | ❌ No | • Auto-notifies receiver<br>• Counts toward cancellation limit |
| **Confirm Promise** | ❌ No | ✅ Yes | • Receiver acceptance only<br>• Activates escrow if high-value |
| **Confirm Cancellation** | ❌ No | ✅ Yes | • Mutual agreement to cancel<br>• Releases sender's reserved funds |
| **Object to Promise** | ❌ No | ✅ Yes | • Flags for dispute resolution<br>• Counts toward dispute limit |
| **Approve High-Value Promise** | ❌ No | ✅ Yes | • For amounts requiring special approval<br>• Locks sender's funds until resolved |

### **Promise Deletion Rules**
| Scenario | Who Can Delete | Conditions |
|----------|----------------|------------|
| **Unconfirmed promise** | ✅ Sender | • Status must be "None" or "Request Cancellation" |
| **Confirmed promise** | ❌ Nobody | • Requires cancellation process instead |
| **Released promise** | ❌ Nobody | • Transaction completed, permanent record |
| **Contract-wide deletion** | ✅ Contract Owner | • Only if no confirmed promises exist |

---

## 🚨 Behavioral Restrictions & Account Limits

### **Cancellation Penalty System**
- **Trigger**: 3 consecutive promise cancellations
- **Penalty**: $50 maximum cap on all promises (send/receive)
- **Duration**: 30 days from the 3rd consecutive cancellation
- **Reset Condition**: Complete promises successfully without cancellation
- **Purpose**: Prevent promise spam and encourage commitment

### **Trust Score (Karma) Restrictions**
- **Low Trust Threshold**: Karma score ≤ 1.5
- **Restriction**: Cannot send or receive promises > $100
- **Duration**: Until karma score improves above 1.5
- **Improvement**: Through successful promise completion, increased transaction volume, or paid karma boost
- **Anti-Sybil**: Prevents new accounts from accessing high-value transactions

### **Dispute Abuse Prevention**
- **Trigger**: Making 3 disputes (as disputer)
- **Penalty**: Cannot refund money from your own promises
- **Duration**: 30 days from the 3rd dispute
- **Impact**: Can still receive payments, but no refund privileges
- **Purpose**: Discourage frivolous dispute filing

---

## 📊 Karma Score Calculation System

### **Action Rating Components**
Your karma score is dynamically calculated based on multiple factors every time you interact with promises:

| Factor | Weight Impact | Description |
|--------|---------------|-------------|
| **User Interactions** | Base multiplier (w) | • 1-3 users: w = 1.0-3.0<br>• 3+ users: w = 5.0<br>• More interactions = higher weight |
| **Objection Count** | Penalty multiplier | • 0-2 objections: w = 5.0<br>• 3-6 objections: w = 3.0<br>• 7-12 objections: w = 2.0<br>• 12+ objections: w = 0.5 |
| **Transaction Volume** | Activity bonus | • <$100 total: w = 2.5<br>• $100+ total: maintains full weight<br>• Higher volume shows commitment |
| **Debt-to-Activity Ratio** | Core metric | `abs(debt - spent) / abs(debt + spent)`<br>• Measures financial reliability<br>• Lower ratio = better score |

### **Karma Calculation Formula**
```
Final Karma = (Debt-to-Activity Ratio) × Weight Factor

Where Weight Factor considers:
- Number of unique users interacted with
- Total objections received against your promises  
- Combined transaction volume (spent + received)
```

### **Historical Karma Tracking**
Every promise action creates a permanent `ActionRating` record containing:
- **Snapshot Karma**: Your score at that moment
- **Financial State**: Spent, received, promises, and debt amounts
- **Transaction Context**: Which promise triggered the rating
- **Timestamp**: When the action occurred
- **Progress Tracking**: Historical trend of your karma evolution

### **Dynamic Score Updates**
Your karma recalculates automatically when:
- Creating a new promise
- Releasing a payment
- Receiving an objection
- Interacting with new users
- Changing your debt-to-activity ratio

### **Karma Score Enhancement**
- **Organic Growth**: Karma improves through successful promise completion and increased user interactions
- **Volume Incentive**: Higher transaction volumes (spent + received) maintain better weight factors
- **Relationship Building**: Interacting with more unique users significantly boosts your weight multiplier
- **Objection Management**: Keeping objections low (under 3) maintains maximum karma potential
- **Paid Method**: Commission-based karma boost with sliding fee scale *(if implemented)*
- **Historical Performance**: Your karma history shows consistent behavioral patterns over time

---

## 📊 Promise Status Lifecycle

| Status | Description | Who Controls | Next Possible States |
|--------|-------------|--------------|---------------------|
| **None** | Newly created, awaiting action | System default | Confirmed, Request Cancellation, Objected |
| **Confirmed** | Receiver accepted the promise | Receiver only | Released, Request Cancellation, Objected |
| **Released** | Payment completed and transferred | Sender only | *Final state* |
| **Request Cancellation** | Sender wants to cancel | Sender only | Confirmed Cancellation, Objected |
| **Confirmed Cancellation** | Both parties agree to cancel | Receiver only | *Final state - cancelled* |
| **High Promise** | Large amount with funds locked (escrow) | System flag | Approve High Promise, Objected |
| **Approve High Promise** | Large escrow amount approved by receiver | Receiver only | Released, *Special refund conditions only* |
| **Objected** | Disputed by receiver | Receiver only | *Requires manual resolution* |

---

## 💰 Financial System & Balance Management

### **Balance Verification Formula**
```
Available Balance ≥ (Existing Debts + New Promise Amount)

PLUS behavioral restrictions:
• 3 consecutive cancellations → Max $50 for 30 days
• Karma ≤ 1.5 → Max $100 indefinitely  
• 3 disputes made → No refunds for 30 days
```

### **Fund Reservation & Escrow System**
- **Regular Promises**: Checked at creation, not reserved until confirmed
- **High Promise (Escrow)**: Funds immediately locked, non-refundable by default
- **Reserved Funds**: Cannot be spent until promise resolved
- **Special Refund Conditions**: High Promise refunds require meeting strict criteria

### **High Promise Escrow Refund Requirements**
To refund a High Promise, you must meet ALL conditions:
- **Transaction Volume**: Release payments totaling 150% of the High Promise amount
- **User Interaction**: Successfully interact with at least 7 different users
- **Karma Requirement**: All 7 users must have karma scores > 2.5
- **Commission Fee**: 1% deducted from refunded amount
- **Example**: $300 High Promise requires $450 in released payments + 7 qualified interactions

### **Debt Calculation System**
```
Total Debt = Confirmed Promises + High Promises + Pending Obligations

Debt Categories:
• High Promise: Added to debt immediately upon creation
• Confirmed Promise: Added to debt when receiver confirms
• Regular Promise: No debt until confirmed
• Released Promise: Removed from debt upon completion
```

### **Commission Structure**
- **Transaction Fees**: Standard platform commission on completed promises
- **Karma Boost Fees**: Sliding scale based on current karma level
- **Penalty Fees**: Additional charges for behavioral violations
- **Revenue Sharing**: High karma users may earn dividends from platform fees

---

## 🔄 Typical Promise Workflows

### **Standard Success Flow**
1. **Sender creates promise** → System validates balance and restrictions
2. **Receiver confirms** → Promise becomes binding, funds may be reserved
3. **Sender releases payment** → Money transfers, karma scores updated
4. **Promise completed** → Debt cleared, positive behavioral record

### **Mutual Cancellation Flow**
1. **Sender requests cancellation** → Receiver gets automatic notification
2. **Receiver confirms cancellation** → Promise cancelled, funds released
3. **Cancellation recorded** → Counts toward sender's cancellation limit
4. **System updates** → Behavioral scores adjusted accordingly

### **Dispute Resolution Flow**
1. **Receiver objects to promise** → Promise flagged for review
2. **System investigation** → Manual or automated dispute resolution
3. **Resolution applied** → Funds distributed per ruling
4. **Behavioral impact** → Dispute counts recorded for both parties

### **High-Value Escrow Promise Flow**
1. **Sender creates High Promise** → Funds immediately locked in escrow
2. **Non-refundable commitment** → Cannot be cancelled like regular promises
3. **Receiver approves** → Promise becomes active with locked funds
4. **Standard completion** → Payment released from escrowed funds
5. **Special refund option** → Only available after meeting 150% volume + 7 user criteria

---

## ⚠️ System Protection Mechanisms

### **Anti-Fraud Measures**
- **Self-Payment Prevention**: Cannot send promises to yourself
- **Balance Verification**: Real-time checks before all operations
- **Role Enforcement**: Strict sender/receiver permission boundaries
- **Behavioral Monitoring**: Statistical analysis for unusual patterns

### **Anti-Gaming Protections**
- **Time-Weighted Karma**: Prevents rapid score manipulation
- **Economic Barriers**: Commission costs deter Sybil attacks
- **Progressive Penalties**: Escalating costs for repeated violations
- **Cross-Validation**: Multiple data sources for behavioral scoring

### **Immutable Promise Elements**
Once created, these cannot be changed:
- **Promise Amount**: Fixed monetary value
- **Receiver Address**: Cannot reassign to different user
- **Creation Timestamp**: Permanent audit trail
- **Promise ID**: Unique identifier for tracking

---

## 🎯 Advanced Reward System

### **Premium Benefits (Zero Fees & Commissions)**
**Requirements**: 6 months of dispute-free activity with users having karma > 3.0
**Benefits**: 
- 0% transaction fees on all promises
- 0% commission on karma score increases
- Priority customer support
- Enhanced platform features

### **Loyalty Cashback Program** *(Planned Feature)*
**Requirements**: Maintain karma > 4.0 for 12 consecutive months with minimal disputes
**Benefits**:
- 50% cashback on all previous commissions paid
- Retroactive fee refunds for qualifying period
- Exclusive access to beta features
- VIP status recognition

### **Green Flag Status (Free Karma Boost)**
**Requirements**: 3 months of zero disputes while interacting with karma > 3.0 users
**Benefits**:
- Free karma score improvements (no commission required)
- Green verification badge on profile
- Enhanced trust rating display
- Preferential matching with high-karma users

---

## 🎯 Behavioral Incentive System

### **Positive Reinforcement**
- **Completion Streaks**: Bonus karma for consecutive successful promises
- **Volume Bonuses**: Higher karma gains for larger successful transactions
- **Time Bonuses**: Extended successful relationships earn compound rewards
- **Community Recognition**: Top performers get platform visibility

### **Negative Consequences**
- **Cancellation Caps**: Repeated cancellations trigger spending limits
- **Dispute Penalties**: Excessive disputes block refund privileges
- **Karma Decay**: Inactive accounts slowly lose karma score
- **Progressive Fees**: Bad behavior triggers escalating costs

### **Recovery Mechanisms**
- **Rehabilitation Periods**: Time-based recovery from penalties
- **Good Behavior Bonuses**: Accelerated karma recovery for consistent users
- **Community Vouching**: Peer recommendations can boost recovery
- **Educational Incentives**: Learn platform best practices for karma

---

## 💡 Best Practices for Users

### **For Promise Senders**
1. **Verify your balance** before creating promises to avoid failures
2. **Understand High Promise implications** - funds are immediately locked and non-refundable
3. **Avoid consecutive cancellations** to prevent $50 spending caps
4. **Build karma strategically** by increasing user interactions and transaction volume
5. **Minimize objections** by clear communication and reliable promise fulfillment
6. **Monitor your debt-to-activity ratio** to maintain optimal karma scores
7. **Plan for High Promise refunds** by ensuring you can meet 150% volume requirements
8. **Target high-karma users** (>3.0) to unlock premium rewards and green flag status

### **For Promise Receivers**
1. **Confirm promises promptly** to show good faith participation
2. **Use objections sparingly** to avoid dispute penalties and maintain eligibility for rewards
3. **Communicate issues** before formal disputes when possible
4. **Understand High Promise escrow** - these are serious commitments with locked funds
5. **Build reputation** through reliable acceptance and reasonable objections
6. **Maintain high karma** (>3.0) to help others achieve premium benefits

### **For All Users**
1. **Monitor your karma score** regularly to understand your limits and reward eligibility
2. **Track your karma history** through the ActionRating records to see improvement trends
3. **Plan for behavioral restrictions** when managing multiple promises
4. **Understand the economic incentives** built into the system
5. **Work toward premium benefits** by maintaining dispute-free periods
6. **Engage with diverse users** to maximize your interaction count weight factor
7. **Balance your financial activity** to optimize your debt-to-activity ratio
8. **Consider long-term karma goals** for cashback and zero-fee benefits

---

## 🔧 Technical Implementation Notes

### **Smart Contract Security**
- **Reentrancy Protection**: Prevents recursive call attacks
- **Integer Overflow Prevention**: SafeMath for all calculations
- **Access Control**: Role-based permissions with time locks
- **Upgrade Mechanisms**: Transparent proxy patterns for improvements

### **Gas Optimization**
- **Batch Operations**: Multiple promises in single transaction
- **State Minimization**: Efficient storage patterns
- **Event Logging**: Comprehensive audit trails
- **Layer 2 Integration**: Lower fees for small promises

### **Monitoring & Analytics**
- **Behavioral Pattern Detection**: ML-based anomaly identification
- **Performance Metrics**: Real-time system health monitoring
- **User Analytics**: Privacy-preserving behavioral insights
- **Dispute Analysis**: Automated resolution for common cases

---

## 📞 Support & Troubleshooting

### **Common Permission Errors**
- **"Insufficient Balance"**: Check available funds vs. total commitments and debt
- **"Amount Exceeds Limit"**: Review karma restrictions and behavioral caps
- **"Cannot Modify Promise"**: Verify your role and promise status
- **"Refunds Blocked"**: Check if you've hit the 3-dispute penalty
- **"High Promise Cannot Be Cancelled"**: Use special refund process instead
- **"Escrow Refund Requirements Not Met"**: Verify 150% volume and 7-user criteria

### **Getting Help**
- **Documentation**: Comprehensive guides available in platform
- **Community Forums**: Peer support and best practices sharing  
- **Direct Support**: Contact team for technical issues or disputes
- **Governance Participation**: Vote on platform improvements and policies

### **Account Recovery**
- **Karma Rehabilitation**: Time-based recovery from behavioral penalties
- **Dispute Appeals**: Formal process for challenging system decisions
- **Educational Resources**: Learn optimal platform usage patterns
- **Community Mediation**: Peer-assisted conflict resolution

---

*This system creates a self-regulating ecosystem where good behavior is economically rewarded and poor behavior carries increasing costs, naturally encouraging users to maintain high standards while providing multiple pathways for improvement and recovery.*