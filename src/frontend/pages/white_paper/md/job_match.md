# Job Match

## Overview

The job matching system enables job creators and talent users to find relevant matches based on shared skills. The system handles match detection, saving, validation, and update notifications while preventing infinite loops through careful separation of concerns.

## Architecture

### Frontend Responsibilities

- **Match Processing**: Calls `get_matches` to retrieve potential matches
- **AI Score Calculation**: Processes matches using AI to calculate matching scores (0.0-1.0)
- **Match Saving**: Calls `update_job` with calculated scores to save processed matches

### Backend Responsibilities

- **Match Detection**: Finds potential matches based on skill overlap (minimum 60%)
- **Score Validation**: Validates that all scores are between 0.0 and 1.0
- **State Management**: Tracks saved matches and their timestamps
- **Update Detection**: Identifies when profiles have been updated since last match
- **Loop Prevention**: Separates profile updates from match operations

## Core Workflow

### 1. Initial Match Discovery

```
User A creates job/talent → User B creates talent/job → User A calls get_matches
```

**Process:**

1. User A calls `get_matches(job_id, skills, category)`
2. Backend searches for profiles with matching skills
3. Backend filters results:
   - Minimum 30% skill overlap
   - Active profiles only
   - Exclude user's own profiles
   - Updated within last 50 days
   - Maximum 10 results
4. Backend returns list of potential matches

### 2. Match Processing and Saving

```
Frontend processes matches → AI calculates scores → Save matches via update_job
```

**Process:**

1. Frontend receives potential matches from `get_matches`
2. **Frontend processes matches with AI to calculate matching scores (0.0-1.0)**
3. Frontend calls `update_job` with matches containing calculated scores
4. Backend validates scores are in 0.0-1.0 range
5. Backend saves matches WITHOUT updating job's `date_updated`
6. Subsequent `get_matches` calls return empty list (matches already processed)

### 3. Update Detection and Re-matching

```
User updates profile → Other users see updated profile in get_matches again
```

**Process:**

1. User B updates their profile (skills, description, etc.)
2. Backend updates User B's `date_updated` timestamp
3. User A calls `get_matches` again
4. Backend compares `job.date_updated > saved_match.date_updated`
5. If User B's profile was updated after being saved, it appears in results again
6. User A can process and save the updated match

## Critical Design Principles

### Score Calculation

**⚠️ IMPORTANT: Matching scores are calculated in the frontend, NOT the backend!**

- Backend only validates and stores scores provided by frontend
- Frontend uses AI/algorithms to calculate match quality scores
- Backend validates scores are between 0.0 and 1.0
- Backend does NOT perform any score calculation or normalization

### Infinite Loop Prevention

The system prevents infinite loops through careful separation of operations:

**Profile Updates (trigger date_updated):**

- Updating skills, description, experience, etc.
- Setting active/inactive status
- Changing required_match_score

**Match Operations (do NOT trigger date_updated):**

- Saving processed matches via `update_job`
- Only the match data is updated, not the profile timestamp

This ensures that saving matches doesn't cause the job to appear as "updated" to itself.

## API Functions

### get_matches(job_id, skills, category)

**Purpose**: Get potential matches for a job/talent profile

**Returns**: List of matching profiles that:

- Share at least 30% skill overlap
- Are active and not owned by caller
- Haven't been saved as matches (or have been updated since saving)
- Were updated within last 50 days

### update_job(updates, ai_credits)

**Purpose**: Update job profile and/or save processed matches

**Profile Updates** (updates date_updated):

- Field changes (skills, description, etc.)
- Active status changes
- Required match score changes

**Match Operations** (do NOT update date_updated):

- Saving processed matches with AI-calculated scores

**⚠️ CRITICAL: Complete Match Set Required**

- Backend replaces all existing matches with provided matches
- Always include both old matches AND new matches in updates
- Example: 10 saved + 10 new = send all 20 matches
- Sending only new matches will overwrite previous ones

### get_my_jobs()

**Purpose**: Get user's jobs with filtered matches

**Returns**:

- User's job profiles
- Matching jobs that meet the required_match_score threshold

## Validation Rules

### Required Match Score

- Must be between 0.0 and 1.0 (inclusive)
- Default value: 0.0 (include all matches)
- Error: "Required match score must be between 0.0 and 1.0"

### Match Scores

- Must be between 0.0 and 1.0 (inclusive)
- Calculated by frontend AI processing
- Error: "Match score must be between 0.0 and 1.0"

