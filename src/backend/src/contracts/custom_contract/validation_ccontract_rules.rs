use crate::contracts::{CContract, CustomContract};
use crate::files_content::TableUpdates;
use crate::tables::ContractPermissionType;
use candid::Principal;
use ic_cdk::caller;

pub struct CContractValidationRule {
    pub name: &'static str,
    pub validator: fn(&CustomContract, &CContract, Option<&CContract>) -> Result<(), String>,
    pub actions: &'static [&'static str],
}

impl CContractValidationRule {
    pub fn applies_to_action(&self, action: &str) -> bool {
        self.actions.contains(&action)
    }

    pub fn validate(
        &self,
        contract: &CustomContract,
        table: &CContract,
        old_table: Option<&CContract>,
    ) -> Result<(), String> {
        (self.validator)(contract, table, old_table)
    }
}

pub const CCONTRACT_VALIDATION_RULES: &[CContractValidationRule] = &[
    CContractValidationRule {
        name: "creator_can_update_name",
        validator: |contract, _table, _old| {
            if contract.creator != caller().to_string() {
                Err("Only contract creator can update contract name".to_string())
            } else {
                Ok(())
            }
        },
        actions: &["update_name"],
    },
    CContractValidationRule {
        name: "creator_can_update_permissions",
        validator: |contract, _table, _old| {
            if contract.creator != caller().to_string() {
                Err("Only contract creator can update contract permissions".to_string())
            } else {
                Ok(())
            }
        },
        actions: &["update_permissions"],
    },
    CContractValidationRule {
        name: "creator_can_reorder_promises",
        validator: |contract, _table, _old| {
            if contract.creator != caller().to_string() {
                Err("Only contract creator can reorder promises".to_string())
            } else {
                Ok(())
            }
        },
        actions: &["reorder_promises"],
    },
    CContractValidationRule {
        name: "creator_can_delete_table",
        validator: |contract, _table, _old| {
            if contract.creator != caller().to_string() {
                Err("Only contract creator can delete tables".to_string())
            } else {
                Ok(())
            }
        },
        actions: &["delete_table"],
    },
    CContractValidationRule {
        name: "has_table_edit_permission",
        validator: |contract, _table, _old| {
            let caller_principal = caller();

            if contract.creator == caller_principal.to_string() {
                return Ok(());
            }

            let has_permission = contract
                .permissions
                .iter()
                .any(|permission| match permission {
                    ContractPermissionType::Edit(principal) => principal == &caller_principal,
                    ContractPermissionType::AnyOneEdite => true,
                    _ => false,
                });

            if !has_permission {
                Err(
                    "You don't have permission to update or create tables in this contract"
                        .to_string(),
                )
            } else {
                Ok(())
            }
        },
        actions: &["create_table", "update_table"],
    },
    CContractValidationRule {
        name: "table_exists_for_delete",
        validator: |contract, table, _old| {
            if !contract.contracts.iter().any(|c| c.id == table.id) {
                Err("Table not found".to_string())
            } else {
                Ok(())
            }
        },
        actions: &["delete_table"],
    },
    CContractValidationRule {
        name: "only_creator_can_delete_contract",
        validator: |contract, _table, _old| {
            if caller().to_string() != contract.creator {
                Err("You can't delete other people's contract".to_string())
            } else {
                Ok(())
            }
        },
        actions: &["delete_contract"],
    },
    CContractValidationRule {
        name: "no_delete_with_confirmed_promises",
        validator: |contract, _table, _old| {
            use crate::contracts::PaymentStatus;

            for promise in &contract.promises {
                if promise.status == PaymentStatus::Confirmed {
                    return Err("Contract with unreleased promises can't be deleted".to_string());
                }
            }
            Ok(())
        },
        actions: &["delete_contract"],
    },
];

pub fn validate_ccontract(
    contract: &CustomContract,
    table: Option<&CContract>,
    old_table: Option<&CContract>,
    action: &str,
) -> Result<(), String> {
    let dummy_table = CContract {
        id: String::new(),
        name: String::new(),
        columns: vec![],
        rows: vec![],
        creator: caller(),
        date_created: 0.0,
    };

    let table_ref = table.unwrap_or(&dummy_table);

    for rule in CCONTRACT_VALIDATION_RULES {
        if rule.applies_to_action(action) {
            rule.validate(contract, table_ref, old_table)?;
        }
    }
    Ok(())
}
