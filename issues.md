# Issues Checklist

## Critical Issues

- [ ] **Backend Index Out of Bounds Error** - `src/backend/src/job_matcher/impliment.rs:46:53`

  - Error: `Panicked at 'index out of bounds: the len is 0 but the index is 0'`
  - Canister: `u6s2n-gx777-77774-qaaba-cai`, Method: `update_job`
  - Impact: Prevents job updates from being saved
  - Files: `src/backend/src/job_matcher/impliment.rs`, `src/frontend/pages/jobs/JobDetails.tsx`

- [ ] **Promise Index Out of Bounds Error** - `src/backend/src/contracts/custom_contract/types.rs`

  - Backend error when accessing promises array with invalid index
  - Impact: Contract operations fail

- [ ] **Cover Letter Update Permission Denied** - `src/frontend/pages/jobs/JobDetails.tsx`

  - Update cover letter operation returns permission denied error

- [ ] **Variant Has No Data Error** - `useJobSave.tsx:43`

  - Error: `Variant has no data: [object Object]` at `_VariantClass.encodeValue`
  - Sometimes occurs when saving jobs, possibly due to bad AI response or malformed data
  - Files: `src/frontend/pages/jobs/useJobSave.tsx`, `src/frontend/components/Actions/MultiSave.tsx`

- [ ] **Invalid Vec Record Error (AI Chat)**
  - When AI converts profile from Job to Talent category
  - Error: `Invalid text argument: 0.3` in vec record
  - Impact: AI chat conversions fail when changing job categories

## High Priority Issues

- [ ] **Page Reload Required to Find Matches** - `src/frontend/pages/jobs/JobSearchComponent.tsx`

  - Sometimes need to reload the page to find job matches

- [ ] **Contract State Not Updating Without Reload** - `src/frontend/pages/jobs/JobSearchComponent.tsx`

  - Notification should update contract state (promise status, promise amount) without page reload

- [ ] **Contracts Not Deletable**

  - Delete operation appears to work but after page reload, deleted contracts reappear
  - Impact: Cannot permanently remove contracts

- [ ] **Create Promise Error on /contract Page**

  - Creating a promise from /contract page causes error
  - Solution: If no contracts exist, create new contract with new promise; if contracts exist, ask user to choose or create new
  - Filter out promises where receiver != caller() or receiver is not set

- [ ] **Deleted Job Not Saving New Job** (possibly solved, needs confirmation)
  - When deleting current job and creating new job, it doesn't save to backend
  - Frontend doesn't re-render with the fact that there's no job profile
  - Impact: Cannot create new job after deleting current one

## Medium Priority Issues

- [ ] **Notifications Missing Load More Logic**

  - Files: `src/frontend/components/NotifcationList/index.tsx`, `src/frontend/pages/NotificationsPage.tsx`, `src/backend/src/websocket`
  - Backend has `get_user_notifications` but no `load_more_notifications`
  - No pagination implemented

- [ ] **Profile Description "Read More" Not Appearing**
  - "Read more..." button doesn't appear on large markdown content in profile descriptions
