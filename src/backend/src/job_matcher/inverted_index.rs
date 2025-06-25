use std::cell::RefCell;
use std::collections::HashMap;
use ic_stable_structures::memory_manager::{MemoryId, MemoryManager, VirtualMemory};
use ic_stable_structures::{DefaultMemoryImpl, StableBTreeMap};
use candid::{Decode, Encode};
use ic_stable_structures::{storable::Bound, Storable};

type Memory = VirtualMemory<DefaultMemoryImpl>;

// Custom wrapper for Vec<String> that implements Storable
#[derive(Clone, Debug)]
pub struct StorableStringVec(pub Vec<String>);

impl Storable for StorableStringVec {
    fn to_bytes(&self) -> std::borrow::Cow<[u8]> {
        std::borrow::Cow::Owned(Encode!(&self.0).unwrap())
    }

    fn from_bytes(bytes: std::borrow::Cow<[u8]>) -> Self {
        Self(Decode!(&bytes, Vec<String>).unwrap())
    }

    const BOUND: Bound = Bound::Unbounded;
}

impl From<Vec<String>> for StorableStringVec {
    fn from(vec: Vec<String>) -> Self {
        Self(vec)
    }
}

impl From<StorableStringVec> for Vec<String> {
    fn from(wrapper: StorableStringVec) -> Self {
        wrapper.0
    }
}

impl std::ops::Deref for StorableStringVec {
    type Target = Vec<String>;
    
    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

impl std::ops::DerefMut for StorableStringVec {
    fn deref_mut(&mut self) -> &mut Self::Target {
        &mut self.0
    }
}

// Job functions
pub fn add_new_job(keys: Vec<String>, job_id: String) {
    crate::JOBS_INVERTED_IDEX_STORE.with(|store| {
        let mut store_ref = store.borrow_mut();
        
        for key in keys {
            match store_ref.get(&key) {
                Some(stored_vec) => {
                    let mut ids: Vec<String> = stored_vec.into();
                    // Add new ID to the beginning of the vector (latest first)
                    ids.insert(0, job_id.clone());
                    store_ref.insert(key, StorableStringVec::from(ids));
                }
                None => {
                    // Create new entry with single ID
                    store_ref.insert(key, StorableStringVec::from(vec![job_id.clone()]));
                }
            }
        }
    });
}

pub fn delete_job_search(keys: Vec<String>, job_id: String) {
    crate::JOBS_INVERTED_IDEX_STORE.with(|store| {
        let mut store_ref = store.borrow_mut();
        
        for key in keys {
            if let Some(stored_vec) = store_ref.get(&key) {
                let mut ids: Vec<String> = stored_vec.into();
                // Remove all occurrences of the ID
                ids.retain(|existing_id| existing_id != &job_id);
                
                if ids.is_empty() {
                    // Remove the key if no IDs left
                    store_ref.remove(&key);
                } else {
                    // Update with remaining IDs
                    store_ref.insert(key, StorableStringVec::from(ids));
                }
            }
        }
    });
}

pub fn search_for_job(keys: Vec<String>) -> Vec<String> {
    crate::JOBS_INVERTED_IDEX_STORE.with(|store| {
        let store_ref = store.borrow();
        let mut id_scores: HashMap<String, (usize, usize)> = HashMap::new(); // (key_matches, earliest_position)
        
        for key in keys {
            if let Some(stored_vec) = store_ref.get(&key) {
                let ids: Vec<String> = stored_vec.into();
                for (position, id) in ids.iter().enumerate() {
                    let entry = id_scores.entry(id.clone()).or_insert((0, position));
                    entry.0 += 1; // Increment key matches
                    entry.1 = entry.1.min(position); // Keep earliest position across all keys
                }
            }
        }
        
        // Convert to vector and sort
        let mut results: Vec<(String, usize, usize)> = id_scores
            .into_iter()
            .map(|(id, (key_matches, earliest_pos))| (id, key_matches, earliest_pos))
            .collect();
        
        // Sort by key matches (descending), then by position (ascending for latest first)
        results.sort_by(|a, b| {
            b.1.cmp(&a.1) // More key matches first
                .then_with(|| a.2.cmp(&b.2)) // Earlier position (latest added) first
        });
        
        // Return top 10 IDs
        results.into_iter()
            .take(10)
            .map(|(id, _, _)| id)
            .collect()
    })
}

// Talent functions
pub fn add_new_talent(keys: Vec<String>, talent_id: String) {
    crate::TALENTS_INVERTED_IDEX_STORE.with(|store| {
        let mut store_ref = store.borrow_mut();
        
        for key in keys {
            match store_ref.get(&key) {
                Some(stored_vec) => {
                    let mut ids: Vec<String> = stored_vec.into();
                    // Add new ID to the beginning of the vector (latest first)
                    ids.insert(0, talent_id.clone());
                    store_ref.insert(key, StorableStringVec::from(ids));
                }
                None => {
                    // Create new entry with single ID
                    store_ref.insert(key, StorableStringVec::from(vec![talent_id.clone()]));
                }
            }
        }
    });
}

pub fn delete_talent_search(keys: Vec<String>, talent_id: String) {
    crate::TALENTS_INVERTED_IDEX_STORE.with(|store| {
        let mut store_ref = store.borrow_mut();
        
        for key in keys {
            if let Some(stored_vec) = store_ref.get(&key) {
                let mut ids: Vec<String> = stored_vec.into();
                // Remove all occurrences of the ID
                ids.retain(|existing_id| existing_id != &talent_id);
                
                if ids.is_empty() {
                    // Remove the key if no IDs left
                    store_ref.remove(&key);
                } else {
                    // Update with remaining IDs
                    store_ref.insert(key, StorableStringVec::from(ids));
                }
            }
        }
    });
}

pub fn search_for_talent(keys: Vec<String>) -> Vec<String> {
    crate::TALENTS_INVERTED_IDEX_STORE.with(|store| {
        let store_ref = store.borrow();
        let mut id_scores: HashMap<String, (usize, usize)> = HashMap::new(); // (key_matches, earliest_position)
        
        for key in keys {
            if let Some(stored_vec) = store_ref.get(&key) {
                let ids: Vec<String> = stored_vec.into();
                for (position, id) in ids.iter().enumerate() {
                    let entry = id_scores.entry(id.clone()).or_insert((0, position));
                    entry.0 += 1; // Increment key matches
                    entry.1 = entry.1.min(position); // Keep earliest position across all keys
                }
            }
        }
        
        // Convert to vector and sort
        let mut results: Vec<(String, usize, usize)> = id_scores
            .into_iter()
            .map(|(id, (key_matches, earliest_pos))| (id, key_matches, earliest_pos))
            .collect();
        
        // Sort by key matches (descending), then by position (ascending for latest first)
        results.sort_by(|a, b| {
            b.1.cmp(&a.1) // More key matches first
                .then_with(|| a.2.cmp(&b.2)) // Earlier position (latest added) first
        });
        
        // Return top 10 IDs
        results.into_iter()
            .take(10)
            .map(|(id, _, _)| id)
            .collect()
    })
}