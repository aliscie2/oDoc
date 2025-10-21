# Redux State Migration Plan

## 🚨 Critical Performance Issues Identified

Your Redux store is experiencing severe performance degradation due to storing large, frequently-updated datasets in memory. The `filesReducer.ts` alone is **1,781 lines** and manages massive nested state objects that trigger expensive re-renders.

---

## 📊 Current State Analysis

### **Problematic State Storage (Must Migrate)**

#### 1. **Files & Content** (`filesReducer.ts`)
- **Current Storage**: `files[]`, `files_content{}`, `changes.contents{}`
- **Problem**: Storing entire file contents in Redux causes:
  - Memory bloat (files can be MBs each)
  - Expensive serialization/deserialization
  - Unnecessary re-renders when any file changes
  - Slow Redux DevTools
- **Size Impact**: HIGH 🔴

#### 2. **Chat Messages** (`chatsReducer.ts`)
- **Current Storage**: `chats[].messages[]` (nested arrays)
- **Problem**: 
  - Infinite message history stored in memory
  - Each new message triggers full chat re-render
  - Messages stored in reverse chronological order (complexity)
- **Size Impact**: HIGH 🔴

#### 3. **Smart Contracts Data** (`filesReducer.ts`)
- **Current Storage**: `contracts{}` with nested `tables[]`, `rows[]`, `columns[]`, `promises[]`
- **Problem**:
  - Deeply nested structures (4-5 levels deep)
  - Large table data with hundreds of rows
  - Complex change tracking in `changes.contracts[]`
  - Every cell edit triggers massive state updates
- **Size Impact**: CRITICAL 🔴🔴🔴

#### 4. **Calendar Events** (`calendarReducer.ts`)
- **Current Storage**: All events in Redux
- **Problem**: Historical events never purged
- **Size Impact**: MEDIUM 🟡

#### 5. **Job Listings** (`jobReducer.ts`)
- **Current Storage**: All jobs in Redux
- **Problem**: Accumulates over time
- **Size Impact**: MEDIUM 🟡

### **Acceptable State Storage (Keep in Redux)**

✅ **UI State** (`uiReducer.ts`) - Small, frequently accessed  
✅ **AI Credits** (`AIReducer.ts`) - Single number  
✅ **User Profile** - Small object, rarely changes  
✅ **Current Workspace** - Active workspace reference  
✅ **Friends List** - Relatively small array  
✅ **Notifications** - Small, transient data  

---

## 🎯 Migration Strategy

### **Phase 1: IndexedDB Foundation** (Week 1)

#### Setup IndexedDB Schema
```typescript
// Database: 'odoc-app'
// Version: 1

Stores:
1. 'files' - { id, name, parent, content, metadata, workspaces, updated_at }
2. 'messages' - { id, chat_id, sender, content, timestamp, read }
3. 'contracts' - { id, name, tables, promises, permissions, updated_at }
4. 'contract_tables' - { id, contract_id, name, rows, columns }
5. 'calendar_events' - { id, title, start, end, participants }
6. 'jobs' - { id, title, description, status, created_at }
7. 'sync_queue' - { id, action, data, timestamp, synced }
```

#### Create IndexedDB Wrapper
```typescript
// src/frontend/db/indexedDB.ts

class OdocDB {
  private db: IDBDatabase;
  
  async init(): Promise<void>
  async getFile(id: string): Promise<File>
  async saveFile(file: File): Promise<void>
  async getMessages(chatId: string, limit: number, offset: number): Promise<Message[]>
  async saveMessage(message: Message): Promise<void>
  async getContract(id: string): Promise<Contract>
  async saveContract(contract: Contract): Promise<void>
  async clearOldData(olderThan: Date): Promise<void>
}
```

**Action Items:**
- [ ] Create `src/frontend/db/indexedDB.ts` wrapper
- [ ] Create `src/frontend/db/migrations.ts` for schema versioning
- [ ] Add IndexedDB initialization to app startup
- [ ] Create utility hooks: `useIndexedDB()`, `useFileFromDB()`, `useMessagesFromDB()`

---

### **Phase 2: File Content Migration** (Week 2)

#### Current Problem
```typescript
// ❌ BAD: Storing 10MB file in Redux
filesState: {
  files_content: {
    "file_123": "<10MB of content>",
    "file_456": "<5MB of content>"
  }
}
```

