# Payment System Guide: Understanding Your Money

## Overview
This guide explains what happens to your money when you create, update, or delete payment promises in the system. Think of payment promises as IOUs or commitments to pay someone later.

---

## Creating a Payment Promise

### What happens when you create a promise:
1. **No money leaves your account yet** - This is just a commitment to pay
2. **Your available spending limit decreases** - The system reserves this amount so you can't overspend
3. **The recipient gets notified** - They'll see your payment promise in their notifications
4. **The promise is recorded** - Both parties can see the promise status

### Example:
- You have $1000 in your account
- You promise to pay Alice $200
- Your account still shows $1000, but you can only spend $800 on new promises
- Alice sees a notification: "John promised to pay you $200"

---

## Updating a Payment Promise

### Different actions and what they mean:

#### **When you (the sender) update:**

**Releasing Payment:**
- **What happens:** Money actually leaves your account and goes to the recipient
- **Your account:** Decreases by the promise amount
- **Recipient's account:** Increases by the promise amount
- **Notification sent:** "John has released your payment of $200"
- **Status:** Promise becomes a completed payment

**Requesting Cancellation:**
- **What happens:** You ask to cancel a confirmed promise
- **Your account:** No immediate change
- **Notification sent:** "John requests to cancel the $200 payment"
- **Status:** Waiting for recipient's response

#### **When the recipient updates:**

**Confirming Payment:**
- **What happens:** Recipient agrees to your promise
- **Your account:** Still no money moved, but commitment is stronger
- **Spending limit:** Still reduced by promise amount
- **Notification sent:** "Alice confirmed your $200 payment promise"
- **Status:** Promise is now confirmed (harder to cancel)

**Objecting to Payment:**
- **What happens:** Recipient disputes your promise
- **Your account:** Promise amount returns to your available spending
- **Notification sent:** "Alice objected to your $200 payment"
- **Status:** Promise is disputed (needs resolution)

**Approving High Promise:**
- **What happens:** For large amounts, recipient must approve
- **Your account:** Commitment remains, spending limit still reduced
- **Notification sent:** "Alice approved your high-value promise of $2000"
- **Status:** Large promise is now approved

**Confirming Cancellation:**
- **What happens:** Recipient agrees to cancel the promise
- **Your account:** Promise amount returns to your available spending
- **Notification sent:** "Alice confirmed cancellation of $200 payment"
- **Status:** Promise is cancelled, no money moves

---

## Deleting a Payment Promise

### What you can delete:
- **New promises** that haven't been confirmed yet
- **Disputed promises** that were objected to
- **High promises** waiting for approval

### What you CANNOT delete:
- **Confirmed promises** - Use cancellation request instead
- **Released payments** - Money has already moved
- **Already cancelled promises** - Nothing left to delete

### What happens when you delete:
1. **Promise disappears** from both your records and recipient's
2. **Your spending limit increases** - You get back the reserved amount
3. **Recipient gets notified** - "John deleted their $200 payment promise"
4. **No money moves** - Since it was just a promise, no actual funds are affected

### Example of deletion:
- You promised Alice $200 but she hasn't confirmed it yet
- You delete the promise
- Your available spending goes back up by $200
- Alice sees: "John cancelled their payment promise to you"

---

## Money Safety Features

### Your money is protected by:
- **Spending limits** - Can't promise more than you have
- **Status tracking** - Always know where your promises stand
- **Confirmation system** - Recipients must acknowledge large amounts
- **Cancellation process** - Mutual agreement needed for confirmed promises
- **Notification system** - Both parties always know what's happening

### Key Points:
- **Promises don't move money immediately** - They reserve your spending ability
- **Only "Release" actually transfers money** - All other actions are just status changes
- **You stay in control** - Can cancel or delete most promises before they're confirmed
- **Transparency** - Both parties get notified of every change
- **Reversibility** - Most actions can be undone with proper process

---

## Common Scenarios

### Scenario 1: Simple Payment
1. You promise $100 to Bob
2. Bob confirms he'll accept it
3. You release the payment
4. $100 moves from your account to Bob's account

### Scenario 2: Cancelled Promise
1. You promise $500 to Carol
2. Carol confirms it
3. You realize you made a mistake and request cancellation
4. Carol agrees and confirms cancellation
5. No money moves, your spending limit is restored

### Scenario 3: Disputed Payment
1. You promise $300 to Dave for work
2. Dave objects because the work isn't done yet
3. Your $300 becomes available to spend again
4. You can create a new promise when the work is completed

---

## Important Reminders

- **Promises are not payments** - Money only moves when you "release"
- **Check notifications regularly** - Stay updated on promise status changes
- **Confirm carefully** - Once confirmed, promises are harder to cancel
- **Communicate with recipients** - Use the messaging system to discuss payment terms
- **Keep track of your spending limits** - Active promises reduce your available funds

This system is designed to give you control and security over your payments while maintaining transparency with the people you're paying.