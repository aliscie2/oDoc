use std::borrow::Cow;
use std::collections::HashMap;

use crate::{CustomContract, CONTRACTS_STORE};
use candid::{CandidType, Decode, Deserialize, Encode, Principal};
use ic_cdk::caller;
use ic_stable_structures::{storable::Bound, DefaultMemoryImpl, StableBTreeMap, Storable};
use serde::Serialize;

use crate::storage_schema::ContractId;
use crate::tables::Table;

#[derive(Eq, PartialOrd, PartialEq, Clone, Debug, CandidType, Serialize, Deserialize)]
pub enum Contract {
    SharesContract(ContractId),
    // CustomContract(Table),
}

#[derive(PartialOrd, PartialEq, Clone, Debug, CandidType, Serialize, Deserialize)]
pub enum StoredContract {
    // SharesContract(SharesContract),
    CustomContract(CustomContract),
}

#[derive(PartialOrd, PartialEq, Clone, Debug, CandidType, Serialize, Deserialize)]
pub struct StoredContractVec {
    pub stored_contracts: Vec<StoredContract>,
}

impl Storable for StoredContractVec {
    fn to_bytes(&self) -> Cow<[u8]> {
        if let Ok(bytes) = Encode!(self) {
            return Cow::Owned(bytes);
        }
        Cow::Borrowed(&[])
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        if let Ok(x) = Decode!(bytes.as_ref(), Self) {
            return x;
        }
        return StoredContractVec {
            stored_contracts: vec![],
        };
    }

    const BOUND: Bound = Bound::Bounded {
        max_size: 999999,
        is_fixed_size: false,
    };
}

impl StoredContract {
    pub fn get_contract_by_id(&self, id: String) -> Option<StoredContract> {
        match self {
            StoredContract::CustomContract(custom_contract) => {
                if custom_contract.id == id {
                    Some(StoredContract::CustomContract(custom_contract.clone()))
                } else {
                    None
                }
            }
        }
    }

    pub fn get_contracts_by_owner(owner: Principal) -> Vec<StoredContract> {
        let mut result = vec![];
        CONTRACTS_STORE.with(|contracts_store| {
            let caller_contracts = contracts_store.borrow();
            for contracts in caller_contracts.values() {
                for contract in &contracts.stored_contracts {
                    if let StoredContract::CustomContract(custom_contract) = contract {
                        if custom_contract.creator == owner.to_string() {
                            result.push(StoredContract::CustomContract(custom_contract.clone()));
                        }
                    }
                }
            }
        });
        result
    }

    pub fn get_contracts_by_participant(_participant: Principal) -> Vec<StoredContract> {
        // Implement logic if you have a way to define participants
        vec![]
    }
}

impl Contract {
    pub fn get_contract(author: String, contract_id: String) -> Option<StoredContract> {
        CONTRACTS_STORE.with(|contracts_store| {
            let caller_contracts = contracts_store.borrow();
            if let Some(contracts) = caller_contracts.get(&author) {
                for contract in &contracts.stored_contracts {
                    if let StoredContract::CustomContract(custom_contract) = contract {
                        if custom_contract.id == contract_id {
                            return Some(StoredContract::CustomContract(custom_contract.clone()));
                        }
                    }
                }
            }
            None
        })
    }

    pub fn get_all_contracts() -> Option<HashMap<String, StoredContract>> {
        let mut contract_map = HashMap::new();
        CONTRACTS_STORE.with(|contracts_store| {
            let caller_contracts = contracts_store.borrow();
            for (author, contracts) in caller_contracts.iter() {
                for contract in &contracts.stored_contracts {
                    if let StoredContract::CustomContract(custom_contract) = contract {
                        contract_map.insert(custom_contract.id.clone(), StoredContract::CustomContract(custom_contract.clone()));
                    }
                }
            }
        });
        Some(contract_map)
    }
}