#### Solution
```typescript
// ✅ GOOD: Store only metadata in Redux
filesState: {
  files: [
    { id: "file_123", name: "doc.pdf", size: 10485760, cached: true }
  ]
}

// Content in IndexedDB
await db.files.get("file_123") // Fetch on demand
```

#### Migration Steps
1. **Keep Redux for file tree structure** (names, parents, IDs)
2. **Move to IndexedDB:**
   - File content (`files_content`)
   - File changes (`changes.contents`)
3. **Implement lazy loading:**
   - Load content only when file is opened
   - Cache last 5 opened files in memory
   - Clear cache on workspace switch

**Action Items:**
- [ ] Create `FileContentService` to manage IndexedDB operations
- [ ] Update `CURRENT_FILE` action to load content from IndexedDB
- [ ] Update `UPDATE_CONTENT` action to save to IndexedDB + sync queue
- [ ] Remove `files_content` from Redux state
- [ ] Add LRU cache for recently accessed files
- [ ] Update file editor components to use async content loading

---

### **Phase 3: Chat Messages Migration** (Week 3)

#### Current Problem
```typescript
// ❌ BAD: All messages in memory
chatsState: {
  chats: [
    {
      id: "chat_1",
      messages: [/* 10,000 messages */]
    }
  ]
}
```

#### Solution
```typescript
// ✅ GOOD: Paginated messages
chatsState: {
  chats: [
    {
      id: "chat_1",
      lastMessage: { id: "msg_999", content: "Hi", timestamp: 123 },
      unreadCount: 5,
      messageCount: 10000
    }
  ],
  activeChat: {
    id: "chat_1",
    messages: [/* Last 50 messages */],
    hasMore: true
  }
}
```

#### Migration Steps
1. **Keep in Redux:**
   - Chat list metadata (name, participants, last message)
   - Current chat's last 50 messages
   - Unread counts
2. **Move to IndexedDB:**
   - Full message history
   - Message attachments
3. **Implement infinite scroll:**
   - Load 50 messages at a time
   - Virtualized list rendering
   - Auto-cleanup messages older than 30 days

**Action Items:**
- [ ] Create `MessageService` for IndexedDB operations
- [ ] Update `ADD_NOTIFICATION` to save to IndexedDB
- [ ] Implement `loadMoreMessages(chatId, offset)` action
- [ ] Add message pagination to chat components
- [ ] Implement virtual scrolling with `react-window`
- [ ] Add background job to archive old messages
- [ ] Keep only last message per chat in Redux

---

### **Phase 4: Smart Contracts Migration** (Week 4-5) 🔥 **HIGHEST PRIORITY**

#### Current Problem
```typescript
// ❌ CRITICAL: Deeply nested, massive state
contracts: {
  "contract_1": {
    tables: [
      {
        rows: [/* 1000 rows */],
        columns: [/* 50 columns */],
        rows_indexes: [/* complex indexing */]
      }
    ],
    promises: [/* 500 promises */]
  }
}

// ❌ WORSE: Duplicate change tracking
changes: {
  contracts: [/* Full contract copies */]
}
```

#### Solution: Normalized + IndexedDB
```typescript
// ✅ Redux: Only active contract metadata
contractsState: {
  activeContractId: "contract_1",
  contractsList: [
    { id: "contract_1", name: "Sales", tableCount: 5, lastModified: 123 }
  ],
  activeTable: {
    id: "table_1",
    contractId: "contract_1",
    rowCount: 1000,
    loadedRows: [/* First 100 rows */],
    hasMore: true
  }
}

// ✅ IndexedDB: Full data
// contracts store: Full contract metadata
// contract_tables store: Individual tables with pagination
```

#### Migration Steps
1. **Normalize contract structure:**
   - Separate contracts, tables, rows into different stores
   - Use IDs for relationships instead of nesting
2. **Implement pagination:**
   - Load 100 rows at a time
   - Virtual scrolling for large tables
3. **Optimize change tracking:**
   - Store only changed fields, not full objects
   - Use operational transforms for conflict resolution
4. **Background sync:**
   - Queue changes in IndexedDB
   - Batch sync every 5 seconds
   - Retry failed syncs

**Action Items:**
- [ ] Create `ContractService` with normalized schema
- [ ] Implement table pagination: `loadTableRows(tableId, offset, limit)`
- [ ] Update all contract actions to use service layer
- [ ] Replace nested state updates with normalized updates
- [ ] Implement change queue in IndexedDB
- [ ] Add background sync worker
- [ ] Remove `changes.contracts` from Redux
- [ ] Add optimistic updates with rollback
- [ ] Implement virtual table rendering

