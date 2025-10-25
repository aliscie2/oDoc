# Custom Contract View

React-based UI for managing promises/payments between users with complex status workflows, role-based permissions, and real-time backend synchronization.

## Quick Start

Read **[GUIDE.md](./GUIDE.md)** for complete implementation details, troubleshooting, and best practices.

## Status Flow

```
Draft → Confirm → Confirmed → Release → Released ✓
  ↓       ↓          ↓
  └─→ Release Escrow → Approve → Escrow Approved → Release → Released ✓
                         ↓           ↓
                      Object    Request Cancel → Confirm → Cancelled ✓
```

## Key Concepts

### Two Types of Updates

**Sender Actions** (Edit via Redux)
- Edit amount, receiver, conditions
- Updates `filesState.changes`
- Saved via `multi_updates` when user clicks Save

**Receiver Actions** (Direct Backend Calls)
- Confirm, approve, object, cancel
- Calls backend directly → refetch → `SET_CONTRACT`
- Does NOT update `filesState.changes` (backend already has it)

### Status Reference

| Backend | Frontend | Who Can Act |
|---------|----------|-------------|
| None | Draft | Sender: edit/release, Receiver: confirm/object |
| HighPromise | Escrow Released | Receiver: approve/object |
| ApproveHighPromise | Escrow Approved | Sender: release/cancel, Receiver: object |
| Confirmed | Confirmed | Sender: release/cancel, Receiver: object |
| Objected(text) | Objected | Sender: release, Receiver: edit objection |
| Released | Released | Final - no actions |
| RequestCancellation | Request Cancel | Sender: release, Receiver: confirm/object |
| ConfirmedCancellation | Cancelled | Final - no actions |

## Component Structure

```
components/
├── AgreementView.tsx       # Main container
├── PromiseCard.tsx         # Individual promise card
├── ContractHeader.tsx      # Header with filters
├── ConditionCell.tsx       # Editable condition
└── UserSelect.tsx          # User selector

lib/
├── validation.ts           # Validation logic & status mapping
├── notifications.ts        # Notification utilities
└── theme-colors.ts         # Theme colors
```

## Common Issues

**"Invalid status for new payment creation"**
- Receiver actions were adding to `filesState.changes`
- Solution: Use `SET_CONTRACT` (not `UPDATE_PROMISE`) after backend calls

**Infinite re-renders**
- useEffect dependency includes state it updates
- Solution: Remove circular dependencies

**Status selector empty**
- Current status not in allowed transitions
- Solution: Always include current status in selector options

## Related Files

- Backend: `src/backend/src/contracts/custom_contract/updates.rs`
- Redux: `src/frontend/redux/reducers/filesReducer.ts`
- Save logic: `src/frontend/components/Actions/useDocsSave.tsx`

---

**Attribution:** Uses components from [shadcn/ui](https://ui.shadcn.com/) (MIT license)