### Permissions

- Users can only update their own profiles
- Anonymous users are blocked from operations
- Error: "Permission denied (not owner)" or "Permission denied (anonymous)"

## Example Flow

### Complete Matching Cycle

1. **Setup**:

   ```
   Job Creator creates job with skills: ["react", "typescript"]
   Talent User creates talent with skills: ["react", "javascript"]
   ```

2. **Initial Match Discovery**:

   ```
   Job Creator calls get_matches() → Returns Talent User's profile
   ```

3. **Match Processing**:

   ```
   Frontend processes match with AI → Calculates score: 0.75
   Job Creator calls update_job() with matches: [{score: 0.75, ...}]
   ⚠️ IMPORTANT: Send complete match set, not just new matches
   ```

4. **State After Saving**:

   ```
   Job Creator calls get_matches() → Returns empty list (already processed)
   ```

5. **Profile Update**:

   ```
   Talent User updates skills to: ["react", "javascript", "node"]
   Backend updates Talent User's date_updated timestamp
   ```

6. **Re-matching**:
   ```
   Job Creator calls get_matches() → Returns updated Talent User profile
   Frontend processes again → New score: 0.85
   Job Creator saves ALL matches (old + new) → get_matches() returns empty again
   ```

## Troubleshooting

### Common Issues

1. **Infinite Loops**:

   - Ensure match saving doesn't update profile timestamps
   - Separate profile updates from match operations

2. **Missing Matches**:

   - Check skill overlap is at least 30%
   - Verify profiles are active
   - Ensure profiles were updated within 50 days

3. **Score Validation Errors**:

   - Verify frontend calculates scores in 0.0-1.0 range
   - Check required_match_score is valid

4. **Matches Not Filtering**:
   - Verify required_match_score is set correctly
   - Check that match scores meet the threshold

### Debug Information

The system logs detailed information for debugging:

- Match score comparisons
- Update detection decisions
- Score validation results
- Profile timestamp comparisons

## Testing Strategy

### Comprehensive Integration Test

The system includes a single comprehensive test that covers the complete workflow:

1. **Setup Phase**: Create 20 users with identical skill sets (ICP, Rust, TypeScript)
2. **Job Creation**: Create one job requiring ICP and Rust skills
3. **First Batch**: Get 10 matches, process with AI scores, save to backend
4. **Second Batch**: Get next 10 matches, combine with previous matches, save all
5. **Verification**: Confirm no more matches available
6. **Update Detection**: Update one talent profile, verify it appears in new matches

This approach tests:

- Parallel user creation and registration
- Match discovery and pagination (10 results per batch)
- Complete match set handling
- Update detection and re-matching workflow
- AI score integration and validation

## Performance Considerations

- Results limited to 10 matches maximum
- Profiles older than 50 days excluded
- Efficient skill overlap calculation
- Early filtering to reduce processing

### Scalability for Thousands of Users

The system uses an **inverted index** implementation (`src/backend/src/job_matcher/inverted_index.rs`) to efficiently scale job matching for thousands of users:

**Inverted Index Architecture:**
- **Skill-based indexing**: Each skill maps to a list of job/talent IDs that contain that skill
- **Dual indexes**: Separate inverted indexes for jobs (`JOBS_INVERTED_IDEX_STORE`) and talents (`TALENTS_INVERTED_IDEX_STORE`)
- **Latest-first ordering**: New profiles are inserted at the beginning of skill lists for recency-based matching
- **Efficient lookups**: O(1) skill lookup instead of O(n) linear search through all profiles

**Key Performance Benefits:**
- **Fast matching**: Instead of scanning all profiles, only retrieve IDs from relevant skill indexes
- **Relevance scoring**: Profiles with more matching skills are ranked higher automatically
- **Pagination support**: Returns top 50 results to enable efficient pagination
- **Memory efficient**: Uses IC stable structures for persistent storage across canister upgrades

**Index Operations:**
- `add_new_job/talent()`: Adds profile ID to all relevant skill indexes
- `delete_job/talent_search()`: Removes profile ID from skill indexes when deleted
- `search_for_job/talent()`: Efficiently finds matching profiles by skill intersection

This architecture enables the system to handle thousands of concurrent users while maintaining sub-second response times for match discovery.

## Security

- Proper permission checking
- Input validation for all scores
- User isolation (can't see others' private data)
- Anonymous user blocking