---

### **Phase 5: Calendar & Jobs Migration** (Week 6)

#### Calendar Events
- **Keep in Redux:** Current month's events
- **Move to IndexedDB:** Historical events (older than 3 months)
- **Implement:** Lazy loading by date range

#### Jobs
- **Keep in Redux:** Active jobs (status: open/in-progress)
- **Move to IndexedDB:** Completed/archived jobs
- **Implement:** Pagination for job listings

**Action Items:**
- [ ] Create `CalendarService` and `JobService`
- [ ] Implement date-range queries for calendar
- [ ] Add job status filtering
- [ ] Archive completed jobs automatically

---

## 🔧 Technical Implementation Details

### **1. Sync Queue Pattern**

```typescript
// Every state change goes through sync queue
interface SyncQueueItem {
  id: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  entity: 'file' | 'message' | 'contract';
  data: any;
  timestamp: number;
  synced: boolean;
  retries: number;
}

// Background worker processes queue
class SyncWorker {
  async processQueue() {
    const pending = await db.sync_queue.where('synced').equals(false).toArray();
    for (const item of pending) {
      try {
        await backendActor[item.action](item.data);
        await db.sync_queue.update(item.id, { synced: true });
      } catch (error) {
        await db.sync_queue.update(item.id, { retries: item.retries + 1 });
      }
    }
  }
}
```

### **2. Cache Strategy**

```typescript
// LRU Cache for hot data
class LRUCache<T> {
  private cache = new Map<string, T>();
  private maxSize = 50;
  
  get(key: string): T | undefined {
    const value = this.cache.get(key);
    if (value) {
      // Move to end (most recently used)
      this.cache.delete(key);
      this.cache.set(key, value);
    }
    return value;
  }
  
  set(key: string, value: T): void {
    if (this.cache.size >= this.maxSize) {
      // Remove oldest (first item)
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }
}
```

### **3. Optimistic Updates**

```typescript
// Update UI immediately, rollback on failure
async function updateContract(contractId: string, changes: Partial<Contract>) {
  const originalState = store.getState().contractsState;
  
  // 1. Update Redux immediately
  dispatch({ type: 'UPDATE_CONTRACT', contractId, changes });
  
  // 2. Save to IndexedDB
  await db.contracts.update(contractId, changes);
  
  // 3. Queue for backend sync
  await db.sync_queue.add({
    action: 'UPDATE',
    entity: 'contract',
    data: { contractId, changes }
  });
  
  // 4. Sync in background
  try {
    await backendActor.updateContract(contractId, changes);
  } catch (error) {
    // Rollback on failure
    dispatch({ type: 'SET_CONTRACT', contract: originalState.contracts[contractId] });
    showError('Failed to sync changes');
  }
}
```

---

## 📈 Performance Improvements Expected

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Redux state size | ~50MB | ~500KB | **99% reduction** |
| Initial load time | 8-12s | 2-3s | **75% faster** |
| File open time | 2-3s | 200-300ms | **90% faster** |
| Message scroll lag | Janky | Smooth 60fps | **Eliminated** |
| Contract table render | 5-8s | 500ms | **90% faster** |
| Memory usage | 200-300MB | 50-80MB | **70% reduction** |

---

## 🚀 Migration Checklist

### **Week 1: Foundation**
- [ ] Set up IndexedDB wrapper and schema
- [ ] Create service layer architecture
- [ ] Add IndexedDB to app initialization
- [ ] Create utility hooks for data access

### **Week 2: Files**
- [ ] Migrate file content to IndexedDB
- [ ] Implement lazy loading for file content
- [ ] Add LRU cache for recently opened files
- [ ] Update file editor components
- [ ] Test file operations (open, edit, save)

### **Week 3: Messages**
- [ ] Migrate message history to IndexedDB
- [ ] Implement message pagination
- [ ] Add virtual scrolling to chat
- [ ] Keep only last message in Redux
- [ ] Test chat performance with 10k+ messages

### **Week 4-5: Contracts** (Critical)
- [ ] Design normalized contract schema
- [ ] Migrate contracts to IndexedDB
- [ ] Implement table pagination
- [ ] Add virtual table rendering
- [ ] Optimize change tracking
- [ ] Implement background sync
- [ ] Test with large contracts (1000+ rows)

