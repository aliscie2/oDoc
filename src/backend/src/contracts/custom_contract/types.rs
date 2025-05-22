use std::collections::HashMap;

use candid::Principal;
use candid::{CandidType, Deserialize};
use ic_cdk::{call, caller};
use serde::Serialize;

use crate::contracts::custom_contract::utils::notify_about_promise;
use crate::storage_schema::ContractId;
use crate::tables::{Column, ContractPermissionType, Execute, Filter, Formula, PermissionType};
use crate::user_history::UserHistory;
use crate::websocket::{NoteContent, Notification, PaymentAction};
use crate::{ExchangeType, StoredContract, StoredContractVec, Wallet, CONTRACTS_STORE};

// make me a function of list of days

#[derive(PartialOrd, PartialEq, Clone, Debug, CandidType, Deserialize, Serialize)]
pub struct CColumn {
    pub id: String,
    pub editable: bool,
    pub field: String,
    pub name: String,
    pub deletable: bool,
    pub column_type: String,
    pub formula_string: String,
    pub filters: Vec<Filter>,
    pub permissions: Vec<PermissionType>,
}

#[derive(Eq, PartialOrd, PartialEq, Clone, Debug, CandidType, Deserialize, Serialize)]
pub(crate) struct CCell {
    pub value: String,
    pub field: String,
    pub id: String,
    // pub index: u64,
}

#[derive(Eq, PartialOrd, PartialEq, Clone, Debug, CandidType, Deserialize, Serialize)]
pub struct CRow {
    pub cells: Vec<CCell>,
    pub id: String,
}

#[derive(PartialOrd, PartialEq, Clone, Debug, CandidType, Deserialize, Serialize)]
pub struct ContractError {
    pub message: String,
    // pub payment: CPayment,
}

#[derive(PartialOrd, PartialEq, Clone, Debug, CandidType, Deserialize, Serialize)]
pub struct CContract {
    pub id: String,
    pub name: String,
    pub columns: Vec<CColumn>,
    pub rows: Vec<CRow>,
    pub creator: Principal,
    pub date_created: f64,
    // pub rows: Vec<HashMap<String, String>>
}

#[derive(PartialOrd, PartialEq, Clone, Debug, CandidType, Deserialize, Serialize)]
pub enum PaymentStatus {
    Released,
    Confirmed,
    ConfirmedCancellation,
    RequestCancellation,
    HighPromise,
    ApproveHighPromise,
    // when ApproveHighPromise the user can't withdraw the payment at all
    Objected(String),
    None,
}
// pub struct Promise {
//     pub contract_id: ContractId,
//     pub id: String,
//     pub amount: f64,
//     pub condition: "Test",
//     pub sender: Principal,
//     pub receiver: Principal,
//     pub date_created: f64,
//     pub date_released: f64,
//     pub status: PaymentStatus,
//     pub cells: Vec<CCell>,
//     pub wdithnesses: {id:, conformed: {sender:true, reciver: true, widtness: true }}
// }

#[derive(PartialOrd, PartialEq, Clone, Debug, CandidType, Deserialize, Serialize)]
pub struct CPayment {
    pub contract_id: ContractId,
    pub id: String,
    pub amount: f64,
    pub sender: Principal,
    pub receiver: Principal,
    pub date_created: f64,
    pub date_released: f64,
    // pub date_updated: f64,
    pub status: PaymentStatus,
    pub cells: Vec<CCell>,
    // pub columns: Vec<CCell>,
    //TODO
    // pub other_columns: Vec<Column>,
    // Note if released == false then it is a promise not a payment
    // Note if conformed == true then the receiver is claiming the promos
    // Note if conformed == true the the promos should be protected and updatable.
}

