# Job Matching System Guide

## Overview
Users interact with a chatbot that generates a JSON profile, which is then used to find and match candidates. The system calculates match scores, generates cover letters, and presents results to users while saving everything to the backend.

## Core Workflow

1. **Profile Generation**
   - User chats with bot → Bot generates JSON profile
   - Profile is validated and saved
   - System waits 5 seconds after profile update before triggering match generation

2. **Candidate Fetching**
   - Backend receives profile data and returns list of potential candidates
   - List is filtered based on skills, category, and other criteria

3. **AI Matching**
   - Candidate list + current profile → AI processing
   - AI generates: match scores (0-10 scale) + cover letters
   - Results are normalized to 0.0-1.0 range for storage

4. **Match Persistence**
   - **CRITICAL**: Always send complete match list to backend (not incremental)
   - Example: 3 new matches + 2 old matches = send all 5 matches together
   - This replaces the entire matches array in backend

## Critical Issues Checklist

### High Priority

- [ ] **Infinite Loop on Page Load**
  - Problem: Page shows "Finding your perfect matches..." and re-fetches candidates on every reload
  - Expected: Should only fetch when profile changes or new candidates appear
  - Root cause: Not properly tracking which matches have been calculated
  - Backend doesn't know matches are already stored
  
- [ ] **Category Switch Handling**
  - Problem: When switching Job ↔ Talent, old matches persist
  - Expected: Immediate recalculation + complete removal of old matches
  - Should work without page reload
  - Must clear `matchingJobs` array completely

- [ ] **Score Filtering Not Working**
  - Problem: Jobs with 40% match score appear despite `required_match_score` threshold
  - Backend should filter based on `job.required_match_score`
  - Frontend receives matches that don't meet minimum threshold

- [ ] **Invalid Backend Data Handling**
  - Problem: When backend returns corrupted/invalid data structure
  - Need data structure validation before state updates
  - On validation failure: show error + allow retry
  - Should NOT save corrupted data to backend

### Medium Priority

- [ ] **AI Response Validation**
  - Check returned JSON structure before processing
  - Validate: `candidate_id` exists, `score` is 0-10, `missmatching_skills` is array
  - Handle cases where AI returns malformed data

- [ ] **Undo Functionality**
  - Current undo doesn't revert corrupted structure changes
  - Need proper state rollback mechanism

### Future Optimization (Add Later)

- [ ] **Smart Update Detection**
  - Check significance of profile changes before recalculating matches
  - Minor changes (typo fixes) shouldn't trigger full recalculation
  - Define "significant change" criteria (e.g., skills changed, category changed)

## Known Behavioral Issues

### Match Calculation Triggers
**Current behavior**: Recalculates on every render/reload
**Expected behavior**: Should only recalculate when:
- Profile fields actually change (skills, category, description, etc.)
- Category switches between Job/Talent
- User manually clicks "Refresh Matches"

### Hash Tracking Problem
```typescript
// Current issue: Hash comparison not preventing re-renders
const getJobHash = (job: Job): string => {
  const relevantProps = {
    skills: job.skills?.sort().join(','),
    category: Object.keys(job.category || {})[0],
    title: job.title,
    description: job.description,
    required_match_score: job.required_match_score,
  };
  return JSON.stringify(relevantProps);
};
```
This should prevent unnecessary recalculations but currently fails to do so.

## Data Flow Issues

### Score Normalization
- AI returns: 0-10 scale
- Storage format: 0.0-1.0 (normalized)
- Display format: 0-100%

**Watch out for**: Double normalization bugs

### Backend Match Storage
```rust
// Backend expects complete match replacement
job.matches = validated_matches; // Replaces entire array

// Creates reciprocal matches automatically
// Other job also gets updated with reverse match
```

## Questions Needing Clarification

1. **When should matches be considered "stale"?**
   - Is `date_updated` comparison sufficient?
   - Should we use a time threshold?

2. **What defines a "new" candidate?**
   - Someone who just created a profile?
   - Someone whose profile changed significantly?

3. **Hash comparison failing - why?**
   - Are field values changing unexpectedly?
   - Is the useEffect dependency array correct?

## Testing Checklist

- [ ] Profile update → wait 5 seconds → matches recalculate
- [ ] Switch Job to Talent → old matches cleared immediately
- [ ] Page reload → no recalculation if nothing changed
- [ ] Manual refresh button → forces recalculation
- [ ] Matches below threshold → not displayed
- [ ] Corrupted AI response → error shown, no save to backend
- [ ] sometimes I face this issue which is part of the validation that we should add to the AI response, Failed to load matches
A state mutation was detected between dispatches, in the path 'jobState.jobChanges.0.updates.4.values.0'. This may cause incorrect behavior. (https://redux.js.org/style-guide/style-guide#do-not-mutate-state)
- [ ] we must add our comprehensive council locks and remove the old ones to have a very clear understanding of what is going on using the council logs
- [ ] I already made some changes so some of the issues are mentioned here in this file could be solved by now double check do not want something that is already fixed
## Additional Context Needed

To better diagnose the infinite loop and filtering issues, please provide:

1. **Redux State Management**: src/frontend/redux/reducers/jobReducer.ts
2. **Effect Dependencies**: Complete `useEffect` dependency arrays in `useJobMatching` hook
3. **Backend Response Format**: Exact structure returned by `get_matches` and `update_job` src/declarations/backend/backend.did.d.ts 
    3.1 const category : string = Object.keys(job.category)[0]
    
4. **When does `date_updated` get set?**: On every field change or only significant ones?

note: The item that is lower than the current required matching square we just filter it in the UI we don't filter it from redux

We should send to the back and all our data the all the matches even if they are lower than the current required score right ?

all matches will be store in currentJob.match even low matches

if a mtches low we filter it in ui ad the backend does not return it's full info

if we don't store all matches the backend keep sending it and it think we did not get it
