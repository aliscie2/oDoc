# Complete Promise Payment System Guide

## What is a Promise?
A **Promise** is a commitment to pay someone a specific amount of money when certain conditions are met. Think of it like a smart contract IOU that tracks obligations and enforces behavioral standards through economic incentives. Unlike traditional payments, promises don't immediately transfer money - they create a binding commitment that can be managed through various states before completion.

---

## 🔐 Core Permission System

### **Creating Promises**
| Action | Who Can Do It | Requirements |
|--------|---------------|--------------|
| Create a new promise | **Only you** (as the sender) | • Sufficient balance to cover the promise<br>• Must respect karma-based amount limits<br>• Cannot exceed behavioral restriction caps |

**What happens when you create a promise:**
- **No money leaves your account yet** - This is just a commitment to pay
- **Your available spending limit decreases** - The system reserves this amount so you can't overspend
- **The recipient gets notified** - They'll see your payment promise in their notifications
- **The promise is recorded** - Both parties can see the promise status

### **Promise Status Management**
| Status Change | Sender Can Do | Receiver Can Do | Financial Impact |
|---------------|---------------|-----------------|------------------|
| **Release Payment** | ✅ Yes | ❌ No | Money actually transfers from sender to receiver |
| **Request Cancellation** | ✅ Yes | ❌ No | No immediate money change, notifies receiver |
| **Confirm Promise** | ❌ No | ✅ Yes | No money moves, but commitment strengthens |
| **Confirm Cancellation** | ❌ No | ✅ Yes | Promise amount returns to sender's available spending |
| **Object to Promise** | ❌ No | ✅ Yes | Promise amount returns to sender's available spending |
| **Approve High-Value Promise** | ❌ No | ✅ Yes | Large promise commitment remains, funds may be escrowed |

### **Promise Deletion Rules**
| Scenario | Who Can Delete | Financial Effect | Conditions |
|----------|----------------|------------------|------------|
| **Unconfirmed promise** | ✅ Sender | Spending limit restored | Status must be "None" or "Request Cancellation" |
| **Confirmed promise** | ❌ Nobody | Use cancellation process | Requires mutual agreement |
| **Released promise** | ❌ Nobody | Permanent transaction record | Money has already moved |
| **Contract-wide deletion** | ✅ Contract Owner | All reservations released | Only if no confirmed promises exist |

---

## 🚨 Behavioral Restrictions & Account Limits

### **Cancellation Penalty System**
- **Trigger**: 3 consecutive promise cancellations
- **Penalty**: $50 maximum cap on all promises (send/receive)
- **Duration**: 30 days from the 3rd consecutive cancellation
- **Financial Impact**: Severely limits your spending and earning capacity
- **Reset Condition**: Complete promises successfully without cancellation

### **Trust Score (Karma) Restrictions**
- **Low Trust Threshold**: Karma score ≤ 1.5
- **Restriction**: Cannot send or receive promises > $100
- **Duration**: Until karma score improves above 1.5
- **Financial Impact**: Blocks access to high-value transactions
- **Improvement Methods**: Successful promise completion, increased transaction volume, or paid karma boost

### **Dispute Abuse Prevention**
- **Trigger**: Making 3 disputes (as disputer)
- **Penalty**: Cannot refund money from your own promises
- **Duration**: 30 days from the 3rd dispute
- **Financial Impact**: Can still receive payments, but lose refund privileges

---

## 📊 Karma Score Calculation System

### **Dynamic Karma Formula**
```
Final Karma = (Debt-to-Activity Ratio) × Weight Factor

Debt-to-Activity Ratio = abs(debt - spent) / abs(debt + spent)
```

### **Weight Factor Components**
| Factor | Impact | Financial Relevance |
|--------|--------|-------------------|
| **User Interactions** | 1-3 users: w=1.0-3.0<br>3+ users: w=5.0 | More interactions unlock higher transaction limits |
| **Objection Count** | 0-2: w=5.0<br>3-6: w=3.0<br>7-12: w=2.0<br>12+: w=0.5 | Objections directly reduce earning potential |
| **Transaction Volume** | <$100: w=2.5<br>$100+: full weight | Higher volume maintains better limits |

### **Karma Score Benefits**
- **High Karma (>3.0)**: Access to premium features and zero fees
- **Medium Karma (1.5-3.0)**: Standard transaction limits up to $100+
- **Low Karma (≤1.5)**: Restricted to $100 maximum transactions

