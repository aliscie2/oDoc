# Custom Contract View

React-based UI for managing promises/payments between users with complex status workflows, role-based permissions, and real-time backend synchronization.

## 📖 Documentation

**Read [GUIDE.md](./GUIDE.md)** for complete details including:
- Status system and transitions
- Validation rules and permissions
- Backend integration patterns
- Performance optimizations
- Troubleshooting guide
- Testing checklist

## Quick Overview

### Two Views
- **Promises**: Active/unreleased promises
- **Payments**: Completed/released payments

### Two Update Patterns
- **Sender Actions**: Edit via Redux → batch save
- **Receiver Actions**: Direct backend calls → immediate persistence

### Status Flow
```
Draft → Confirmed → Released ✓
  ↓         ↓
Escrow → Approved → Released ✓
  ↓         ↓
Object  Cancel → Cancelled ✓
```

## Key Files

| File | Purpose |
|------|---------|
| `ContractPage.tsx` | Merges `promises[]` + `payments[]` arrays |
| `AgreementView.tsx` | Filters by status for view mode |
| `PromiseCard.tsx` | Individual promise display & actions |
| `validation.ts` | Status mapping & permission logic |

## Common Patterns

**Merging Backend Arrays:**
```typescript
// ContractPage.tsx
const mergedPromises = [
  ...contract.promises,  // Unreleased
  ...contract.payments,  // Released
].filter(deduplicate);
```

**Filtering by View:**
```typescript
// AgreementView.tsx
const filtered = viewMode === "payments"
  ? promises.filter(p => status === "Released")
  : promises.filter(p => status !== "Released");
```

**Receiver Actions:**
```typescript
// Call backend directly, then refetch
await backendActor.confirmed_c_payment(promise);
dispatch({ type: "SET_CONTRACT", contract });
```

## Related Files

- Backend: `src/backend/src/contracts/custom_contract/`
- Redux: `src/frontend/redux/reducers/filesReducer.ts`
- Save: `src/frontend/components/Actions/useDocsSave.tsx`

---

**Attribution:** Uses components from [shadcn/ui](https://ui.shadcn.com/) (MIT license)
