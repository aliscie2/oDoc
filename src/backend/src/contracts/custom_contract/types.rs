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
   

    pub fn update_or_create_promise(mut self, mut payment: CPayment) -> Result<Self, String> {
        // Basic validations
        self.validate_promise_permissions(&payment)?;
        
        if let Some(old_payment) = self.promises.iter().find(|p| p.id == payment.id) {
            // UPDATE existing promise
            self.handle_payment_status_change(old_payment.clone(), &mut payment)?;
        } else {
            // CREATE new promise
            self.create_new_promise(&mut payment)?;
            self.handle_new_payment_status(&mut payment)?;
        }

        // Save the updated contract
        self.save()?;
        
        Ok(self)
    }

    pub fn delete_promise(mut self, promise_id: String) -> Result<Self, String> {
        let promise_to_delete = self.promises.iter()
            .find(|p| p.id == promise_id)
            .ok_or_else(|| String::from("Promise not found"))?
            .clone();

        // Validate deletion permissions
        self.validate_promise_deletion(&promise_to_delete)?;

        // Clean up wallet debt
        let wallet = Wallet::get(caller());
        let _ = wallet.remove_dept(promise_to_delete.id.clone());

        // Remove promise from vector
        self.promises.retain(|p| p.id != promise_id);

        // Send deletion notification
        self.notify_promise_deletion(&promise_to_delete)?;

        // Save the updated contract
        self.save()?;

        Ok(self)
    }

    // Private helper methods
    
    fn validate_promise_permissions(&self, payment: &CPayment) -> Result<(), String> {
        // Check if caller is involved in this payment
        if payment.sender != caller() && payment.receiver != caller() {
            return Err(String::from("You are not authorized to modify this payment"));
        }
        Ok(())
    }

    fn handle_payment_status_change(&mut self, old_payment: CPayment, new_payment: &mut CPayment) -> Result<(), String> {
        let caller_principal = caller();
        
        match new_payment.status {
            PaymentStatus::Released => {
                // Only sender can release payment
                if new_payment.sender != caller_principal {
                    return Err(String::from("Only sender can release payment"));
                }
                
                // Process the payment and move to payments vector
                let released_payment = new_payment.clone().pay()?;
                self.promises.retain(|p| p.id != released_payment.id);
                self.payments.push(released_payment.clone());
                
                // Notify receiver about payment release
                self.send_payment_notification(&released_payment, PaymentAction::Released)?;
            },
            
            PaymentStatus::Confirmed => {
                // Only receiver can confirm payment
                if new_payment.receiver != caller_principal {
                    return Err(String::from("Only receiver can confirm payment"));
                }
                
                self.update_promise_in_vector(new_payment.clone());
                // Notify sender about confirmation
                self.send_payment_notification(new_payment, PaymentAction::Accepted)?;
            },
            
            PaymentStatus::ApproveHighPromise => {
                // Only receiver can approve high promise
                if new_payment.receiver != caller_principal {
                    return Err(String::from("Only receiver can approve high promise"));
                }
                
                self.update_promise_in_vector(new_payment.clone());
                // Notify sender about approval
                self.send_payment_notification(new_payment, PaymentAction::Accepted)?;
            },
            
            PaymentStatus::Objected(_) => {
                // Only receiver can object to payment
                if new_payment.receiver != caller_principal {
                    return Err(String::from("Only receiver can object to payment"));
                }
                
                self.update_promise_in_vector(new_payment.clone());
                // Notify sender about objection
                self.send_payment_notification(new_payment, PaymentAction::Objected)?;
            },
            
            PaymentStatus::RequestCancellation => {
                // Only sender can request cancellation
                if new_payment.sender != caller_principal {
                    return Err(String::from("Only sender can request cancellation"));
                }
                
                // Can only request cancellation for confirmed or approved promises
                if !matches!(old_payment.status, PaymentStatus::Confirmed | PaymentStatus::ApproveHighPromise) {
                    return Err(String::from("You can only request cancellation for confirmed or approved promises"));
                }
                
                self.update_promise_in_vector(new_payment.clone());
                // Notify receiver about cancellation request
                self.send_payment_notification(new_payment, PaymentAction::RequestCancellation(new_payment.clone()))?;
            },
            
            PaymentStatus::ConfirmedCancellation => {
                // Only receiver can confirm cancellation
                if new_payment.receiver != caller_principal {
                    return Err(String::from("Only receiver can confirm cancellation"));
                }
                
                // Remove debt from sender's wallet
                let sender_wallet = Wallet::get(new_payment.sender.clone());
                let _ = sender_wallet.remove_dept(new_payment.id.clone());
                
                self.update_promise_in_vector(new_payment.clone());
                // Notify sender about confirmed cancellation
                self.send_payment_notification(new_payment, PaymentAction::Cancelled)?;
            },
            
            PaymentStatus::HighPromise => {
                // Only sender can create high promise
                if new_payment.sender != caller_principal {
                    return Err(String::from("Only sender can create high promise"));
                }
                
                self.update_promise_in_vector(new_payment.clone());
                // Notify receiver about high promise
                self.send_payment_notification(new_payment, PaymentAction::Promise)?;
            },
            
            PaymentStatus::None => {
                // General status update
                self.update_promise_in_vector(new_payment.clone());
                // Notify the other party about update
                self.send_payment_notification(new_payment, PaymentAction::Update)?;
            },
        }
        
        Ok(())
    }

    fn handle_new_payment_status(&mut self, payment: &mut CPayment) -> Result<(), String> {
        match payment.status {
            PaymentStatus::Released => {
                // New payment that's immediately released
                let released_payment = payment.clone().pay()?;
                self.payments.push(released_payment.clone());
                
                // Notify receiver about immediate release
                self.send_payment_notification(&released_payment, PaymentAction::Released)?;
            },
            
            PaymentStatus::Confirmed | PaymentStatus::ApproveHighPromise | PaymentStatus::Objected(_) => {
                // These statuses can only be set by receiver after creation
                return Err(String::from("Invalid status for new payment creation"));
            },
            
            _ => {
                // Add to promises for all other statuses
                self.promises.push(payment.clone());
                
                // Determine appropriate action for new promise
                let action = match payment.status {
                    PaymentStatus::HighPromise => PaymentAction::Promise,
                    PaymentStatus::RequestCancellation => PaymentAction::RequestCancellation(payment.clone()),
                    _ => PaymentAction::Promise,
                };
                
                // Notify receiver about new promise
                self.send_payment_notification(payment, action)?;
            }
        }
        
        Ok(())
    }

    fn update_promise_in_vector(&mut self, payment: CPayment) {
        if let Some(index) = self.promises.iter().position(|p| p.id == payment.id) {
            self.promises[index] = payment;
        }
    }

    fn create_new_promise(&self, payment: &mut CPayment) -> Result<(), String> {
        // Check sender's debt capacity
        let sender_wallet = Wallet::get(caller());
        sender_wallet.check_dept(payment.amount)?;
        
        // Set creation timestamp
        payment.date_created = ic_cdk::api::time() as f64;
        
        // Generate unique ID if not provided
        if payment.id.is_empty() {
            payment.id = self.generate_payment_id();
        }
        
        Ok(())
    }

    fn send_payment_notification(&self, payment: &CPayment, action: PaymentAction) -> Result<(), String> {
        let caller_principal = caller();
        
        // Determine notification recipient based on action and caller
        let recipient = if caller_principal == payment.sender {
            payment.receiver.clone()
        } else {
            payment.sender.clone()
        };

        // Create notification with unique ID
        let notification_id = format!("{}_{}", payment.id, ic_cdk::api::time());
        
        let notification = Notification::new(
            notification_id,
            recipient,
            NoteContent::CPaymentContract(payment.clone(), action),
        );
        
        // Save notification (this also sends via websocket)
        notification.save();

        // Record action in user history
        UserHistory::get(caller_principal).payment_action(payment.clone());

        Ok(())
    }

    fn validate_promise_deletion(&self, promise: &CPayment) -> Result<(), String> {
        let caller_principal = caller();
        
        // Only sender can delete their own promises
        if promise.sender != caller_principal {
            return Err(String::from("You can only delete your own promises"));
        }

        // Check if promise can be deleted based on status
        match promise.status {
            PaymentStatus::Confirmed | PaymentStatus::ApproveHighPromise => {
                Err(String::from("Cannot delete confirmed promises. Use cancellation process instead"))
            },
            PaymentStatus::Released => {
                Err(String::from("Released payments cannot be deleted"))
            },
            PaymentStatus::ConfirmedCancellation => {
                Err(String::from("Already cancelled promises cannot be deleted"))
            },
            _ => Ok(())
        }
    }

    fn notify_promise_deletion(&self, promise: &CPayment) -> Result<(), String> {
        // Create a cancelled version for notification
        let mut cancelled_promise = promise.clone();
        cancelled_promise.status = PaymentStatus::None;

        // Record deletion in user history
        UserHistory::get(caller()).payment_action(cancelled_promise.clone());

        // Notify receiver about promise deletion
        let notification_id = format!("delete_{}_{}", promise.id, ic_cdk::api::time());
        
        let notification = Notification::new(
            notification_id,
            promise.receiver.clone(),
            NoteContent::CPaymentContract(cancelled_promise, PaymentAction::Cancelled),
        );
        
        notification.save();

        Ok(())
    }

    fn generate_payment_id(&self) -> String {
        format!("payment_{}_{}", caller().to_text(), ic_cdk::api::time())
    }

    // ----------------------------
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