---

## 💰 Financial System & Balance Management

### **Balance Verification System**
```
Available Balance ≥ (Existing Debts + New Promise Amount)

PLUS behavioral restrictions:
• 3 consecutive cancellations → Max $50 for 30 days
• Karma ≤ 1.5 → Max $100 indefinitely  
• 3 disputes made → No refunds for 30 days
```

### **Fund Reservation & Escrow**
**Regular Promises:**
- Funds checked at creation but not immediately locked
- Your spending limit decreases by promise amount
- Money only moves when you "release" the payment

**High Promise (Escrow):**
- Funds immediately locked and non-refundable by default
- Money sits in escrow until released or special refund conditions met
- Receiver must approve before funds can be released

### **Debt Calculation**
```
Total Debt = Confirmed Promises + High Promises + Pending Obligations

Your available spending = Account Balance - Total Debt
```

### **High Promise Escrow Refund Requirements**
To get your escrowed money back, you must meet ALL conditions:
- **Transaction Volume**: Release payments totaling 150% of the High Promise amount
- **User Interaction**: Successfully interact with at least 7 different users
- **Karma Requirement**: All 7 users must have karma scores > 2.5
- **Commission Fee**: 1% deducted from refunded amount

---

## 📊 Promise Status Lifecycle & Financial Impact

| Status | Description | Financial State | Next Actions |
|--------|-------------|-----------------|--------------|
| **None** | Newly created promise | Spending limit reduced, no money moved | Confirm, Cancel, or Object |
| **Confirmed** | Receiver accepted | Spending limit still reduced, commitment stronger | Release payment or request cancellation |
| **Released** | Payment completed | Money transferred, debt cleared | *Final state* |
| **Request Cancellation** | Sender wants to cancel | No change until receiver responds | Wait for cancellation confirmation |
| **Confirmed Cancellation** | Mutually cancelled | Spending limit restored, no money moved | *Final state* |
| **High Promise** | Large amount in escrow | Funds locked immediately | Approve or object |
| **Approve High Promise** | Escrow approved | Funds remain locked until released | Release or meet refund criteria |
| **Objected** | Disputed by receiver | Spending limit restored | Dispute resolution required |

---

## 🔄 Common Financial Scenarios

### **Scenario 1: Successful Payment**
1. **Create Promise**: You promise $200 to Alice
   - Your balance: $1000 → still $1000
   - Available spending: $1000 → $800
2. **Alice Confirms**: Promise becomes binding
   - No money moves yet
3. **Release Payment**: You complete the transaction
   - Your balance: $1000 → $800
   - Alice's balance: increases by $200
   - Your debt: decreases by $200

### **Scenario 2: Cancelled Promise**
1. **Create Promise**: You promise $500 to Bob
   - Available spending: decreases by $500
2. **Bob Confirms**: Promise is binding
3. **Request Cancellation**: You change your mind
4. **Bob Confirms Cancellation**: Mutual agreement
   - Available spending: restored by $500
   - No money ever moved

### **Scenario 3: High Promise Escrow**
1. **Create High Promise**: You promise $2000 to Carol
   - $2000 immediately locked in escrow
   - Available spending: decreases by $2000
2. **Carol Approves**: Escrow is activated
3. **Release Payment**: Money moves from escrow to Carol
   - Your debt: cleared
   - Carol receives: $2000

### **Scenario 4: Disputed Promise**
1. **Create Promise**: You promise $300 to Dave
   - Available spending: decreases by $300
2. **Dave Objects**: Disputes the promise
   - Available spending: restored by $300
   - Promise enters dispute resolution

---

## 🎯 Advanced Reward System & Premium Benefits

### **Zero Fees & Commissions**
**Requirements**: 6 months of dispute-free activity with users having karma > 3.0
**Financial Benefits**: 
- 0% transaction fees on all promises
- 0% commission on karma score increases
- Maximum earning potential preserved

### **Loyalty Cashback Program**
**Requirements**: Maintain karma > 4.0 for 12 consecutive months
**Financial Benefits**:
- 50% cashback on all previous commissions paid
- Retroactive fee refunds for qualifying period
- Significant cost savings over time

### **Green Flag Status**
**Requirements**: 3 months of zero disputes while interacting with karma > 3.0 users
**Financial Benefits**:
- Free karma score improvements (no commission required)
- Access to higher transaction limits
- Reduced costs for behavioral improvements

---

