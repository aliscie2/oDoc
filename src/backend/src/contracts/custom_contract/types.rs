use candid::Principal;
use candid::{CandidType, Deserialize};
use ic_cdk::caller;
use serde::Serialize;

use crate::files_content::TableUpdates;
use crate::storage_schema::ContractId;
use crate::tables::{ContractPermissionType, Filter, Formula, PermissionType};
use crate::user_history::UserHistory;
use crate::websocket::{NoteContent, Notification, PaymentAction};
use crate::{
    validate_ccontract, validate_payment, ExchangeType, StoredContract, StoredContractVec, Wallet,
    CONTRACTS_STORE,
};

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
        let mut sender_wallet = Wallet::get(self.sender);
        if self.amount > sender_wallet.balance {
            return Err(String::from("Insufficient balance"));
        }
        if self.sender == self.receiver {
            return Err(String::from("You can't send to your self"));
        };

        let mut receiver_wallet = Wallet::get(self.receiver);
        let withdraw = ExchangeType::LocalSend;
        let deposit = ExchangeType::LocalSend;
        sender_wallet.withdraw(self.amount, self.receiver.clone().to_string(), withdraw)?;
        let _ = sender_wallet.remove_dept(self.id.clone());
        receiver_wallet.deposit(self.amount, self.sender.clone().to_string(), deposit)?;

        // ----------------- UserHistory ----------------- \\
        let mut user_history = UserHistory::get(self.sender);
        user_history.payment_action(self.clone());
        user_history.save();

        // TODO think about this later again, maybey other people should not be effect by others actions
        //  see how people respond to this
        //  Alos, we are already storing the same payment object in notifications for this users, so this can be stipulation issue in our DS
        let mut user_history = UserHistory::get(self.receiver);
        user_history.payment_action(self.clone());
        user_history.save();
        // ---------------------------------------------------

        self.status = PaymentStatus::Released;

        // ---------------- handle notifications ----------------\\
        UserHistory::get(self.sender).payment_action(self.clone());

        let content = NoteContent::CPaymentContract(self.clone(), PaymentAction::Released);
        let new_notification = Notification {
            id: self.id.clone(),
            sender: caller(),
            receiver: self.receiver,
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
    pub fn update_name(mut self, new_name: String) -> Result<Self, String> {
        validate_ccontract(&self, None, None, "update_name")?;
        self.name = new_name;
        Ok(self)
    }

    pub fn update_permissions(
        mut self,
        new_permissions: Vec<ContractPermissionType>,
    ) -> Result<Self, String> {
        validate_ccontract(&self, None, None, "update_permissions")?;
        self.permissions = new_permissions;
        Ok(self)
    }

    pub fn reorder_promises(
        mut self,
        promises_indexes: Vec<(usize, String)>,
    ) -> Result<Self, String> {
        validate_ccontract(&self, None, None, "reorder_promises")?;

        // Create a new vector to hold reordered promises
        let mut reordered_promises = vec![None; self.promises.len()];
        let mut used_positions = std::collections::HashSet::new();

        // First pass: place promises at specified indexes
        for (new_index, promise_id) in &promises_indexes {
            // Validate the new index
            if *new_index >= self.promises.len() {
                return Err(format!(
                    "Index {} is out of bounds for promises vector of length {}",
                    new_index,
                    self.promises.len()
                ));
            }

            // Check if position is already used
            if used_positions.contains(new_index) {
                return Err(format!("Index {} is specified multiple times", new_index));
            }

            // Find the promise with the given ID
            if let Some(promise_index) = self.promises.iter().position(|p| p.id == *promise_id) {
                let promise = self.promises[promise_index].clone();
                reordered_promises[*new_index] = Some(promise);
                used_positions.insert(*new_index);
            }
        }

        // Second pass: fill remaining positions with unspecified promises
        let specified_ids: std::collections::HashSet<String> =
            promises_indexes.iter().map(|(_, id)| id.clone()).collect();

        let remaining_promises: Vec<CPayment> = self
            .promises
            .into_iter()
            .filter(|p| !specified_ids.contains(&p.id))
            .collect();

        let mut remaining_iter = remaining_promises.into_iter();

        // Fill empty positions with remaining promises
        for i in 0..reordered_promises.len() {
            if reordered_promises[i].is_none() {
                if let Some(promise) = remaining_iter.next() {
                    reordered_promises[i] = Some(promise);
                }
            }
        }

        // Convert Option<CPayment> back to CPayment vector
        self.promises = reordered_promises.into_iter().flatten().collect();

        // Save the updated contract
        // self.save()?;
        Ok(self)
    }

    pub fn update_or_create_table(mut self, table_update: TableUpdates) -> Result<Self, String> {
        validate_ccontract(&self, None, None, "create_table")?;

        // Find existing contract (table) or create new one
        if let Some(index) = self.contracts.iter().position(|c| c.id == table_update.id) {
            // Update existing table
            self.update_existing_table(index, table_update)?;
        } else {
            // Create new table
            self.create_new_table(table_update)?;
        }

        // Save the updated contract
        // self.save()?;
        Ok(self)
    }

    pub fn delete_table(mut self, table_id: String) -> Result<Self, String> {
        validate_ccontract(&self, None, None, "delete_contract")?;
        // Check if table exists
        if !self.contracts.iter().any(|c| c.id == table_id) {
            return Err(String::from("Table not found"));
        }

        // Remove the table
        self.contracts.retain(|c| c.id != table_id);

        // Save the updated contract
        // self.save()?;
        Ok(self)
    }

    // Helper functions for table operations
    fn update_existing_table(
        &mut self,
        table_index: usize,
        table_update: TableUpdates,
    ) -> Result<(), String> {
        let table = &mut self.contracts[table_index];

        // Update basic info
        table.name = table_update.name;

        // Process column deletions first
        for column_id in &table_update.delete_columns {
            // Get the field name before deletion
            let field_name = table
                .columns
                .iter()
                .find(|c| c.id == *column_id)
                .map(|c| c.field.clone());

            // Remove the column
            table.columns.retain(|c| c.id != *column_id);

            // Remove cells with this field from all rows
            if let Some(field) = field_name {
                for row in &mut table.rows {
                    row.cells.retain(|cell| cell.field != field);
                }
            }
        }

        // Process row deletions
        for row_id in &table_update.delete_rows {
            table.rows.retain(|r| r.id != *row_id);
        }

        // Update or add columns
        for new_column in table_update.columns {
            if let Some(index) = table.columns.iter().position(|c| c.id == new_column.id) {
                table.columns[index] = new_column;
            } else {
                table.columns.push(new_column);
            }
        }

        // Update or add rows
        for new_row in table_update.rows {
            if let Some(index) = table.rows.iter().position(|r| r.id == new_row.id) {
                table.rows[index] = new_row;
            } else {
                table.rows.push(new_row);
            }
        }

        // Handle column reordering
        if !table_update.columns_indexes.is_empty() {
            // Create a new vector to hold reordered columns
            let mut reordered_columns = vec![None; table.columns.len()];
            let mut used_positions = std::collections::HashSet::new();

            // First pass: place columns at specified indexes
            for (new_index, column_id) in &table_update.columns_indexes {
                // Validate the new index
                if *new_index >= table.columns.len() {
                    return Err(format!(
                        "Index {} is out of bounds for columns vector of length {}",
                        new_index,
                        table.columns.len()
                    ));
                }

                // Check if position is already used
                if used_positions.contains(new_index) {
                    return Err(format!(
                        "Column index {} is specified multiple times",
                        new_index
                    ));
                }

                // Find the column with the given ID
                if let Some(column_index) = table.columns.iter().position(|c| c.id == *column_id) {
                    let column = table.columns[column_index].clone();
                    reordered_columns[*new_index] = Some(column);
                    used_positions.insert(*new_index);
                } else {
                    return Err(format!("Column with ID {} not found", column_id));
                }
            }

            // Second pass: fill remaining positions with unspecified columns
            let specified_ids: std::collections::HashSet<String> = table_update
                .columns_indexes
                .iter()
                .map(|(_, id)| id.clone())
                .collect();

            let remaining_columns: Vec<CColumn> = table
                .columns
                .clone()
                .into_iter()
                .filter(|c| !specified_ids.contains(&c.id))
                .collect();

            let mut remaining_iter = remaining_columns.into_iter();

            // Fill empty positions with remaining columns
            for i in 0..reordered_columns.len() {
                if reordered_columns[i].is_none() {
                    if let Some(column) = remaining_iter.next() {
                        reordered_columns[i] = Some(column);
                    }
                }
            }

            // Convert Option<CColumn> back to CColumn vector
            table.columns = reordered_columns.into_iter().flatten().collect();
        }

        // Handle row reordering
        if !table_update.rows_indexes.is_empty() {
            // Create a new vector to hold reordered rows
            let mut reordered_rows = vec![None; table.rows.len()];
            let mut used_positions = std::collections::HashSet::new();

            // First pass: place rows at specified indexes
            for (new_index, row_id) in &table_update.rows_indexes {
                // Validate the new index
                if *new_index >= table.rows.len() {
                    return Err(format!(
                        "Index {} is out of bounds for rows vector of length {}",
                        new_index,
                        table.rows.len()
                    ));
                }

                // Check if position is already used
                if used_positions.contains(new_index) {
                    return Err(format!(
                        "Row index {} is specified multiple times",
                        new_index
                    ));
                }

                // Find the row with the given ID
                if let Some(row_index) = table.rows.iter().position(|r| r.id == *row_id) {
                    let row = table.rows[row_index].clone();
                    reordered_rows[*new_index] = Some(row);
                    used_positions.insert(*new_index);
                } else {
                    return Err(format!("Row with ID {} not found", row_id));
                }
            }

            // Second pass: fill remaining positions with unspecified rows
            let specified_ids: std::collections::HashSet<String> = table_update
                .rows_indexes
                .iter()
                .map(|(_, id)| id.clone())
                .collect();

            let remaining_rows: Vec<CRow> = table
                .rows
                .clone()
                .into_iter()
                .filter(|r| !specified_ids.contains(&r.id))
                .collect();

            let mut remaining_iter = remaining_rows.into_iter();

            // Fill empty positions with remaining rows
            for i in 0..reordered_rows.len() {
                if reordered_rows[i].is_none() {
                    if let Some(row) = remaining_iter.next() {
                        reordered_rows[i] = Some(row);
                    }
                }
            }

            // Convert Option<CRow> back to CRow vector
            table.rows = reordered_rows.into_iter().flatten().collect();
        }

        Ok(())
    }

    fn create_new_table(&mut self, table_update: TableUpdates) -> Result<(), String> {
        let new_contract = CContract {
            id: table_update.id,
            name: table_update.name,
            columns: table_update.columns,
            rows: table_update.rows,
            creator: caller(),
            date_created: ic_cdk::api::time() as f64,
        };

        self.contracts.push(new_contract);
        Ok(())
    }

    pub fn update_or_create_promise(mut self, mut payment: CPayment) -> Result<Self, String> {
        self.validate_promise_permissions(&payment)?;

        if let Some(old_payment) = self.promises.iter().find(|p| p.id == payment.id) {
            validate_payment(&payment, Some(old_payment), "update")?;
            self.handle_payment_status_change(old_payment.clone(), &mut payment)?;
        } else {
            validate_payment(&payment, None, "create")?;
            self.create_new_promise(&mut payment)?;
            self.handle_new_payment_status(&mut payment)?;
        }

        Ok(self)
    }

    pub fn delete_promise(mut self, promise_id: String) -> Result<Self, String> {
        let promise_to_delete = self
            .promises
            .iter()
            .find(|p| p.id == promise_id)
            .ok_or_else(|| String::from("Promise not found"))?
            .clone();

        // Use both validation methods for comprehensive checking
        validate_payment(&promise_to_delete, None, "delete")?;
        self.validate_promise_deletion(&promise_to_delete)?;

        let wallet = Wallet::get(caller());
        let _ = wallet.remove_dept(promise_to_delete.id.clone());
        self.promises.retain(|p| p.id != promise_id);
        self.notify_promise_deletion(&promise_to_delete)?;

        Ok(self)
    }

    // Private helper methods

    fn validate_promise_permissions(&self, payment: &CPayment) -> Result<(), String> {
        // Check if caller is involved in this payment
        if payment.sender != caller() && payment.receiver != caller() {
            return Err(String::from(
                "You are not authorized to modify this payment",
            ));
        }
        Ok(())
    }

    fn handle_payment_status_change(
        &mut self,
        old_payment: CPayment,
        new_payment: &mut CPayment,
    ) -> Result<(), String> {
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
                self.send_payment_notification_with_old(
                    &released_payment,
                    PaymentAction::Released,
                    Some(old_payment.clone()),
                )?;
            }

            PaymentStatus::Confirmed => {
                // Only receiver can confirm payment
                if new_payment.receiver != caller_principal {
                    return Err(String::from("Only receiver can confirm payment"));
                }

                self.update_promise_in_vector(new_payment.clone());
                // Notify sender about confirmation
                self.send_payment_notification_with_old(
                    new_payment,
                    PaymentAction::Accepted,
                    Some(old_payment.clone()),
                )?;
            }

            PaymentStatus::ApproveHighPromise => {
                // Only receiver can approve high promise
                if new_payment.receiver != caller_principal {
                    return Err(String::from("Only receiver can approve high promise"));
                }

                self.update_promise_in_vector(new_payment.clone());
                // Notify sender about approval
                self.send_payment_notification_with_old(
                    new_payment,
                    PaymentAction::Accepted,
                    Some(old_payment.clone()),
                )?;
            }

            PaymentStatus::Objected(_) => {
                // Only receiver can object to payment
                if new_payment.receiver != caller_principal {
                    return Err(String::from("Only receiver can object to payment"));
                }

                self.update_promise_in_vector(new_payment.clone());
                // Notify sender about objection
                self.send_payment_notification_with_old(
                    new_payment,
                    PaymentAction::Objected,
                    Some(old_payment.clone()),
                )?;
            }

            PaymentStatus::RequestCancellation => {
                // Only sender can request cancellation
                if new_payment.sender != caller_principal {
                    return Err(String::from("Only sender can request cancellation"));
                }

                // Can only request cancellation for confirmed or approved promises
                if !matches!(
                    old_payment.status,
                    PaymentStatus::Confirmed | PaymentStatus::ApproveHighPromise
                ) {
                    return Err(String::from(
                        "You can only request cancellation for confirmed or approved promises",
                    ));
                }

                self.update_promise_in_vector(new_payment.clone());
                // Notify receiver about cancellation request
                self.send_payment_notification_with_old(
                    new_payment,
                    PaymentAction::RequestCancellation(new_payment.clone()),
                    Some(old_payment.clone()),
                )?;
            }

            PaymentStatus::ConfirmedCancellation => {
                // Only receiver can confirm cancellation
                if new_payment.receiver != caller_principal {
                    return Err(String::from("Only receiver can confirm cancellation"));
                }

                // Remove debt from sender's wallet
                let sender_wallet = Wallet::get(new_payment.sender);
                let _ = sender_wallet.remove_dept(new_payment.id.clone());

                self.update_promise_in_vector(new_payment.clone());
                // Notify sender about confirmed cancellation
                self.send_payment_notification_with_old(
                    new_payment,
                    PaymentAction::Cancelled,
                    Some(old_payment.clone()),
                )?;
            }

            PaymentStatus::HighPromise => {
                // Only sender can create high promise
                if new_payment.sender != caller_principal {
                    return Err(String::from("Only sender can create high promise"));
                }

                self.update_promise_in_vector(new_payment.clone());
                // Notify receiver about high promise
                self.send_payment_notification_with_old(
                    new_payment,
                    PaymentAction::Promise,
                    Some(old_payment.clone()),
                )?;
            }

            PaymentStatus::None => {
                // General status update - only notify if there are actual changes
                self.update_promise_in_vector(new_payment.clone());
                // Notify the other party about update with old payment for comparison
                self.send_payment_notification_with_old(
                    new_payment,
                    PaymentAction::Update,
                    Some(old_payment.clone()),
                )?;
            }
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
            }

            PaymentStatus::Confirmed
            | PaymentStatus::ApproveHighPromise
            | PaymentStatus::Objected(_) => {
                // These statuses can only be set by receiver after creation
                return Err(String::from("Invalid status for new payment creation"));
            }

            _ => {
                // Add to promises for all other statuses
                self.promises.push(payment.clone());

                // Determine appropriate action for new promise
                let action = match payment.status {
                    PaymentStatus::HighPromise => PaymentAction::Promise,
                    PaymentStatus::RequestCancellation => {
                        PaymentAction::RequestCancellation(payment.clone())
                    }
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

    fn send_payment_notification(
        &self,
        payment: &CPayment,
        action: PaymentAction,
    ) -> Result<(), String> {
        use crate::contracts::custom_contract::utils::notify_about_promise;

        // Use the improved notification system that handles is_seen properly
        notify_about_promise(payment.clone(), action);

        // Record action in user history
        UserHistory::get(caller()).payment_action(payment.clone());

        Ok(())
    }

    fn send_payment_notification_with_old(
        &self,
        payment: &CPayment,
        action: PaymentAction,
        old_payment: Option<CPayment>,
    ) -> Result<(), String> {
        use crate::contracts::custom_contract::utils::notify_about_promise_with_old_payment;

        // Use the improved notification system that compares with old payment
        notify_about_promise_with_old_payment(payment.clone(), action, old_payment);

        // Record action in user history
        UserHistory::get(caller()).payment_action(payment.clone());

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
            PaymentStatus::Confirmed | PaymentStatus::ApproveHighPromise => Err(String::from(
                "Cannot delete confirmed promises. Use cancellation process instead",
            )),
            PaymentStatus::Released => Err(String::from("Released payments cannot be deleted")),
            PaymentStatus::ConfirmedCancellation => {
                Err(String::from("Already cancelled promises cannot be deleted"))
            }
            _ => Ok(()),
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
            promise.receiver,
            NoteContent::CPaymentContract(cancelled_promise, PaymentAction::Cancelled),
        );

        notification.save();

        Ok(())
    }

    fn generate_payment_id(&self) -> String {
        self.id
            .strip_prefix("fresh_promise_")
            .unwrap_or(&self.id)
            .to_string()
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
            .cloned()
    }

    pub fn get(id: &String, creator: &String) -> Option<Self> {
        CONTRACTS_STORE.with(|contracts_store| {
            let caller_contracts = contracts_store.borrow();
            let stored_contract_vec = caller_contracts.get(creator)?.stored_contracts.clone();

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
            if let Some(caller_contracts_map) = caller_contracts.get(&self.creator) {
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

            if let Some(caller_contracts_map) = caller_contracts.get(&self.creator) {
                new_map
                    .stored_contracts
                    .extend(caller_contracts_map.stored_contracts.clone());
            }

            // Remove any existing contract with the same ID
            new_map.stored_contracts.retain(|contract| match contract {
                StoredContract::CustomContract(contract) => contract.id != self.id,
                _ => true,
            });

            // Add the current contract
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