impl CPayment {
    pub fn default() -> Self {
        Self {
            contract_id: ContractId::default(),
            id: "".to_string(),
            amount: 0.0,
            sender: Principal::anonymous(),
            receiver: Principal::anonymous(),
            date_created: 0.0,
            date_released: 0.0,
            status: PaymentStatus::None,
            cells: vec![],
        }
    }
    pub fn pay(mut self) -> Result<Self, String> {
        let mut sender_wallet = Wallet::get(self.sender.clone());
        if self.amount > sender_wallet.balance {
            return Err(String::from("Insufficient balance"));
        }
        if self.sender == self.receiver {
            return Err(String::from("You can't send to your self"));
        };

        let mut receiver_wallet = Wallet::get(self.receiver.clone());
        let withdraw = ExchangeType::LocalSend;
        let deposit = ExchangeType::LocalSend;
        sender_wallet.withdraw(
            self.amount.clone(),
            self.receiver.clone().to_string(),
            withdraw,
        )?;
        let _ = sender_wallet.remove_dept(self.id.clone());
        receiver_wallet.deposit(self.amount, self.sender.clone().to_string(), deposit)?;

        // ----------------- UserHistory ----------------- \\
        let mut user_history = UserHistory::get(self.sender.clone());
        user_history.payment_action(self.clone());
        user_history.save();

        // TODO think about this later again, maybey other people should not be effect by others actions
        //  see how people respond to this
        //  Alos, we are already storing the same payment object in notifications for this users, so this can be stipulation issue in our DS
        let mut user_history = UserHistory::get(self.receiver.clone());
        user_history.payment_action(self.clone());
        user_history.save();
        // ---------------------------------------------------

        self.status = PaymentStatus::Released;

        // ---------------- handle notifications ----------------\\
        UserHistory::get(self.sender.clone()).payment_action(self.clone());

        let content = NoteContent::CPaymentContract(self.clone(), PaymentAction::Released);
        let new_notification = Notification {
            id: self.id.clone(),
            sender: caller(),
            receiver: self.receiver.clone(),
            content,
            is_seen: false,
            time: ic_cdk::api::time() as f64,
        };
        new_notification.save();

        Ok(self.clone())
    }
}

#[derive(PartialOrd, PartialEq, Clone, Debug, CandidType, Deserialize, Serialize)]
pub struct CustomContract {
    pub id: String,
    pub name: String,
    pub creator: String,
    pub date_created: f64,
    pub date_updated: f64,
    pub contracts: Vec<CContract>,
    pub payments: Vec<CPayment>,
    pub promises: Vec<CPayment>,
    pub formulas: Vec<Formula>,
    pub permissions: Vec<ContractPermissionType>,
}

impl CColumn {
    pub fn can_update(&self) -> bool {
        self.permissions.contains(&PermissionType::Edit(caller()))
            || self.permissions.contains(&PermissionType::AnyOneEdite)
    }
}

impl CustomContract {
   
    pub fn updaet_or_create_promise(&self, payment: CPayment) -> Result<Self, String> {

        UserHistory::get(caller()).payment_action(payment.clone());
        let mut wallet: Wallet = Wallet::get(caller());
        
        if self.promises.some(|p| p.id == payment.id) {
            // create 
            return Ok(self)
        } else {
            // update
            wallet.check_dept(payment.amount)?
        }

        self.promises.push(new_payment.clone());
        Ok(self)
    }
    pub fn check_view_permission(&self) -> Self {
        if self.creator == caller().to_string() {
            return self.clone();
        };
        let mut new_contract = self.clone();
        new_contract.contracts = new_contract
            .contracts
            .iter()
            .map(|contract| {
                let mut new_contract = contract.clone();
                new_contract.columns = new_contract
                    .columns
                    .iter()
                    .filter(|column| {
                        column
                            .permissions
                            .iter()
                            .any(|permission| match permission {
                                PermissionType::View(principal) => principal == &caller(),
                                PermissionType::AnyOneView => true,
                                _ => false,
                            })
                    })
                    .cloned()
                    .collect();
                new_contract.rows = new_contract
                    .rows
                    .iter()
                    .map(|row| {
                        let mut new_row = row.clone();
                        new_row.cells = new_row
                            .cells
                            .iter()
                            .filter(|cell| {
                                new_contract
                                    .columns
                                    .iter()
                                    .any(|column| column.field == cell.field)
                            })
                            .cloned()
                            .collect();
                        new_row
                    })
                    .collect();
                new_contract
            })
            .collect();
        new_contract
    }


    pub fn get_column(&self, field: &String) -> Option<CColumn> {
        let mut columns = vec![];
        for contract in self.contracts.clone() {
            columns.extend(contract.columns);
        }
        columns
            .iter()
            .find(|column| &column.field == field)
            .map(|column| column.clone())
    }