## 💡 Financial Best Practices

### **Managing Your Money Effectively**
1. **Monitor Available Spending**: Track how promises affect your spending capacity
2. **Understand Escrow Implications**: High Promises lock funds immediately
3. **Plan for Behavioral Limits**: Avoid consecutive cancellations to prevent $50 caps
4. **Build Karma Strategically**: Higher karma = higher transaction limits
5. **Calculate Refund Requirements**: Ensure you can meet 150% volume for High Promise refunds

### **Optimizing Transaction Costs**
1. **Work Toward Premium Status**: Achieve zero-fee transactions
2. **Maintain High Karma**: Avoid commission fees on improvements
3. **Minimize Disputes**: Preserve refund privileges and avoid penalties
4. **Strategic High Promises**: Only use when you're confident about completion

### **Understanding Your Financial Position**
- **Account Balance**: Total money you actually have
- **Available Spending**: Balance minus outstanding promise commitments
- **Total Debt**: All confirmed promises you must eventually pay
- **Karma Score**: Determines your transaction limits and fee structure

---

## ⚠️ Money Safety & Protection

### **Built-in Financial Protections**
- **Spending Limits**: Cannot promise more than you have
- **Confirmation System**: Recipients must acknowledge commitments
- **Reversibility**: Most promises can be cancelled with mutual agreement
- **Transparency**: All financial changes are tracked and notified
- **Escrow Security**: High-value promises are protected by locked funds

### **Common Financial Mistakes to Avoid**
- **Over-promising**: Creating more commitments than you can afford
- **Ignoring Behavioral Limits**: Triggering spending caps through poor behavior
- **Misunderstanding Escrow**: Not realizing High Promise funds are immediately locked
- **Poor Karma Management**: Limiting your earning potential through disputes
- **Neglecting Refund Planning**: Creating High Promises without meeting refund criteria

---

## 🔧 Technical Implementation & Security

### **Financial Transaction Security**
- **Reentrancy Protection**: Prevents double-spending attacks
- **Integer Overflow Prevention**: Protects against calculation errors
- **Real-time Balance Verification**: Ensures sufficient funds before transactions
- **Immutable Transaction Records**: Permanent audit trail for all money movements

### **Gas Optimization & Costs**
- **Batch Operations**: Multiple promises in single transaction to reduce fees
- **Efficient State Management**: Minimizes blockchain costs
- **Layer 2 Integration**: Lower fees for small transactions
- **Smart Contract Upgrades**: Transparent improvements without fund risk

---

## 📞 Support & Financial Troubleshooting

### **Common Financial Errors**
- **"Insufficient Balance"**: Your available funds are less than your promise commitments
- **"Amount Exceeds Limit"**: Your karma score or behavioral restrictions prevent this amount
- **"Refunds Blocked"**: You've hit the 3-dispute penalty
- **"High Promise Cannot Be Cancelled"**: Must use special refund process with 150% volume requirement
- **"Escrow Refund Requirements Not Met"**: Need more transactions or higher-karma user interactions

### **Account Recovery Options**
- **Karma Rehabilitation**: Improve score through successful transactions
- **Behavioral Penalty Recovery**: Wait out time-based restrictions
- **Dispute Resolution**: Appeal unfair system decisions
- **Community Support**: Get help from experienced users

---

## 🎯 Key Takeaways

### **Understanding Promise Finances**
- **Promises are commitments, not immediate payments** - Money only moves when you "release"
- **Your spending capacity is always reduced** by active promise amounts
- **Different promise types have different financial implications** - especially High Promises with escrow
- **Behavioral penalties directly impact your earning potential** - maintain good karma for maximum benefits

### **Maximizing Financial Benefits**
- **Build high karma** to unlock premium features and zero fees
- **Maintain dispute-free periods** to preserve all privileges
- **Strategic promise management** prevents costly behavioral penalties
- **Long-term thinking** leads to cashback and loyalty rewards

### **System Philosophy**
This financial system creates a self-regulating ecosystem where good behavior is economically rewarded and poor behavior carries increasing costs. Users are incentivized to maintain high standards while multiple pathways exist for improvement and recovery. The goal is to create a trustworthy, transparent, and mutually beneficial payment environment for all participants.

---

*Your financial success in this system depends on understanding both the technical mechanics and the behavioral incentives. By managing your promises responsibly and building positive relationships, you can access increasingly beneficial terms while contributing to a healthier payment ecosystem for everyone.*