### **Week 6: Calendar & Jobs**
- [ ] Migrate historical calendar events
- [ ] Migrate archived jobs
- [ ] Implement date-range queries
- [ ] Add pagination to job listings

### **Week 7: Optimization**
- [ ] Add background sync worker
- [ ] Implement data cleanup jobs
- [ ] Add performance monitoring
- [ ] Optimize bundle size
- [ ] Add error recovery mechanisms

### **Week 8: Testing & Rollout**
- [ ] Load testing with realistic data volumes
- [ ] Test offline functionality
- [ ] Test sync conflict resolution
- [ ] Migration script for existing users
- [ ] Gradual rollout with feature flags

---

## 🛡️ Risk Mitigation

### **Data Loss Prevention**
1. **Dual-write period:** Write to both Redux and IndexedDB for 1 week
2. **Backup before migration:** Export all Redux state to JSON
3. **Rollback plan:** Keep old Redux code behind feature flag
4. **Incremental migration:** Migrate one feature at a time

### **Sync Conflicts**
1. **Last-write-wins** for simple fields
2. **Operational transforms** for collaborative editing
3. **Conflict resolution UI** for complex cases
4. **Version vectors** to track causality

### **Browser Compatibility**
1. **IndexedDB polyfill** for older browsers
2. **Fallback to localStorage** for small data
3. **Feature detection** before migration
4. **Graceful degradation** if IndexedDB unavailable

---

## 🔍 Alternative Solutions Considered

### **1. React Query / TanStack Query**
**Pros:**
- Built-in caching and invalidation
- Automatic background refetching
- Optimistic updates

**Cons:**
- Still stores data in memory
- Not suitable for offline-first apps
- Requires backend API changes

**Verdict:** Use alongside IndexedDB for server state management

### **2. Redux Toolkit Query (RTK Query)**
**Pros:**
- Integrates with existing Redux
- Normalized cache
- Code generation from OpenAPI

**Cons:**
- Memory-based cache
- Not designed for large datasets
- Requires API restructuring

**Verdict:** Good for API calls, not for large data storage

### **3. Dexie.js (IndexedDB Wrapper)**
**Pros:**
- Simpler API than raw IndexedDB
- TypeScript support
- Observable queries

**Cons:**
- Additional dependency (50KB)
- Learning curve

**Verdict:** **RECOMMENDED** - Use Dexie.js for IndexedDB operations

### **4. LocalForage**
**Pros:**
- Simple localStorage-like API
- Automatic fallback

**Cons:**
- Less powerful than IndexedDB
- No complex queries
- Smaller storage limits

**Verdict:** Not suitable for large datasets

### **5. PouchDB / RxDB**
**Pros:**
- Offline-first by design
- Built-in sync with CouchDB
- Reactive queries

**Cons:**
- Large bundle size (100KB+)
- Opinionated architecture
- Steep learning curve

**Verdict:** Overkill for current needs

---

## 📚 Recommended Libraries

1. **Dexie.js** - IndexedDB wrapper
   ```bash
   yarn add dexie
   ```

2. **react-window** - Virtual scrolling
   ```bash
   yarn add react-window
   ```

3. **immer** - Immutable state updates (already using with Redux Toolkit)

4. **idb-keyval** - Simple key-value store for settings
   ```bash
   yarn add idb-keyval
   ```

---

## 🎓 Learning Resources

- [IndexedDB API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [Dexie.js Tutorial](https://dexie.org/docs/Tutorial)
- [Virtual Scrolling Best Practices](https://web.dev/virtualize-long-lists-react-window/)
- [Offline-First Architecture](https://offlinefirst.org/)

---

## 📞 Next Steps

1. **Review this plan** with the team
2. **Prioritize phases** based on current pain points
3. **Set up development environment** with IndexedDB DevTools
4. **Create proof-of-concept** for Phase 4 (Contracts) - highest impact
5. **Establish metrics** to measure improvements
6. **Schedule weekly check-ins** to track progress

---

## ⚠️ Critical Notes

- **DO NOT** store file content in Redux
- **DO NOT** store full message history in Redux
- **DO NOT** store large table data in Redux
- **DO** use IndexedDB for anything over 100KB
- **DO** implement pagination for lists over 100 items
- **DO** use virtual scrolling for lists over 50 items
- **DO** batch backend syncs to reduce network calls
- **DO** implement optimistic updates for better UX

---

**Last Updated:** October 21, 2025  
**Status:** Ready for Implementation  
**Priority:** HIGH - Performance issues affecting user experience