    pub fn get(id: &String, creator: &String) -> Option<Self> {
        CONTRACTS_STORE.with(|contracts_store| {
            let caller_contracts = contracts_store.borrow();
            let stored_contract_vec = caller_contracts.get(&creator)?.stored_contracts.clone();
            if let Some(contract) = stored_contract_vec.iter().find(|contract| match contract {
                StoredContract::CustomContract(contract) => contract.id == *id,
                _ => false,
            }) {
                match contract {
                    StoredContract::CustomContract(contract) => Some(contract.clone()),
                    _ => None,
                }
            } else {
                None
            }
        })
    }

    pub fn get_for_user(id: String, user: Principal) -> Option<Self> {
        CONTRACTS_STORE.with(|contracts_store| {
            let caller_contracts = contracts_store.borrow();
            let stored_contract_vec = caller_contracts
                .get(&user.to_string())?
                .stored_contracts
                .clone();

            // Directly find the contract in the vector
            stored_contract_vec
                .into_iter()
                .find_map(|contract| match contract {
                    StoredContract::CustomContract(c) if c.id == id => Some(c),
                    _ => None,
                })
        })
    }

    pub fn delete(mut self) -> Result<(), String> {
        if caller().to_string() != self.creator {
            return Err("You can't delete other people's contract".to_string());
        }
        if let Some(old_contract) = Self::get(&self.id, &self.creator.clone()) {
            self.payments = old_contract.payments.clone();
            self.promises = old_contract.promises.clone();
            self.contracts = vec![];
        }

        for promise in self.promises.clone() {
            if promise.status == PaymentStatus::Confirmed {
                return Err("Contract with unreleased promises can't be deleted".to_string());
            }
            let wallet = Wallet::get(caller());
            let _ = wallet.remove_dept(promise.id.clone());
            self.promises.retain(|p| p.id != promise.id);
        }

        CONTRACTS_STORE.with(|contracts_store| {
            let mut caller_contracts = contracts_store.borrow_mut();
            let mut new_map = StoredContractVec {
                stored_contracts: vec![StoredContract::CustomContract(self.clone())],
            };
            if let Some(mut caller_contracts_map) = caller_contracts.get(&self.creator) {
                new_map
                    .stored_contracts
                    .extend(caller_contracts_map.stored_contracts.clone());
            }
            // new_map.stored_contracts.push(StoredContract::CustomContract(self.clone()));
            new_map.stored_contracts.retain(|contract| match contract {
                StoredContract::CustomContract(contract) => contract.id != self.id,
                _ => true,
            });
            caller_contracts.insert(self.creator, new_map);
        });

        Ok(())
    }
    pub fn save(&self) -> Result<Self, String> {
        CONTRACTS_STORE.with(|contracts_store| {
            let mut caller_contracts = contracts_store.borrow_mut();
            let mut new_map = StoredContractVec {
                stored_contracts: vec![StoredContract::CustomContract(self.clone())],
            };
            if let Some(mut caller_contracts_map) = caller_contracts.get(&self.creator) {
                new_map
                    .stored_contracts
                    .extend(caller_contracts_map.stored_contracts.clone());
                // let mut caller_contracts_map = caller_contracts.get(&self.creator.to_text()).unwrap();
                // caller_contracts_map.stored_contracts.push(StoredContract::CustomContract(self.clone()));
            }
            new_map.stored_contracts.retain(|contract| match contract {
                StoredContract::CustomContract(contract) => contract.id != self.id,
                _ => true,
            });
            new_map
                .stored_contracts
                .push(StoredContract::CustomContract(self.clone()));
            caller_contracts.insert(self.creator.clone(), new_map);

            // if let Some(mut caller_contracts_map) = caller_contracts.get(&self.creator.to_text()) {
            //     let mut caller_contracts_map = caller_contracts.get(&self.creator.to_text()).unwrap();
            //     caller_contracts_map.stored_contracts.push(StoredContract::CustomContract(self.clone()));
            // } else {
            //     let new_map = StoredContractVec { stored_contracts: vec![StoredContract::CustomContract(self.clone())] };
            //     caller_contracts.insert(self.creator.to_text(), new_map);
            // }
            // let mut caller_contracts_map = caller_contracts.get(&self.creator.to_text()).or_else(|| {
            //     let new_map = StoredContractVec { stored_contracts: vec![] };
            //     caller_contracts.insert(self.creator.to_text(), new_map.clone());
            //     Some(new_map)
            // }).unwrap();
            // caller_contracts_map.stored_contracts.push(StoredContract::CustomContract(self.clone()));
        });
        Ok(self.clone())
    }
    

}
